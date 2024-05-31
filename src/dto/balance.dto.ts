import { IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceDto {
  @ApiProperty({
    description: 'The date of the balance',
    type: String,
    format: 'date-time'
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'The balance amount',
    type: Number
  })
  @IsNumber()
  balance: number;
}