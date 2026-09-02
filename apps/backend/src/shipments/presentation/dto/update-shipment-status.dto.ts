import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ShipmentStatus } from '../../../generated/prisma/client.js';

export class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ShipmentStatus, example: ShipmentStatus.IN_WAREHOUSE })
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @ApiProperty({ example: 'Centro logístico Madrid' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiPropertyOptional({ example: 'Recepcionado en almacén' })
  @IsOptional()
  @IsString()
  notes?: string;
}
