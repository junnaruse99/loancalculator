'use client'
import { useState, useEffect, useCallback } from 'react'
import type { LoanData } from '@/types/loan'
import { DEFAULT_LOAN_DATA } from '@/types/loan'
import { buildSchedule, summarize, calcMonthlyPayment, formatCurrency } from '@/lib/calculations'
import { loadData, saveData, exportJSON, importJSON } from '@/lib/storage'
import LoanSetup from '@/components/LoanSetup'
import ExtraPayments from '@/components/ExtraPayments'
import AmortizationTable from '@/components/AmortizationTable'
import OverviewCards from '@/components/OverviewCards'

type Tab = 'setup' | 'payments' | 'table'

export default function Home() {
  const [data, setData] = useState<LoanData>(DEFAULT_LOAN_DATA)
  const [tab, setTab] = useState<Tab>('setup')
  const [hydrated, setHydrated] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setData(loadData())
    setHydrated(true)
  }, [])

  const updateData = useCallback((patch: Partial<LoanData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      saveData(next)
      return next
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importJSON(file)
      saveData(imported)
      setData(imported)
    } catch {
      alert('Error al importar el archivo.')
    }
    e.target.value = ''
  }

  const { config, recurringPayments, onetimePayments } = data

  const pmt = calcMonthlyPayment(config.principal, config.annualRate, config.termMonths)

  const baseRows = buildSchedule(config, [], [])
  const extraRows = buildSchedule(config, recurringPayments, onetimePayments)

  const baseSummary = summarize(baseRows, pmt)
  const extraSummary = summarize(extraRows, pmt)

  const hasExtra = recurringPayments.length > 0 || onetimePayments.length > 0
  const tableRows = hasExtra ? extraRows : baseRows

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'setup', label: 'Configuración' },
    { id: 'payments', label: 'Amortizaciones', count: recurringPayments.length + onetimePayments.length },
    { id: 'table', label: 'Tabla', count: tableRows.length },
  ]

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Calculadora Hipotecaria</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Simulador de amortización con pagos extra</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-emerald-600 font-medium animate-pulse">Guardado ✓</span>
            )}
            <button
              onClick={() => exportJSON(data)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors hidden sm:block"
            >
              Exportar
            </button>
            <label className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer hidden sm:block">
              Importar
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={() => {
                if (confirm('¿Reiniciar todos los datos?')) {
                  saveData(DEFAULT_LOAN_DATA)
                  setData(DEFAULT_LOAN_DATA)
                }
              }}
              className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Quick stats bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Capital</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(config.principal)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Tasa anual</p>
              <p className="text-base font-bold text-gray-900">{config.annualRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Cuota mensual</p>
              <p className="text-base font-bold text-blue-700">{formatCurrency(pmt)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Plazo</p>
              <p className="text-base font-bold text-gray-900">{config.termMonths} meses</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <OverviewCards base={baseSummary} withExtra={extraSummary} pmt={pmt} baseRows={baseRows} />

        {/* Mobile export/import */}
        <div className="flex gap-2 sm:hidden">
          <button
            onClick={() => exportJSON(data)}
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Exportar JSON
          </button>
          <label className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-center cursor-pointer">
            Importar JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  tab === t.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                    tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {tab === 'setup' && (
              <LoanSetup
                config={config}
                onChange={(c) => updateData({ config: c })}
              />
            )}

            {tab === 'payments' && (
              <ExtraPayments
                recurring={recurringPayments}
                onetime={onetimePayments}
                onUpdateRecurring={(r) => updateData({ recurringPayments: r })}
                onUpdateOnetime={(o) => updateData({ onetimePayments: o })}
                loanStartDate={config.startDate}
              />
            )}

            {tab === 'table' && (
              <AmortizationTable rows={tableRows} principal={config.principal} />
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-300">
        Los datos se guardan automáticamente en tu navegador.
      </footer>
    </div>
  )
}
