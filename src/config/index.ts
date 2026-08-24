import { TaxYear, YearTaxData } from "./types";
import { TAX_DATA_2025 } from "./2025/taxData";
import { TAX_DATA_2026 } from "./2026/taxData";

export * from "./types";

export const TAX_DATA_BY_YEAR: Record<TaxYear, YearTaxData> = {
  2025: TAX_DATA_2025,
  2026: TAX_DATA_2026,
};

export function getTaxDataForYear(year: TaxYear): YearTaxData {
  return TAX_DATA_BY_YEAR[year];
}
