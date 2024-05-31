import { IsArray, ValidateNested } from 'class-validator';
import { BalanceErrors } from 'src/interfaces/balance-error.interface';
import { Duplicate } from 'src/interfaces/duplicate.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReasonsDto {
  @ApiProperty({
    description: 'List of duplicate movements',
    type: () => [Object],
    required: false
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  duplicates?: Duplicate[];

  @ApiProperty({
    description: 'Balance errors found during validation',
    type: Object,
    required: false
  })
  balanceErrors?: BalanceErrors;
}

