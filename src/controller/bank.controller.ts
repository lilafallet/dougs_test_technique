import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BankService } from '../services/bank.service';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { RESPONSE_MESSAGES } from '../constants/constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('movements')
@Controller('movements')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post('validation')
  @ApiOperation({ summary: 'Validate banking movements' })
  @ApiResponse({ status: 202, description: 'Accepted' })
  @ApiResponse({ status: 409, description: 'Conflict detected' })
  async movementsValidation(@Body() createMovementDto: CreateMovementDto, @Res() res: Response) {
    const validationResult = this.bankService.validateMovements(createMovementDto.movements, createMovementDto.balances);

    if (!validationResult.isValid) {
      return res.status(HttpStatus.CONFLICT).json({
        code: HttpStatus.CONFLICT,
        message: RESPONSE_MESSAGES.CONFLICT_DETECTED,
        reasons: validationResult.reasons
      });
    }
    return res.status(HttpStatus.ACCEPTED).json({ message: RESPONSE_MESSAGES.ACCEPTED }); //constante
  }
}

