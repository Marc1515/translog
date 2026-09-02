import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class AssignVehiclesDto {
  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  @ArrayUnique()
  shipmentIds!: string[];

  @ApiProperty({ example: 100, description: 'Capacidad máxima por vehículo (kg)' })
  @IsNumber()
  @IsPositive()
  vehicleCapacity!: number;
}
