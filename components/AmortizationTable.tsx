'use client'
import { useState } from 'react'
import type { AmortizationRow } from '@/types/loan'
import { formatCurrency, formatMonth } from '@/lib/calculations'

interface Props {
  rows: AmortizationRow[]
  principal: number
}

export default function AmortizationTable({ rows, principal }: Props) {
  const [page, setPage] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const PAGE_SIZE = 24
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const displayed = showAll ? rows : rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (rows.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Configura el préstamo para ver la tabla.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">{rows.length} cuotas en total</p>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          {showAll ? 'Ver por páginas' : 'Ver todas'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left font-semibold text-gray-600">#</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600">Saldo inicial</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600">Cuota</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600">Interés</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600">Capital</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600">Extra</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-600">Saldo final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map((row) => {
              const pct = (row.endBalance / principal) * 100
              const isHighlight = row.isDoubleQuota || row.extraPayment > 0
              return (
                <tr
                  key={row.monthNumber}
                  className={`transition-colors ${
                    row.isDoubleQuota && row.extraPayment > 0
                      ? 'bg-purple-50'
                      : row.isDoubleQuota
                      ? 'bg-amber-50'
                      : row.extraPayment > 0
                      ? 'bg-emerald-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-2 text-gray-500">
                    {row.monthNumber}
                    {row.isDoubleQuota && <span className="ml-1 text-amber-600 font-bold">×2</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{formatMonth(row.date)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(row.startBalance)}</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(row.scheduledPayment)}</td>
                  <td className="px-3 py-2 text-right text-red-600">{formatCurrency(row.interest)}</td>
                  <td className="px-3 py-2 text-right text-blue-700">{formatCurrency(row.principal)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700 font-medium">
                    {row.extraPayment > 0 ? formatCurrency(row.extraPayment) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden sm:block w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`font-medium ${row.endBalance < 1 ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {row.endBalance < 1 ? 'Pagado' : formatCurrency(row.endBalance)}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block" /> Cuota doble</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" /> Amortización extra</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-100 border border-purple-200 inline-block" /> Ambos</span>
      </div>

      {/* Pagination */}
      {!showAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ‹ Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  )
}
