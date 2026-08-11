import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  SynologyInfoBodyDto,
  SynologyInfoResponseDto,
} from './dtos/info.cgi.dto';
import { SynologyInfoService } from './info.service';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyInfoController {
  private readonly logger: Logger = new Logger(SynologyInfoController.name);

  constructor(private readonly infoService: SynologyInfoService) {}

  /**
   * The `info.cgi` endpoint returns configuration information for the Synology AudioStation API
   * and client capabilities.
   * @returns
   */
  @Post('/webapi/AudioStation/info.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user',
    required: true,
  })
  @ApiOkResponse({
    description:
      'Returns configuration information for the Synology AudioStation API and client capabilities',
    type: SynologyInfoResponseDto,
  })
  async postInfoCgi(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() body: SynologyInfoBodyDto,
    @Headers('id') sessionTokenHash: string,
  ): Promise<SynologyInfoResponseDto> {
    const data = await this.infoService.getConfiguration(sessionTokenHash);
    return {
      data,
      success: true,
    };
  }
}
