import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  SynologyComposerBodyDto,
  SynologyComposerResponseDto,
} from './dtos/composer.cgi.dto';
import { SynologyComposerService } from './composer.service';
import { User } from '../user.decorator';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyComposerController {
  private readonly logger: Logger = new Logger(SynologyComposerController.name);

  constructor(private readonly composerService: SynologyComposerService) {}

  @Post('/webapi/AudioStation/composer.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user',
    required: true,
  })
  @ApiOkResponse({
    description: 'Returns a list of composers',
    type: SynologyComposerResponseDto,
  })
  async routeComposerCgi(
    @User() user: AccountEntity,
    @Body() body: SynologyComposerBodyDto,
  ): Promise<SynologyComposerResponseDto> {
    // Route #1:  list composers
    const data = await this.composerService.listComposers(
      user.id,
      body.offset,
      body.limit,
    );
    return {
      data,
      success: true,
    };
  }
}
