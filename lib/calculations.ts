import type {
  LoanConfig,
  RecurringExtraPayment,
  OnetimeExtraPayment,
  AmortizationRow,
  LoanSummary,
} from '@/types/loan'

export function calcMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const r = annualRate / 100 / 12
  if (r === 0) return principal / termMonths
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1)
}

function addMonths(yyyyMM: string, months: number): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const date = new Date(y, m - 1 + months, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthToNum(yyyyMM: string): number {
  const [y, m] = yyyyMM.split('-').map(Number)
  return y * 12 + m
}

function getExtraForMonth(
  date: string,
  recurring: RecurringExtraPayment[],
  onetime: OnetimeExtraPayment[]
): number {
  let extra = 0
  const num = monthToNum(date)

  for (const rp of recurring) {
    const start = monthToNum(rp.startMonth)
    const end = rp.endMonth ? monthToNum(rp.endMonth) : Infinity
    if (num >= start && num <= end) extra += rp.amount
  }

  for (const op of onetime) {
    if (op.month === date) extra += op.amount
  }

  return extra
}

export function buildSchedule(
  config: LoanConfig,
  recurring: RecurringExtraPayment[],
  onetime: OnetimeExtraPayment[]
): AmortizationRow[] {
  const { principal, annualRate, termMonths, startDate, hasDoubleQuota, doubleQuotaMonths } = config
  const r = annualRate / 100 / 12
  const pmt = calcMonthlyPayment(principal, annualRate, termMonths)

  let balance = principal
  let date = startDate
  let cumInterest = 0
  let cumPaid = 0
  const rows: AmortizationRow[] = []
  const MAX_MONTHS = termMonths * 2 + 12

  for (let i = 0; balance > 0.005 && i < MAX_MONTHS; i++) {
    const [, monthStr] = date.split('-')
    const month = parseInt(monthStr, 10)
    const isDouble = hasDoubleQuota && doubleQuotaMonths.includes(month)

    const interest = balance * r
    const scheduledPayment = Math.min(isDouble ? pmt * 2 : pmt, balance + interest)
    let principal_payment = scheduledPayment - interest
    const extra = Math.min(getExtraForMonth(date, recurring, onetime), balance - principal_payment)
    const extraSafe = Math.max(0, extra)

    if (principal_payment + extraSafe >= balance) {
      principal_payment = balance - extraSafe
    }

    const endBalance = Math.max(0, balance - principal_payment - extraSafe)

    cumInterest += interest
    cumPaid += scheduledPayment + extraSafe

    rows.push({
      monthNumber: i + 1,
      date,
      startBalance: balance,
      scheduledPayment,
      interest,
      principal: principal_payment,
      extraPayment: extraSafe,
      endBalance,
      isDoubleQuota: isDouble,
      cumulativeInterest: cumInterest,
      cumulativePaid: cumPaid,
    })

    balance = endBalance
    date = addMonths(date, 1)
  }

  return rows
}

export function summarize(rows: AmortizationRow[], pmt: number): LoanSummary {
  if (rows.length === 0) {
    return {
      monthlyPayment: pmt,
      totalMonths: 0,
      endDate: '',
      totalPaid: 0,
      totalInterest: 0,
      totalPrincipal: 0,
      totalExtraPayments: 0,
    }
  }
  const last = rows[rows.length - 1]
  return {
    monthlyPayment: pmt,
    totalMonths: rows.length,
    endDate: last.date,
    totalPaid: rows.reduce((s, r) => s + r.scheduledPayment + r.extraPayment, 0),
    totalInterest: rows.reduce((s, r) => s + r.interest, 0),
    totalPrincipal: rows.reduce((s, r) => s + r.principal, 0),
    totalExtraPayments: rows.reduce((s, r) => s + r.extraPayment, 0),
  }
}

export function formatMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${months[m - 1]} ${y}`
}

export function formatMonthLong(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${months[m - 1]} ${y}`
}

export function formatCurrency(n: number): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatMonths(n: number): string {
  const y = Math.floor(n / 12)
  const m = n % 12
  if (y === 0) return `${m} mes${m !== 1 ? 'es' : ''}`
  if (m === 0) return `${y} año${y !== 1 ? 's' : ''}`
  return `${y} año${y !== 1 ? 's' : ''} y ${m} mes${m !== 1 ? 'es' : ''}`
}
