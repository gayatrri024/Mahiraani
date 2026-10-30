// src/lib/money.ts – Safe integer paise arithmetic. Never use floats for money.

export function pToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function rupeesToP(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function parsePriceInput(value: string): number | null {
  const parsed = parseFloat(value.replace(/,/g, ""));
  if (isNaN(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}
