'use client'
import { useState } from 'react'
import type { LoanConfig } from '@/types/loan'

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface Props {
  config: LoanConfig
  onChange: (c: LoanConfig) => void
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function LoanSetup({ config, onChange }: Props) {
  const [termUnit, setTermUnit] = useState<'months' | 'years'>('years')

  const update = (patch: Partial<LoanConfig>) => onChange({ ...config, ...patch })

  const termDisplay = termUnit === 'years' ? Math.round(config.termMonths / 12) : config.termMonths
  const setTerm = (val: number) => update({ termMonths: termUnit === 'years' ? val * 12 : val })

  const toggleDoubleMonth = (m: number) => {
    const months = config.doubleQuotaMonths.includes(m)
      ? config.doubleQuotaMonths.filter((x) => x !== m)
      : [...config.doubleQuotaMonths, m]
    update({ doubleQuotaMonths: months })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Monto del préstamo (S/)" hint="Monto inicial de la hipoteca">
          <input
            type="number"
            value={config.principal}
            onChange={(e) => update({ principal: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="200000"
            min={0}
          />
        </Field>

        <Field label="Tasa de interés anual (%)" hint="Tasa efectiva anual (TEA) o nominal">
          <input
            type="number"
            value={config.annualRate}
            onChange={(e) => update({ annualRate: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="8.5"
            step={0.01}
            min={0}
            max={100}
          />
        </Field>

        <Field label={`Plazo (${termUnit === 'years' ? 'años' : 'meses'})`}>
          <div className="flex gap-2">
            <input
              type="number"
              value={termDisplay}
              onChange={(e) => setTerm(parseInt(e.target.value) || 0)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              min={1}
            />
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              {(['years', 'months'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setTermUnit(u)}
                  className={`px-3 py-2 transition-colors ${termUnit === u ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {u === 'years' ? 'Años' : 'Meses'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">{config.termMonths} meses en total</p>
        </Field>

        <Field label="Fecha de inicio" hint="Mes y año del primer pago">
          <input
            type="month"
            value={config.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </Field>
      </div>

      {/* Cuota doble */}
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Cuota doble</p>
            <p className="text-xs text-gray-400">Pago doble en meses específicos (ej: gratificación)</p>
          </div>
          <button
            onClick={() => update({ hasDoubleQuota: !config.hasDoubleQuota })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.hasDoubleQuota ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${config.hasDoubleQuota ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {config.hasDoubleQuota && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Selecciona los meses donde pagas cuota doble:</p>
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
              {MONTH_NAMES.map((name, i) => {
                const m = i + 1
                const active = config.doubleQuotaMonths.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleDoubleMonth(m)}
                    className={`text-xs py-1.5 rounded-md font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
