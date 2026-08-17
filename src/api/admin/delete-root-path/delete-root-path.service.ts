import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';

@Injectable()
export class AdminDeleteRootPathService {
  constructor(
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  /**
   * Deletes a root path from the platform.
   * @param {number} rootPathId The ID of the root path to delete.
   */
  async delete(rootPathId: number): Promise<void> {
    const existingRootPath = await this.rootPathEntity.findByPk(rootPathId);
    if (!existingRootPath) {
      throw new NotFoundException(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    await this.rootPathEntity.destroy({
      where: { id: rootPathId },
      cascade: true,
    });
  }
}
