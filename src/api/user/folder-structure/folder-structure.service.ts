import { FileEntity } from 'src/database/entities/file.entity';
import { FolderEntity } from 'src/database/entities/folder.entity';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable } from '@nestjs/common';
import { UserTreeItemDto } from './folder-structure.dto';
import { sep } from 'node:path';

function pathsToTree(basePath: string, paths: string[]): UserTreeItemDto {
  const root: UserTreeItemDto = {
    folder: basePath,
    fullPath: basePath,
    children: [],
  };
  for (let i = 0, len = paths.length; i < len; i += 1) {
    const fullPath = paths[i];
    if (fullPath && fullPath !== basePath) {
      if (fullPath.startsWith(`${basePath}/`)) {
        const relativePath = fullPath.slice(basePath.length + 1);
        const parts = relativePath.split('/');
        let current: UserTreeItemDto = root;
        for (let j = 0, jLen = parts.length; j < jLen; j += 1) {
          const part = parts[j];
          if (part) {
            const isFile = j === parts.length - 1 && /\.[^/]+$/.test(part);
            if (isFile) {
              current.children?.push({ file: part, fullPath });
            } else {
              let folder: UserTreeItemDto | undefined = current.children?.find((node) => node.folder === part);
              if (!folder) {
                folder = {
                  folder: part,
                  fullPath,
                  children: [],
                };
                current.children?.push(folder);
              }
              current = folder;
            }
          }
        }
      }
    }
  }
  return root;
}

@Injectable()
export class UserFolderStructureService {
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
  ) {}

  async getTreeStructure(accountId: number) {
    const rootPaths = await this.folderEntity.findAll({
      attributes: ['id', 'folderPath', 'rootPathId'],
      where: {
        accountId,
        isRoot: true,
      },
    });
    const files = await this.fileEntity.findAll({
      attributes: ['filePath', 'rootPathId'],
      where: {
        accountId,
      },
    });
    const trees: UserTreeItemDto[] = [];
    for (let i = 0, len = rootPaths.length; i < len; i += 1) {
      const rootPath = rootPaths[i];
      if (rootPath) {
        const fileIndex: Record<string, string[]> = {};
        for (let j = 0, jLen = files.length; j < jLen; j += 1) {
          const file = files[j];
          if (file?.rootPathId === rootPath.rootPathId) {
            const filePath = file.filePath.split('/').slice(0, -1).join(sep);
            const array = fileIndex[filePath] || [];
            array.push(file.filePath);
            fileIndex[filePath] = array;
          }
        }
        // eslint-disable-next-line no-await-in-loop
        const folders = await this.folderEntity.findAll({
          attributes: ['folderPath'],
          where: {
            accountId,
            rootPathId: rootPath.rootPathId,
          },
        });
        const paths: string[] = [];
        for (let j = 0, jLen = folders.length; j < jLen; j += 1) {
          const folder = folders[j];
          if (folder) {
            paths.push(folder.folderPath);
            const folderPath = folder.folderPath.substring(rootPath.folderPath.length);
            const folderFiles = fileIndex[folderPath] || [];
            paths.push(...folderFiles.map((file) => `${rootPath.folderPath}${file}`));
          }
        }
        trees.push(pathsToTree(rootPath.folderPath, paths));
      }
    }
    return trees;
  }
}
