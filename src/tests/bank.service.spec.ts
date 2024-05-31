import { MovementDto } from "src/dto/movement.dto";
import { BalanceDto } from "src/dto/balance.dto";
import { BankService } from "../services/bank.service";
import { Test, TestingModule } from '@nestjs/testing';

describe('BankService', () => {
  let bankService: BankService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
      ],
    }).compile();

    bankService = module.get<BankService>(BankService);
  });

  it('should return invalid if there are duplicates', () => {
    const movements: MovementDto[] = [
      { id: 1, date: new Date("2024-05-29T12:00:00Z"), label: "Achat en ligne", amount: 150.00 },
      { id: 2, date: new Date("2024-05-29T12:00:00Z"), label: "Achat en ligne", amount: 150.00 },
      { id: 3, date: new Date("2024-05-29T15:00:00Z"), label: "Paiement facture", amount: 200.00 },
      { id: 4, date: new Date("2024-05-29T12:00:00Z"), label: "Achat en ligne", amount: 150.00 },
      { id: 5, date: new Date("2024-05-29T15:00:00Z"), label: "Paiement facture", amount: 200.00 },
      { id: 6, date: new Date("2024-05-29T15:00:00Z"), label: "Paiement facture test", amount: 250.00 }
    ];

    const balances: BalanceDto[] = [{ date: new Date("2024-05-31T00:00:00Z"), balance: 500.00 }];

    jest.spyOn(bankService, 'findDuplicates').mockReturnValue([{ identifier: 'duplicate', movements: movements.slice(0, 2) }]);
    const result = bankService.validateMovements(movements, balances);

    expect(result.isValid).toBeFalsy();
    expect(result.reasons.duplicates.length).toBeGreaterThan(0);
  });

  it('should return invalid if there are balance errors', () => {
    const movements: MovementDto[] = [
      { id: 1, date: new Date('2024-05-29T12:00:00Z'), label: 'Achat en ligne', amount: 150 },
      { id: 2, date: new Date('2024-05-29T12:00:00Z'), label: 'Achat en ligne', amount: 150 }
    ];
    const balances: BalanceDto[] = [{ date: new Date('2024-05'), balance: 150 }];

    jest.spyOn(bankService, 'findDuplicates').mockReturnValue([]);
    jest.spyOn(bankService, 'calculateBalances').mockReturnValue({ '2024-05': 100 });

    const result = bankService.validateMovements(movements, balances);

    expect(result.isValid).toBeFalsy();
    expect(result.reasons.balanceErrors).toBeDefined();
    expect(Object.keys(result.reasons.balanceErrors).length).toBeGreaterThan(0);
  });

  it('should return valid if there are no errors or duplicates', () => {
    const movements: MovementDto[] = [
      { id: 1, date: new Date('2024-05-29T12:00:00Z'), label: 'Achat en ligne', amount: 150 },
      { id: 2, date: new Date('2024-05-29T12:00:00Z'), label: 'Achat en ligne', amount: 150 }
    ];
    const balances: BalanceDto[] = [{ date: new Date('2024-05'), balance: 100 }];

    jest.spyOn(bankService, 'findDuplicates').mockReturnValue([]);
    jest.spyOn(bankService, 'calculateBalances').mockReturnValue({ '2024-05': 100 });

    const result = bankService.validateMovements(movements, balances);

    expect(result.isValid).toBeTruthy();
  });

  it('should detect partial duplicates among movements', () => {
    const movements: MovementDto[] = [
      { id: 1, date: new Date("2024-05-29T12:00:00Z"), label: "Achat en ligne", amount: 150 },
      { id: 2, date: new Date("2024-05-29T12:00:00Z"), label: "Achat en ligne", amount: 150 },
      { id: 3, date: new Date("2024-05-29T15:00:00Z"), label: "Paiement facture", amount: 200 }
    ];
    const balances: BalanceDto[] = [{ date: new Date("2024-05-31T00:00:00Z"), balance: 500 }];

    jest.spyOn(bankService, 'findDuplicates').mockReturnValue([{ identifier: '2024-05-29T12:00:00Z:Achat en ligne:150', movements: movements.slice(0, 2) }]);
    const result = bankService.validateMovements(movements, balances);

    expect(result.isValid).toBeFalsy();
    expect(result.reasons.duplicates).toHaveLength(1);
    expect(result.reasons.duplicates[0].movements).toHaveLength(2);
  });

  it('should handle balance errors due to end-of-month transactions', () => {
    const movements: MovementDto[] = [
      { id: 1, date: new Date('2024-05-30T23:59:59Z'), label: 'End of Month Charge', amount: 300 },
      { id: 2, date: new Date('2024-06-01T00:00:01Z'), label: 'Start of Month Charge', amount: 300 }
    ];
    const balances: BalanceDto[] = [
      { date: new Date('2024-05-31T00:00:00Z'), balance: 0 },
      { date: new Date('2024-06-30T00:00:00Z'), balance: 300 }
    ];

    jest.spyOn(bankService, 'calculateBalances').mockReturnValue({
      '2024-05': 300,
      '2024-06': 300
    });
    const result = bankService.validateMovements(movements, balances);

    expect(result.isValid).toBeFalsy();
    expect(result.reasons.balanceErrors['2024-05']).toBeDefined();
    expect(result.reasons.balanceErrors['2024-05'].difference).toBe(300);
  });

  it('should return invalid when movements contain negative amounts', () => {
    const movements: MovementDto[] = [
      { id: 1, date: new Date('2024-05-29T12:00:00Z'), label: 'Achat en ligne', amount: -150 }
    ];
    const balances: BalanceDto[] = [{ date: new Date('2024-05'), balance: 150 }];

    const result = bankService.validateMovements(movements, balances);
    expect(result.isValid).toBeFalsy();
  });
});
