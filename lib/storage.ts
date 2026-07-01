import type { LoanData } from '@/types/loan'
import { DEFAULT_LOAN_DATA } from '@/types/loan'

const KEY = 'hipoteca_v1'

export function loadData(): LoanData {
  if (typeof window === 'undefined') return DEFAULT_LOAN_DATA
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_LOAN_DATA
    return JSON.parse(raw) as LoanData
  } catch {
    return DEFAULT_LOAN_DATA
  }
}

export function saveData(data: LoanData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportJSON(data: LoanData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'hipoteca.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(file: File): Promise<LoanData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as LoanData
        resolve(data)
      } catch {
        reject(new Error('Archivo inválido'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer archivo'))
    reader.readAsText(file)
  })
}
