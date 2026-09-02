import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 'Calle Mayor 1, Madrid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  originAddress!: string;

  @ApiProperty({ example: 'Avenida Diagonal 100, Barcelona' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  destinationAddress!: string;

  @ApiProperty({ example: 'Carlos García' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiPropertyOptional({ example: '+34600111222' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ example: 12.5, minimum: 0.01, maximum: 99999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  weight!: number;
}
