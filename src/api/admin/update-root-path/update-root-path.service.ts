import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { RootPathEntity } from 'src/database/entities';
import { existsSync } from 'node:fs';

@Injectable()
export class AdminUpdateRootPathService {
  constructor(
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  /**
   * Updates a root path in the platform.
   * @param {number} rootPathId The ID of the root path to update.
   * @param {string} newPath The new path to set for the root path.
   */
  async updateRootPath(rootPathId: number, newPath: string): Promise<void> {
    const rootPath = await this.rootPathEntity.findByPk(rootPathId);
    if (!rootPath) {
      throw new NotFoundException(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    if (!existsSync(newPath)) {
      throw new BadRequestException(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    }
    await this.rootPathEntity.update({ rootPath: newPath }, { where: { id: rootPathId } });
  }
}
