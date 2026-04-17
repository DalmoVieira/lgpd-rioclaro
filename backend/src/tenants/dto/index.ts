import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Prefeitura de Rio Claro' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'rioclaro' })
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @ApiPropertyOptional({ example: 'rioclaro.lgpd.gov.br' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: 'Rio Claro' })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional({ example: 'Rio Claro' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'RJ' })
  @IsOptional()
  @IsString()
  state?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
