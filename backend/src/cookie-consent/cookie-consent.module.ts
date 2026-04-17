import { Module } from '@nestjs/common';
import { CookieConsentService } from './cookie-consent.service';
import { CookieConsentController } from './cookie-consent.controller';

@Module({
  providers: [CookieConsentService],
  controllers: [CookieConsentController],
  exports: [CookieConsentService],
})
export class CookieConsentModule {}
