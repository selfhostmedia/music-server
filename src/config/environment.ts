import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

/**
 * Structure of the environment configuration variables.
 */
export class Environment {
  /**
   * The SQLite database file path
   */
  @IsUrl()
  @IsNotEmpty()
  DATABASE_PATH!: string;

  /**
   * The JWT secret for signing and verifying tokens. This should be a long, random string for security purposes.
   */
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  /**
   * The environment the application is running in. This can be 'development', 'production', or 'test'.
   */
  @IsString()
  @IsIn(['development', 'production', 'test'])
  @IsNotEmpty()
  NODE_ENV!: 'development' | 'production' | 'test';

  /**
   * The public key is passed to Synology mobile apps to encrypt credentials
   */
  @IsString()
  PUBLIC_KEY_PATH!: string;

  /**
   * The private key is used by the application to decrypt credentials encrypted with the public key.
   */
  @IsString()
  PRIVATE_KEY_PATH!: string;

  /**
   * Whether authentication is required for accessing the application. This should be a boolean value.
   * If authentication is not required, any username/password will be accepted from client apps and
   * there will be one shared catalog for all users.
   *
   * If authentication is required users will need to provide valid username/password and each will have
   * their own libraries, playlists, etc.
   */
  @IsBoolean()
  REQUIRE_AUTH!: boolean;

  /**
   * The session expiration time in seconds. This should be a positive integer.
   */
  @IsString()
  @IsNotEmpty()
  SESSION_EXPIRES!: string;

  /**
   * The session master key used for encrypting and decrypting session data. This should be a long, random string for security purposes.
   */
  @IsString()
  @IsNotEmpty()
  SESSION_MASTER_KEY!: string;

  /**
   * The session signing key used for signing and verifying session data. This should be a long, random string for security purposes.
   */
  @IsString()
  @IsNotEmpty()
  SESSION_SIGNING_KEY!: string;

  /**
   * Optional flag for enabling the endpoints required to use Synology DS Audio apps
   */
  @IsBoolean()
  SYNOLOGY_AUDIOSTATION_ENABLED?: boolean;

  /**
   * Value required by Synology, it may be random not sure
   */
  @IsString()
  @IsOptional()
  SYNOLOGY_SERIAL?: string;

  /**
   * Value required by Synology, it may be random not sure
   */
  @IsString()
  @IsOptional()
  SYNOLOGY_ID?: string;

  /**
   * Value required by Synology, it may be random not sure
   */
  @IsString()
  @IsOptional()
  SYNOLOGY_TOKEN?: string;

  /**
   * Value required by Synology, it may be random not sure
   */
  @IsString()
  @IsOptional()
  SYNOLOGY_SMID?: string;
}
