import { Injectable } from '@nestjs/common';
import { MovementDto } from '../dto/movement.dto';
import { BalanceDto } from '../dto/balance.dto';
import { ReasonsDto } from '../dto/reasons.dto';
import { BalanceErrors } from '../interfaces/balance-error.interface';
import { Duplicate } from '../interfaces/duplicate.interface';
import { Movement } from '../interfaces/movement.interface';
import { format } from 'date-fns';

@Injectable()
export class BankService {

  public validateMovements(movements: MovementDto[], balances: BalanceDto[]): { isValid: boolean; reasons: ReasonsDto } {
    const calculatedBalances = this.calculateBalances(movements);
    const duplicates = this.findDuplicates(movements);
    if (duplicates.length > 0) {
      return {
        isValid: false,
        reasons: {
          duplicates
        }
      };
    }

    const balanceErrors = this._compareBalances(calculatedBalances, balances);
    return {
      isValid: Object.keys(balanceErrors).length === 0,
      reasons: {
        balanceErrors
      }
    };
  }

  public calculateBalances(movements: MovementDto[]): Record<string, number> {
    return movements.reduce((acc, movement) => {
      const monthKey = format(new Date(movement.date), 'yyyy-MM');
      acc[monthKey] = (acc[monthKey] || 0) + movement.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  public findDuplicates(movements: Movement[]): Duplicate[] {
    const mappedMovements = this._mapMovementsByIdentifier(movements);
    return this._extractDuplicates(mappedMovements);
  }

  private _compareBalances(calculated: Record<string, number>, balances: BalanceDto[]): BalanceErrors {
    return balances.reduce((acc, balance) => {
      const monthKey = format(new Date(balance.date), 'yyyy-MM');
      const calculatedBalance = calculated[monthKey] || 0;
      if (calculatedBalance !== balance.balance) {
        acc[monthKey] = {
          expected: balance.balance,
          actual: calculatedBalance,
          difference: Math.abs(balance.balance - calculatedBalance)
        };
      }
      return acc;
    }, {} as BalanceErrors);
  }

  private _mapMovementsByIdentifier(movements: Movement[]): Record<string, Movement[]> {
    return movements.reduce((acc, movement) => {
      const identifier = `${movement.date}:${movement.label}:${movement.amount}`;
      if (!acc[identifier]) {
        acc[identifier] = [];
      }
      acc[identifier].push(movement);
      return acc;
    }, {} as Record<string, Movement[]>);
  }

  private _extractDuplicates(mappedMovements: Record<string, Movement[]>): Duplicate[] {
    return Object.entries(mappedMovements)
      .filter(([, movements]) => movements.length > 1)
      .map(([identifier, movements]) => ({ identifier, movements }));
  }
}