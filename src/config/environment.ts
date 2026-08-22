import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

/**
 * Structure of the environment configuration variables.
 */
export class Environment {
  /**
   * Flag for running database migrations and seeders on application startup. The
   * only time you would not set this is if you are running the server directly and
   * have manually run the migration/seed scripts as required.
   */
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  BUILD_DATABASE?: boolean;

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
   * The session expiration time in seconds. This should be a positive integer.
   */
  @IsString()
  @IsNotEmpty()
  SESSION_EXPIRES!: string;

  /**
   * Optional flag for enabling the endpoints required to use Synology DS Audio apps
   */
  @IsBoolean()
  SYNOLOGY_AUDIOSTATION_ENABLED?: boolean;
}
