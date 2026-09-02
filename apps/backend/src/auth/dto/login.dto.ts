import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'supervisor@translog.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Supervisor123!' })
  @IsString()
  password!: string;
}
