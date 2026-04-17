import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataSubjectRequestType } from '@prisma/client';

export class CreateDataSubjectRequestDto {
  @ApiProperty({ enum: DataSubjectRequestType })
  @IsEnum(DataSubjectRequestType)
  type: DataSubjectRequestType;

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  requesterName: string;

  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  requesterEmail: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  requesterCpf?: string;

  @ApiPropertyOptional({ example: '(21) 99999-0000' })
  @IsOptional()
  @IsString()
  requesterPhone?: string;

  @ApiProperty({ example: 'Solicito acesso aos meus dados pessoais' })
  @IsString()
  description: string;
}

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachmentId?: string;
}

export class LookupRequestDto {
  @ApiProperty({ example: 'LGPD-2026-0001' })
  @IsString()
  protocol: string;

  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email: string;
}
