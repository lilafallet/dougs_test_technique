export interface BalanceErrorDetails {
  expected: number;
  actual: number;
  difference: number;
}

export interface BalanceErrors {
  [key: string]: BalanceErrorDetails;
}