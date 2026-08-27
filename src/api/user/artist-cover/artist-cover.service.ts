import { AlbumArtistEntity } from 'src/database/entities';
import { AlbumEntity } from 'src/database/entities/album.entity';
import { CoverImage } from 'src/types/cover-image';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class UserArtistCoverService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  async getAlbumCoverImage(accountId: number, artistId: number, size: number): Promise<CoverImage | undefined> {
    const albumCover = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType'],
      include: [
        {
          attributes: ['albumId', 'artistId'],
          model: AlbumArtistEntity,
          where: {
            artistId,
          },
          required: true,
        },
      ],
      where: {
        accountId,
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
      },
    });
    console.log("got cover image", artistId, albumCover);
    if (!albumCover) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    const sharpImage = sharp(albumCover.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return undefined;
    }
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      albumCover.coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage: albumCover.coverImage,
      coverImageMimeType: albumCover.coverImageMimeType,
    };
  }
}
