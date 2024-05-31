import { BalanceErrors } from "./balance-error.interface";
import { Duplicate } from "./duplicate.interface";

export interface Reasons {
  balanceErrors?: BalanceErrors;
  duplicates?: Duplicate[];
}