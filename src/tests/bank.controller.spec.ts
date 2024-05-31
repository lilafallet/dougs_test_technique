import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { BankService } from '../services/bank.service';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { Response } from 'express';
import { BankController } from '../controller/bank.controller';
import { Reasons } from 'src/interfaces/reasons.interface';
import { RESPONSE_MESSAGES } from '../constants/constants';

describe('BankController', () => {
  let controller: BankController;
  let bankService: BankService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankController],
      providers: [
        {
          provide: BankService,
          useValue: {
            validateMovements: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<BankController>(BankController);
    bankService = module.get<BankService>(BankService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('movementsValidation', () => {
    it('should return Accepted if movements are valid', async () => {
      const dto: CreateMovementDto = { movements: [], balances: [] };
      jest.spyOn(bankService, 'validateMovements').mockReturnValue({
        isValid: true,
        reasons: {} as Reasons
      });

      const result = await controller.movementsValidation(dto, mockResponse as Response);

      expect(bankService.validateMovements).toHaveBeenCalledWith(dto.movements, dto.balances);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.ACCEPTED);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.ACCEPTED });
    });

    it('should return Conflict if movements are not valid', async () => {
      const dto: CreateMovementDto = { movements: [], balances: [] };
      const reasons: Reasons = { duplicates: [], balanceErrors: {} };
      jest.spyOn(bankService, 'validateMovements').mockReturnValue({
        isValid: false,
        reasons: reasons
      });

      const result = await controller.movementsValidation(dto, mockResponse as Response);

      expect(bankService.validateMovements).toHaveBeenCalledWith(dto.movements, dto.balances);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: HttpStatus.CONFLICT,
        message: RESPONSE_MESSAGES.CONFLICT_DETECTED,
        reasons
      });
    });

    it('should handle cases with duplicate movements', async () => {
      const dto: CreateMovementDto = {
        movements: [{ id: 1, date: new Date(), label: "Test Payment", amount: 100 }, { id: 1, date: new Date(), label: "Test Payment", amount: 100 }],
        balances: []
      };
      const reasons: Reasons = { duplicates: [{ identifier: "1", movements: dto.movements }] };
      jest.spyOn(bankService, 'validateMovements').mockReturnValue({
        isValid: false,
        reasons: reasons
      });

      const result = await controller.movementsValidation(dto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: HttpStatus.CONFLICT,
        message: RESPONSE_MESSAGES.CONFLICT_DETECTED,
        reasons
      });
    });

    it('should handle cases with balance errors', async () => {
      const dto: CreateMovementDto = {
        movements: [{ id: 1, date: new Date(), label: "Test Payment", amount: 300 }],
        balances: [{ date: new Date(), balance: 200 }]
      };
      const reasons: Reasons = { balanceErrors: { "2024-05": { expected: 200, actual: 300, difference: 100 } } };
      jest.spyOn(bankService, 'validateMovements').mockReturnValue({
        isValid: false,
        reasons: reasons
      });

      const result = await controller.movementsValidation(dto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: HttpStatus.CONFLICT,
        message: RESPONSE_MESSAGES.CONFLICT_DETECTED,
        reasons
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const dto: CreateMovementDto = { movements: [], balances: [] };
      jest.spyOn(bankService, 'validateMovements').mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      await expect(controller.movementsValidation(dto, mockResponse as Response)).rejects.toThrow("Unexpected error");
    });
  });
});