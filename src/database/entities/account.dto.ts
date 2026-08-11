/* eslint-disable max-classes-per-file */
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/constants/enums';

export class AccountEntityDto {
  /**
   * The date and time when the account was created in ISO 8601 format.
   */
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate({ message: ErrorCodes.INVALID_CREATED_AT_ERROR })
  createdAt!: Date;

  /**
   * This email address is the main point of authentication and contact for users.
   */
  @ApiProperty({
    type: 'string',
    format: 'email',
  })
  @IsEmail(undefined, { message: ErrorCodes.INVALID_EMAIL_ERROR })
  @Length(6, 255, { message: ErrorCodes.INVALID_EMAIL_LENGTH_ERROR })
  email!: string;

  /**
   * The unique identifier for the account. This is a UUID string.
   */
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(4, { message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  id!: Guid;

  /**
   * The Bcrypt hash of the password used when authenticating the user.
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_HASH_ERROR })
  @Length(30, 60, { message: ErrorCodes.INVALID_PASSWORD_HASH_LENGTH_ERROR })
  passwordHash!: string;

  /**
   * The role of the user, which can be used for authorization purposes.
   */
  @ApiProperty({
    enum: Object.values(UserRole),
    enumName: 'UserRole',
    isArray: true,
  })
  @IsEnum(UserRole, { message: ErrorCodes.INVALID_ROLE_ERROR, each: true })
  role!: UserRole[];

  /**
   * The session token is a random UUID used as part of a secret token that verifies session information,
   * changing this value invalidates all sessions belonging to this user immediately.
   */
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(4, { message: ErrorCodes.INVALID_SESSION_KEY_ERROR })
  sessionKey!: Guid;

  /**
   * The date and time when the account was updated in ISO 8601 format.
   */
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate({ message: ErrorCodes.INVALID_UPDATED_AT_ERROR })
  updatedAt?: Date;
}

/**
 * The "partial" Account DTO has each property of the AccountEntity DTO defined as optional for ClassValidator.
 */
export class AccountPartialDto extends PartialType(AccountEntityDto) {}
