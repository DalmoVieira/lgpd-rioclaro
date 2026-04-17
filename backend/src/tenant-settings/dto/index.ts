import { IsString, IsOptional, IsUrl, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() officialName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() municipality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cabinetAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dpoAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido' })
  zipCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()
  @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, { message: 'CNPJ inválido' })
  cnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() whatsapp?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dpoName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dpoEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dpoPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() acronym?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slogan?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() headerText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() footerText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() businessHours?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() primaryColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secondaryColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accentColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() backgroundColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() privacyPolicyUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() termsOfUseUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataSubjectChannelUrl?: string;
  @ApiPropertyOptional() @IsOptional() socialLinks?: any;
}
