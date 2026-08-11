/* eslint-disable max-classes-per-file */
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { IsDate, IsUUID, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * The SessionEntity holds all of the information required to authenticate a JWT session token provided by frontend clients.  Frontend
 * clients are fed a Base64-encoded JSON object that is signed by a secret on the server-side.  That signature is created against a secret
 * consisting of tokens from the platform-level so all sessions can be invalidated at once, the account level so a user's sessions can be
 * invalidated all at once, and the session-level so a specific session can be terminated
 */
export class SessionEntityDto {
  /**
   * The account ID the session belongs to
   */
  @ApiProperty({
    format: 'uuid',
    type: 'string',
  })
  @IsUUID(4, { message: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR })
  accountId!: Guid;

  /**
   * The date and time when the session was created in ISO 8601 format.
   */
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate({ message: ErrorCodes.INVALID_CREATED_AT_ERROR })
  createdAt!: Date;

  /**
   * The date and time the session was manually ended
   */
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @Type(() => Date)
  @ValidateIf((value) => value.endedAt?.length)
  @IsDate({ message: ErrorCodes.INVALID_ENDED_AT_ERROR })
  endedAt?: Date;

  /**
   * The date and time the session ends.  A session may end before this time by changing the token, or the
   * similar account-level token that can end all sessions belonging to an account, or the platform-level
   *  token that does the same for all users.
   */
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsDate({ message: ErrorCodes.INVALID_EXPIRES_AT_ERROR })
  @ValidateIf((value) => value.expiresAt?.length)
  expiresAt!: Date;

  /**
   * The unique identifier for the session. This is a UUID string.
   */
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(4, { message: ErrorCodes.INVALID_SESSION_ID_ERROR })
  id!: Guid;

  /**
   * The session token is a random UUID used as part of a secret token that verifies session information,
   * changing this value invalidates a session immediately.
   */
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID(4, { message: ErrorCodes.INVALID_JWT_TOKEN_ERROR })
  sessionToken!: Guid;

  /**
   * The date and time when the session was updated in ISO 8601 format.
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
 * The "partial" Session DTO has each property of the Session DTO defined as optional for ClassValidator.
 */
export class SessionPartialDto extends PartialType(SessionEntityDto) {}
