import {
  CollatedTrackEntity,
  FolderEntity,
  RootPathEntity,
} from 'src/database/entities';
import { ContentType } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
  SynologyFolderDataDto,
  SynologyFolderDto,
  SynologySongDto,
} from './dtos';
import { sep } from 'node:path';

function folderToRow(folder: FolderEntity): SynologyFolderDto {
  return {
    id: `dir_${folder.id}`,
    is_personal: false,
    path: folder.folderPath,
    title: folder.folderPath.split(sep).pop() || folder.folderPath,
    type: ContentType.FOLDER,
  };
}

function fileToRow(track: CollatedTrackEntity): SynologySongDto {
  return {
    additional: {
      song_audio: {
        bitrate: track.trackBitRate,
        channel: track.trackChannels,
        codec: track.fileType,
        container: track.fileType,
        duration: track.trackDuration,
        filesize: track.fileSize,
        frequency: track.trackFrequency,
      },
      song_rating: {
        rating: 0,
      },
      song_tag: {
        album: track.albumTitle,
        album_artist: track.albumArtists.join(', '),
        artist: track.trackArtists.join(', '),
        comment: track.trackComment || '',
        composer: track.trackComposers.join(', '),
        disc: track.trackDiscNumber,
        genre: track.trackGenres.join(', '),
        track: track.trackNumber,
        year: track.trackYear,
      },
    },
    id: `music_${track.fileId}`,
    path: track.filePath,
    title: track.filePath.split(sep).pop() || track.filePath,
    type: ContentType.FILE,
  };
}

@Injectable()
export class SynologyFolderService {
  constructor(
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  async listRootFolders(
    accountId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyFolderDataDto> {
    const folders = await this.folderEntity.findAll({
      where: {
        accountId,
        isRoot: true,
      },
      order: [['folderPath', 'ASC']],
      offset,
      limit,
    });
    return {
      items: folders.map(folderToRow),
      folder_total: folders.length,
      offset,
      total: folders.length,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async listFolders(
    accountId: number,
    folderId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyFolderDataDto> {
    const startingFolder = await this.folderEntity.findOne({
      where: {
        id: folderId,
        accountId,
      },
    });
    if (!startingFolder) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }
    // find the root path entity that matches the basePath
    const rootPath = await this.rootPathEntity.findByPk(
      startingFolder.rootPathId,
    );
    if (!rootPath) {
      throw new Error(
        `No root path found for base path: ${startingFolder.folderPath}`,
      );
    }
    const stemParts = startingFolder.folderPath
      .split(sep)
      .filter((part) => part.length > 0);
    const pathContents: (SynologyFolderDto | SynologySongDto)[] = [];
    // folder contents
    const folders = await this.folderEntity.findAll({
      where: {
        accountId,
        folderPath: {
          [Op.like]: `${startingFolder.folderPath}/%`,
        },
        isRoot: false,
        rootPathId: startingFolder.rootPathId,
      },
    });
    for (let i = 0, len = folders.length; i < len; i += 1) {
      const subFolder = folders[i];
      if (subFolder) {
        const folderPath = subFolder.folderPath
          .split(sep)
          .filter((part) => part.length > 0)
          .slice(0, stemParts.length + 1)
          .join(sep)
          .substring(rootPath.rootPath.length);
        // check if unique
        const existing = pathContents.find((item) => item.path === folderPath);
        if (!existing) {
          const row = folderToRow(subFolder);
          row.path = folderPath;
          pathContents.push(row);
        }
      }
    }
    const folderTotal = pathContents.length;
    // file contents
    const relativeFilePath = startingFolder.folderPath.replace(
      rootPath.rootPath,
      '',
    );
    const files = await this.collatedTrackEntity.findAll({
      where: {
        accountId,
        filePath: {
          [Op.like]: `${relativeFilePath}/%`,
        },
        rootPathId: startingFolder.rootPathId,
      },
      offset,
      limit,
    });
    for (let i = 0, len = files.length; i < len; i += 1) {
      const file = files[i];
      if (file) {
        if (file.filePath.lastIndexOf(sep) === relativeFilePath.length) {
          pathContents.push(fileToRow(file));
        }
      }
    }
    return {
      folder_total: folderTotal,
      id: `dir_${startingFolder.id}`,
      items: pathContents,
      offset,
      total: pathContents.length,
    };
  }
}
