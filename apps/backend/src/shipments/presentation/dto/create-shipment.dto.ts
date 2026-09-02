import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  originAddress!: string;

  @IsString()
  @IsNotEmpty()
  destinationAddress!: string;

  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsNumber()
  @IsPositive()
  weight!: number;
}
