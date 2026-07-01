'use client'
import { useState } from 'react'
import type { RecurringExtraPayment, OnetimeExtraPayment } from '@/types/loan'
import { formatCurrency, formatMonthLong } from '@/lib/calculations'

interface Props {
  recurring: RecurringExtraPayment[]
  onetime: OnetimeExtraPayment[]
  onUpdateRecurring: (list: RecurringExtraPayment[]) => void
  onUpdateOnetime: (list: OnetimeExtraPayment[]) => void
  loanStartDate: string
}

function genId() {
  return Math.random().toString(36).slice(2)
}

export default function ExtraPayments({
  recurring,
  onetime,
  onUpdateRecurring,
  onUpdateOnetime,
  loanStartDate,
}: Props) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  const [rForm, setRForm] = useState({ amount: '', startMonth: loanStartDate, endMonth: '' })
  const [oForm, setOForm] = useState({ amount: '', month: todayStr, description: '', isPast: false })

  const addRecurring = () => {
    const amount = parseFloat(rForm.amount)
    if (!amount || amount <= 0) return
    onUpdateRecurring([
      ...recurring,
      { id: genId(), amount, startMonth: rForm.startMonth, endMonth: rForm.endMonth || undefined },
    ])
    setRForm({ amount: '', startMonth: loanStartDate, endMonth: '' })
  }

  const removeRecurring = (id: string) => onUpdateRecurring(recurring.filter((r) => r.id !== id))

  const addOnetime = () => {
    const amount = parseFloat(oForm.amount)
    if (!amount || amount <= 0) return
    onUpdateOnetime([
      ...onetime,
      { id: genId(), amount, month: oForm.month, description: oForm.description, isPast: oForm.isPast },
    ])
    setOForm({ amount: '', month: todayStr, description: '', isPast: false })
  }

  const removeOnetime = (id: string) => onUpdateOnetime(onetime.filter((o) => o.id !== id))

  const pastPayments = onetime.filter((o) => o.isPast).sort((a, b) => a.month.localeCompare(b.month))
  const futurePayments = onetime.filter((o) => !o.isPast).sort((a, b) => a.month.localeCompare(b.month))

  return (
    <div className="space-y-6">
      {/* Recurring extra payment */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Pago extra mensual fijo</h3>
        <p className="text-xs text-gray-500 mb-4">Monto adicional que pagas cada mes. Se aplica directo al capital.</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Monto extra (S/)</label>
            <input
              type="number"
              value={rForm.amount}
              onChange={(e) => setRForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="500"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="month"
              value={rForm.startMonth}
              onChange={(e) => setRForm((f) => ({ ...f, startMonth: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta (opcional)</label>
            <input
              type="month"
              value={rForm.endMonth}
              onChange={(e) => setRForm((f) => ({ ...f, endMonth: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <button
          onClick={addRecurring}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Agregar pago recurrente
        </button>

        {recurring.length > 0 && (
          <div className="mt-4 space-y-2">
            {recurring.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-semibold text-blue-800">{formatCurrency(r.amount)}/mes</span>
                  <span className="text-xs text-blue-600 ml-2">
                    desde {formatMonthLong(r.startMonth)}
                    {r.endMonth ? ` hasta ${formatMonthLong(r.endMonth)}` : ' (permanente)'}
                  </span>
                </div>
                <button
                  onClick={() => removeRecurring(r.id)}
                  className="text-red-400 hover:text-red-600 text-xs px-2 py-1"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* One-time extra payment */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Amortización puntual</h3>
        <p className="text-xs text-gray-500 mb-4">
          Un pago extra en un mes específico. Puedes ingresar pagos ya realizados en el pasado.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mes</label>
            <input
              type="month"
              value={oForm.month}
              onChange={(e) => setOForm((f) => ({ ...f, month: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Monto (S/)</label>
            <input
              type="number"
              value={oForm.amount}
              onChange={(e) => setOForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="5000"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Descripción (opcional)</label>
            <input
              type="text"
              value={oForm.description}
              onChange={(e) => setOForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Gratificación julio"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={oForm.isPast}
                onChange={(e) => setOForm((f) => ({ ...f, isPast: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Ya realizado (pasado)</span>
            </label>
          </div>
        </div>
        <button
          onClick={addOnetime}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Agregar amortización
        </button>
      </div>

      {/* Past payments list */}
      {pastPayments.length > 0 && (
        <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50">
          <h3 className="text-sm font-semibold text-emerald-800 mb-3">Amortizaciones realizadas ({pastPayments.length})</h3>
          <div className="space-y-2">
            {pastPayments.map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-emerald-100">
                <div>
                  <span className="text-sm font-semibold text-emerald-800">{formatCurrency(o.amount)}</span>
                  <span className="text-xs text-emerald-600 ml-2">{formatMonthLong(o.month)}</span>
                  {o.description && <span className="text-xs text-gray-400 ml-2">— {o.description}</span>}
                </div>
                <button onClick={() => removeOnetime(o.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            Total pagado: {formatCurrency(pastPayments.reduce((s, o) => s + o.amount, 0))}
          </p>
        </div>
      )}

      {/* Future payments list */}
      {futurePayments.length > 0 && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Amortizaciones planificadas ({futurePayments.length})</h3>
          <div className="space-y-2">
            {futurePayments.map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-blue-100">
                <div>
                  <span className="text-sm font-semibold text-blue-800">{formatCurrency(o.amount)}</span>
                  <span className="text-xs text-blue-600 ml-2">{formatMonthLong(o.month)}</span>
                  {o.description && <span className="text-xs text-gray-400 ml-2">— {o.description}</span>}
                </div>
                <button onClick={() => removeOnetime(o.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2 font-medium">
            Total planificado: {formatCurrency(futurePayments.reduce((s, o) => s + o.amount, 0))}
          </p>
        </div>
      )}
    </div>
  )
}
