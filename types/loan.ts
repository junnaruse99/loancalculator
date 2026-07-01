export interface LoanConfig {
  principal: number;
  annualRate: number;
  termMonths: number;
  startDate: string; // YYYY-MM
  hasDoubleQuota: boolean;
  doubleQuotaMonths: number[]; // 1=Jan ... 12=Dec
}

export interface RecurringExtraPayment {
  id: string;
  amount: number;
  startMonth: string; // YYYY-MM
  endMonth?: string;  // YYYY-MM, optional = until end
}

export interface OnetimeExtraPayment {
  id: string;
  month: string; // YYYY-MM
  amount: number;
  description?: string;
  isPast: boolean;
}

export interface AmortizationRow {
  monthNumber: number;
  date: string; // YYYY-MM
  startBalance: number;
  scheduledPayment: number; // regular cuota (x2 if double quota)
  interest: number;
  principal: number;
  extraPayment: number;
  endBalance: number;
  isDoubleQuota: boolean;
  cumulativeInterest: number;
  cumulativePaid: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  totalMonths: number;
  endDate: string;
  totalPaid: number;
  totalInterest: number;
  totalPrincipal: number;
  totalExtraPayments: number;
}

export interface LoanData {
  config: LoanConfig;
  recurringPayments: RecurringExtraPayment[];
  onetimePayments: OnetimeExtraPayment[];
}

export const DEFAULT_LOAN_DATA: LoanData = {
  config: {
    principal: 200000,
    annualRate: 8.5,
    termMonths: 240,
    startDate: '2024-01',
    hasDoubleQuota: false,
    doubleQuotaMonths: [7, 12],
  },
  recurringPayments: [],
  onetimePayments: [],
}
