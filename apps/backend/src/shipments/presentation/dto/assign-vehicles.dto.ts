import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class AssignVehiclesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  @ArrayUnique()
  shipmentIds!: string[];

  @IsNumber()
  @IsPositive()
  vehicleCapacity!: number;
}
