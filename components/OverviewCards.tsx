'use client'
import { formatCurrency, formatMonths, formatMonthLong } from '@/lib/calculations'
import type { LoanSummary } from '@/types/loan'

import type { AmortizationRow } from '@/types/loan'

interface Props {
  base: LoanSummary
  withExtra: LoanSummary
  pmt: number
  baseRows: AmortizationRow[]
}

function StatCard({
  label,
  value,
  sub,
  color = 'gray',
}: {
  label: string
  value: string
  sub?: string
  color?: 'gray' | 'blue' | 'green' | 'red' | 'yellow'
}) {
  const colors = {
    gray: 'bg-white border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-amber-50 border-amber-200',
  }
  const textColors = {
    gray: 'text-gray-900',
    blue: 'text-blue-700',
    green: 'text-emerald-700',
    red: 'text-red-700',
    yellow: 'text-amber-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function OverviewCards({ base, withExtra, pmt, baseRows }: Props) {
  const interestSaved = base.totalInterest - withExtra.totalInterest
  const monthsSaved = base.totalMonths - withExtra.totalMonths
  const interestRatio = base.totalInterest / base.totalPaid * 100
  const hasExtra = withExtra.totalExtraPayments > 0

  const firstMonthInterest = baseRows[0]?.interest ?? 0

  // Month when 50% of principal has been paid (cumulative)
  const halfPrincipal = base.totalPrincipal / 2
  let cumPrincipal = 0
  let halfwayMonth = 0
  for (const row of baseRows) {
    cumPrincipal += row.principal
    if (cumPrincipal >= halfPrincipal) {
      halfwayMonth = row.monthNumber
      break
    }
  }

  return (
    <div className="space-y-4">
      {/* Loan basics */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Resumen del préstamo</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Cuota mensual"
            value={formatCurrency(pmt)}
            color="blue"
          />
          <StatCard
            label="Plazo original"
            value={formatMonths(base.totalMonths)}
            sub={`Hasta ${formatMonthLong(base.endDate)}`}
            color="blue"
          />
          <StatCard
            label="Total a pagar"
            value={formatCurrency(base.totalPaid)}
            sub={`Capital + intereses`}
            color="gray"
          />
          <StatCard
            label="Total intereses"
            value={formatCurrency(base.totalInterest)}
            sub={`${interestRatio.toFixed(1)}% del total pagado`}
            color="red"
          />
        </div>
      </div>

      {/* Cuota doble info */}
      {base.totalMonths > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Dato curioso</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Por cada S/100 pagado"
              value={`S/ ${(base.totalInterest / base.totalPrincipal * 100).toFixed(0)} en intereses`}
              sub="Costo real del préstamo"
              color="yellow"
            />
            <StatCard
              label="50% capital pagado"
              value={halfwayMonth > 0 ? `Cuota ${halfwayMonth}` : '—'}
              sub={`Recién en la cuota ${halfwayMonth} habrás amortizado la mitad del capital`}
              color="yellow"
            />
            <StatCard
              label="Interés 1er mes"
              value={formatCurrency(firstMonthInterest)}
              sub="De tu primera cuota, esto va al banco"
              color="yellow"
            />
          </div>
        </div>
      )}

      {/* Savings from extra payments */}
      {hasExtra && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Con tus amortizaciones extra</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Intereses ahorrados"
              value={formatCurrency(interestSaved)}
              sub={`${((interestSaved / base.totalInterest) * 100).toFixed(1)}% menos intereses`}
              color="green"
            />
            <StatCard
              label="Tiempo ahorrado"
              value={formatMonths(monthsSaved)}
              sub={`Nuevo fin: ${formatMonthLong(withExtra.endDate)}`}
              color="green"
            />
            <StatCard
              label="Nuevo total a pagar"
              value={formatCurrency(withExtra.totalPaid)}
              sub={`Ahorro neto: ${formatCurrency(base.totalPaid - withExtra.totalPaid)}`}
              color="green"
            />
            <StatCard
              label="Total amortizaciones"
              value={formatCurrency(withExtra.totalExtraPayments)}
              sub={`ROI: ${((interestSaved / withExtra.totalExtraPayments) * 100).toFixed(0)}% ahorro vs. inversión`}
              color="blue"
            />
          </div>

          {/* Visual comparison */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Comparación de intereses</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Sin amortizaciones</span>
                  <span>{formatCurrency(base.totalInterest)}</span>
                </div>
                <div className="h-4 bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Con amortizaciones</span>
                  <span>{formatCurrency(withExtra.totalInterest)}</span>
                </div>
                <div className="h-4 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(withExtra.totalInterest / base.totalInterest) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
