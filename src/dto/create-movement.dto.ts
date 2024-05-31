import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { MovementDto } from './movement.dto';
import { BalanceDto } from './balance.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovementDto {
  @ApiProperty({ type: [MovementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => MovementDto)
  movements: MovementDto[];

  @ApiProperty({ type: [BalanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => BalanceDto)
  balances: BalanceDto[];
}

  