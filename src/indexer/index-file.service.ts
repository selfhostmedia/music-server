import { FileEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { sanitizeString } from 'src/utils/strings';

@Injectable()
export class IndexFileService {
  private readonly logger: Logger = new Logger(IndexFileService.name);

  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
  ) {}

  async updateFile(embeddedData: IAudioMetadata, fileId: number, accountId: number, transaction?: Transaction) {
    const file = await this.fileEntity.findByPk(fileId, { transaction });
    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }
    let commentText: string | undefined;
    if (embeddedData?.common.comment) {
      commentText = embeddedData.common.comment
        .map((comment) => comment.text?.trim() || '')
        .join('\n')
        .trim();
    }
    await this.fileEntity.update(
      {
        accountId,
        bitRate: embeddedData?.format.bitrate || file.bitRate || 0,
        channels: embeddedData?.format.numberOfChannels || file.channels || 0,
        comment: commentText || file.comment || '',
        discNumber: embeddedData?.common.disk?.no || file.discNumber || 0,
        duration: embeddedData?.format.duration || file.duration || 0,
        frequency: embeddedData?.format.sampleRate || file.frequency || 0,
        title: sanitizeString(embeddedData?.common.title || '') || file.title || '',
        trackNumber: embeddedData?.common.track?.no || file.trackNumber || 0,
        year: embeddedData?.common.year || file.year || 0,
      },
      {
        where: {
          id: fileId,
        },
        transaction,
      },
    );
    return file.reload({
      transaction,
    });
  }
}
