import { AllowGuest } from '../role.guard';
import { ApiTags } from '@nestjs/swagger';
import { Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyQueryService } from './query.service';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyQueryController {
  private readonly logger: Logger = new Logger(SynologyQueryController.name);

  constructor(private readonly queryService: SynologyQueryService) {}

  /**
   * The initial request to the Synology AudioStation API returns information for all of the available
   * Synology software features.  This endpoint omits any features that are not relevant to AudioStation.
   * @returns The JSON response containing the API information.
   */
  @Post('/webapi/query.cgi')
  @HttpCode(HttpStatus.OK)
  @AllowGuest()
  async postQueryCgi() {
    const data = this.queryService.getApiCapabilities();
    return {
      data,
      success: true,
    };
  }
}
