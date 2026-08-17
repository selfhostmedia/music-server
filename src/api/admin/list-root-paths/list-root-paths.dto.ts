/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdminRootPathDto {
  /**
   * The ID of the account that owns this root path
   */
  @IsNumber()
  declare accountId: number;

  /**
   * The date and time the row was created
   */
  @IsDate()
  declare createdAt: Date;

  /**
   * The number of files or songs that have been found in this root path, this excludes
   * anything that is not a music track.
   */
  @IsNumber()
  declare fileCount: number;

  /**
   * The ID of the root path row in the database
   */
  @IsNumber()
  declare id: number;

  /**
   * The fully-qualified path of the root path, this is the base path where music is stored for a user
   */
  @IsString()
  declare rootPath: string;

  /**
   * The total size of all the files in this root path contained in the `fileCount` field
   */
  @IsNumber()
  declare totalSize: number;

  /**
   * The date and time the row was last updated, this field is optional and may not be present if the row has never been updated
   */
  @IsDate()
  @IsOptional()
  declare updatedAt?: Date;

  /**
   * The username of the account that owns this root path
   */
  @IsString()
  declare username: string;
}

export class AdminListRootPathsResponseDto {
  /**
   * The list of root paths with associated account owner information
   */
  @ApiProperty({
    type: AdminRootPathDto,
    isArray: true,
  })
  declare rootPaths: AdminRootPathDto[];
}
