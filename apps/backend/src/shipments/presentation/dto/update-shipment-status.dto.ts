import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ShipmentStatus } from '../../../generated/prisma/client.js';

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
