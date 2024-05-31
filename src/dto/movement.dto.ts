import { IsNumber, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MovementDto {
  @ApiProperty({
    description: 'The unique identifier of the movement',
    example: 1,
    type: Number
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'The date of the movement',
    example: '2024-05-29T12:00:00Z',
    type: String,
    format: 'date-time'
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'The label of the movement',
    example: 'Achat en ligne',
    type: String
  })
  @IsString()
  label: string;

  @ApiProperty({
    description: 'The amount of the movement',
    example: 150.00,
    type: Number
  })
  @IsNumber()
  amount: number;
}