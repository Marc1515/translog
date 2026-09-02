import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 'Calle Mayor 1, Madrid' })
  @IsString()
  @IsNotEmpty()
  originAddress!: string;

  @ApiProperty({ example: 'Avenida Diagonal 100, Barcelona' })
  @IsString()
  @IsNotEmpty()
  destinationAddress!: string;

  @ApiProperty({ example: 'Carlos García' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiPropertyOptional({ example: '+34600111222' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @IsPositive()
  weight!: number;
}
