/* eslint-disable no-await-in-loop */
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  FileEntity,
  FolderEntity,
  RootPathEntity,
} from 'src/database/entities';
import { IAudioMetadata, IOptions } from 'src/types/music-metadata';
import { IndexAlbumService } from './index-album.service';
import { IndexArtistService } from './index-artist.service';
import { IndexComposerService } from './index-composer.service';
import { IndexFileService } from './index-file.service';
import { IndexGenreService } from './index-genre.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { basename, join, sep } from 'node:path';
import { promisify } from 'util';
import { readdir, stat } from 'node:fs';

const readDirAsync = promisify(readdir);
const statAsync = promisify(stat);
const validFiles = ['mp3', 'flac', 'ogg', 'm4a'];

type FileItem = { path: string; lastModified: Date; size: number };
type FileUpdateItem = {
  embeddedData: IAudioMetadata;
  fileId: number;
  path: string;
  lastModified: Date;
  size: number;
};

@Injectable()
export class IndexerService {
  private readonly logger: Logger = new Logger(IndexerService.name);

  private parseMetaData!: (
    filePath: string,
    options?: IOptions,
  ) => Promise<IAudioMetadata>;

  constructor(
    private readonly indexAlbumService: IndexAlbumService,
    private readonly indexArtistService: IndexArtistService,
    private readonly indexComposerService: IndexComposerService,
    private readonly indexGenreService: IndexGenreService,
    private readonly indexFileService: IndexFileService,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  async onModuleInit() {
    const musicMetaData = await import('music-metadata');
    this.parseMetaData = musicMetaData.parseFile;
  }

  /**
   * Scans all root paths for the specified account.  This occurs on server startup and
   * each hour via c  ron.
   * @param {number} accountId The ID of the account whose root paths should be scanned
   * @returns {Promise<void>}
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scanRootPaths(accountId?: number): Promise<void> {
    this.logger.log('Scanning root paths');
    // make sure the metadata parser is ready
    // load the root paths to scan
    const where: Record<string, unknown> = {};
    if (accountId) {
      where.accountId = accountId;
    }
    const rootPaths = await this.rootPathEntity.findAll({
      where,
    });
    // scan the root paths
    const scanNextRootPath = async () => {
      if (!rootPaths.length) {
        return;
      }
      const rootPath = rootPaths.shift();
      if (!rootPath) {
        return;
      }
      await this.scanRootPath(rootPath);
      await scanNextRootPath();
    };
    await scanNextRootPath();
  }

  /**
   * Performs a full scan of a root path and its nested contents and then examines
   * files for additions or modifications and synchronizes the database
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @returns {Promise<void>}
   */
  async scanRootPath(rootPath: RootPathEntity): Promise<void> {
    this.logger.log(`scanning root path ${rootPath.rootPath}`);
    const filesToScan: FileItem[] = [];
    const filesToUpdate: FileUpdateItem[] = [];
    const uniqueFolderPaths: string[] = [rootPath.rootPath];
    // start the path scanning to recursively identify all the files within the root path
    await this.scanFolderContents(
      [rootPath.rootPath],
      filesToScan,
      uniqueFolderPaths,
    );
    // remove deleted folders and files from the database
    const deletedFolders = await this.folderEntity.destroy({
      where: {
        accountId: rootPath.accountId,
        folderPath: {
          [Op.notIn]: uniqueFolderPaths,
        },
        rootPathId: rootPath.id,
      },
    });
    if (deletedFolders) {
      this.logger.log(
        `deleted ${deletedFolders} stale folder references from the database`,
      );
    }
    const deletedFiles = await this.fileEntity.destroy({
      where: {
        accountId: rootPath.accountId,
        rootPathId: rootPath.id,
        filePath: {
          [Op.notIn]: filesToScan.map((file) =>
            file.path.substring(rootPath.rootPath.length),
          ),
        },
      },
    });
    if (deletedFiles) {
      this.logger.log(
        `deleted ${deletedFiles} stale file references from the database`,
      );
    }
    // start the file scanning to recursively identify all new or modified files
    await this.checkFile(rootPath, filesToScan, filesToUpdate);
    // start the metadata scanning to update the database with the latest file information
    await this.updateFile(rootPath, filesToUpdate);
    // update the folder tree for the root path
    await this.updateFolders(rootPath, uniqueFolderPaths);
  }

  /**
   * Recursively scans the root path and any subfolders for audio files
   * @param {string[]} foldersToScan Array of folder paths to be scanned
   * @param {FileItem[]} filesToScan Array of files identified during the scan
   * @returns {Promise<void>}
   */
  async scanFolderContents(
    foldersToScan: string[],
    filesToScan: FileItem[],
    uniqueFolderPaths: string[],
  ): Promise<void> {
    if (!foldersToScan.length) {
      return;
    }
    const folderPath = foldersToScan.shift();
    if (!folderPath) {
      return;
    }
    this.logger.log(`scanning folder contents: ${folderPath}`);
    const folderContents = await readDirAsync(folderPath);
    for (let i = 0, len = folderContents.length; i < len; i += 1) {
      const fileName = folderContents[i];
      if (fileName) {
        const filePath = join(folderPath, fileName);
        // eslint-disable-next-line no-await-in-loop
        const contentStat = await statAsync(filePath);
        if (contentStat.isDirectory()) {
          foldersToScan.push(filePath);
          if (!uniqueFolderPaths.includes(filePath)) {
            uniqueFolderPaths.push(filePath);
          }
        } else if (contentStat.isFile()) {
          const fileType = fileName.toLowerCase().split('.').pop() || '';
          if (validFiles.includes(fileType.toLowerCase())) {
            filesToScan.push({
              path: filePath,
              lastModified: contentStat.mtime,
              size: contentStat.size,
            });
          }
        }
      }
    }
    await this.scanFolderContents(
      foldersToScan,
      filesToScan,
      uniqueFolderPaths,
    );
  }

  /**
   * Recursively checks files to determine if they need to be added or updated in the database
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @param {FileItem[]} filesToScan Array of files to be scanned
   * @param {FileUpdateItem[]} filesToUpdate Array of files that have been added or modified
   * @returns {Promise<void>}
   */
  async checkFile(
    rootPath: RootPathEntity,
    filesToScan: FileItem[],
    filesToUpdate: FileUpdateItem[],
  ): Promise<void> {
    if (!filesToScan.length) {
      return;
    }
    const fileItem = filesToScan.shift();
    if (!fileItem) {
      return;
    }
    const { path: filePath, lastModified } = fileItem;
    const relativePath = filePath.substring(rootPath.rootPath.length);
    // get the album for the file
    const fileName = basename(filePath);
    const albumPath = filePath
      .replace(rootPath.rootPath, '')
      .split(sep)
      .slice(0, 3)
      .join(sep);
    // check if the file exists in the database and is up to date
    const existingFile = await this.fileEntity.findOne({
      attributes: ['id', 'fileMtime'],
      where: {
        filePath: relativePath,
        accountId: rootPath.accountId,
      },
    });
    if (
      !existingFile ||
      existingFile.fileMtime.getTime() !== lastModified.getTime()
    ) {
      // get the idv3 information from the file
      let embeddedData: IAudioMetadata;
      try {
        embeddedData = await this.parseMetaData(filePath);
      } catch (error) {
        this.logger.error(`error reading metadata ${filePath}`, error);
        return;
      }
      if (!existingFile) {
        // add new track
        this.logger.log(`found new track ${filePath}`);
        const album = await this.indexAlbumService.updateAlbum(
          rootPath,
          embeddedData,
          albumPath,
          rootPath.accountId,
        );
        if (!album) {
          this.logger.error(`album not found for file ${filePath}`);
          return;
        }
        // if it doesn't exist add it to the database
        const newFile = await this.fileEntity.create({
          accountId: rootPath.accountId,
          albumId: album.id,
          fileMtime: lastModified,
          filePath: relativePath,
          fileSize: fileItem.size,
          fileType: fileName.split('.').pop() || '',
          rootPathId: rootPath.id,
        } as FileEntity);
        filesToUpdate.push({
          embeddedData,
          fileId: newFile.id,
          lastModified,
          path: relativePath,
          size: fileItem.size,
        });
      } else if (existingFile.fileMtime.getTime() !== lastModified.getTime()) {
        this.logger.log(`found modified track ${relativePath}`);
        // if it exists but the last-modified is different update it
        filesToUpdate.push({
          embeddedData,
          fileId: existingFile.id,
          lastModified,
          path: relativePath,
          size: fileItem.size,
        });
      }
    }
    await this.checkFile(rootPath, filesToScan, filesToUpdate);
  }

  /**
   * Recursively updates files until the queue is exhausted.  Each update will scan the file
   * for its IDv3 data and then synchronous the database with those values.
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @param {FileUpdateItem[]} filesToUpdate Array of files that have been added or modified
   * @returns {Promise<void>}
   */
  async updateFile(
    rootPath: RootPathEntity,
    filesToUpdate: FileUpdateItem[],
  ): Promise<void> {
    if (!filesToUpdate.length) {
      return;
    }
    const fileItem = filesToUpdate.shift();
    if (!fileItem) {
      return;
    }
    await this.synchronizeFile(
      fileItem.embeddedData,
      fileItem.fileId,
      fileItem.path,
      fileItem.size,
      fileItem.lastModified,
      rootPath.accountId,
    );
    await this.updateFile(rootPath, filesToUpdate);
  }

  /**
   * Copies the IDv3 data from the file to the database and updates the file's last-modified date
   * @param {IAudioMetadata} embeddedData The IDv3 data extracted from the file
   * @param {number} fileId The ID of the file in the database
   * @param {string} relativePath The path to the file on disk
   * @param {number} fileSize The size of the file
   * @param {Date} fileMtime The last-modified date of the file
   * @param {number} accountId The ID of the account owning the file
   * @returns {Promise<void>}
   */
  async synchronizeFile(
    embeddedData: IAudioMetadata,
    fileId: number,
    relativePath: string,
    fileSize: number,
    fileMtime: Date,
    accountId: number,
  ) {
    this.logger.log(`saving track ${relativePath}`);
    const transaction = await this.fileEntity.sequelize?.transaction();
    if (!transaction) {
      this.logger.error('transaction not available synchronizing file');
      return;
    }
    const fileDetail = await this.indexFileService.updateFile(
      embeddedData,
      fileId,
      accountId,
      transaction,
    );
    await this.indexArtistService.updateArtists(
      embeddedData,
      fileDetail,
      transaction,
    );
    await this.indexComposerService.updateComposers(
      embeddedData,
      fileDetail,
      transaction,
    );
    await this.indexGenreService.updateGenres(
      embeddedData,
      accountId,
      fileDetail,
      transaction,
    );
    await this.fileEntity.update(
      {
        fileMtime,
        fileSize,
        filePath: relativePath,
      },
      {
        where: {
          id: fileId,
        },
        transaction,
      },
    );
    try {
      await transaction.commit();
    } catch (error) {
      this.logger.error('transaction error synchronizing file', error);
      await transaction.rollback();
    }
  }

  async updateFolders(
    rootPath: RootPathEntity,
    uniqueFolderPaths: string[],
  ): Promise<void> {
    this.logger.log(`updating folders for root path ${rootPath.rootPath}`);
    if (!uniqueFolderPaths.length) {
      return;
    }
    const folderItem = uniqueFolderPaths.shift();
    if (!folderItem) {
      return;
    }
    await this.synchronizeFolder(rootPath, folderItem);
    await this.updateFolders(rootPath, uniqueFolderPaths);
  }

  async synchronizeFolder(
    rootPath: RootPathEntity,
    folderPath: string,
  ): Promise<void> {
    this.logger.log(`synchronizing folder ${folderPath}`);
    const existing = await this.folderEntity.findOne({
      where: {
        folderPath,
        accountId: rootPath.accountId,
      },
    });
    if (!existing) {
      await this.folderEntity.create({
        accountId: rootPath.accountId,
        folderPath,
        isRoot: folderPath === rootPath.rootPath,
        rootPathId: rootPath.id,
      } as FolderEntity);
    }
  }
}
