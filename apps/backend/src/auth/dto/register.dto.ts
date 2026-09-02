import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../generated/prisma/client.js';

export class RegisterDto {
  @ApiProperty({ example: 'operador@translog.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Operador123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.OPERATOR })
  @IsEnum(UserRole)
  role!: UserRole;
}
