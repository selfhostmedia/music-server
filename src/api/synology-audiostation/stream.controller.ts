import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { StreamCgiQueryDto } from './dtos';
import { SynologyStreamService } from './stream.service';
import { User } from '../user.decorator';
import type { Response } from 'express';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyStreamController {
  private readonly logger: Logger = new Logger(SynologyStreamController.name);

  constructor(private readonly streamService: SynologyStreamService) {}

  @Get('/webapi/AudioStation/stream.cgi')
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user',
    required: true,
  })
  async getStreamCgi(
    @User() user: AccountEntity,
    @Query() query: StreamCgiQueryDto,
    @Res() res: Response,
  ) {
    const streamInfo = await this.streamService.getStream(user.id, query.id);
    res.sendFile(streamInfo.path, {
      headers: {
        'Content-Type': `audio/${streamInfo.codec}`,
        'Content-Length': streamInfo.fileSize,
      },
    });
  }
}
