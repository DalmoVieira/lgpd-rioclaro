import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataType, LegalBasis } from '@prisma/client';

export class CreateDataProcessingActivityDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purpose?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataSubjectCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataCategory?: string;
  @ApiProperty({ enum: DataType }) @IsEnum(DataType) dataType: DataType;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() storage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sharing?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() retention?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() disposal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() controller?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() operator?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() systems?: string;
  @ApiProperty({ enum: LegalBasis }) @IsEnum(LegalBasis) legalBasis: LegalBasis;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() internationalTransfer?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() securityMeasures?: string;
}

export class UpdateDataProcessingActivityDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purpose?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataSubjectCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(DataType) dataType?: DataType;
  @ApiPropertyOptional() @IsOptional() @IsEnum(LegalBasis) legalBasis?: LegalBasis;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() storage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sharing?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() retention?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() disposal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() controller?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() operator?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() systems?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() internationalTransfer?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() securityMeasures?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
