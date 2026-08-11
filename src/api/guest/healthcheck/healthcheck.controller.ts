import { Controller, Get } from '@nestjs/common';

@Controller()
export class GuestHealthcheckController {
  // eslint-disable-next-line class-methods-use-this
  @Get('/api/healthcheck')
  healthcheck() {
    return { status: 'ok' };
  }
}
