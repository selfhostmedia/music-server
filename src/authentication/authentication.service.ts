import * as bcrypt from 'bcryptjs';
import { AccountEntity, SessionEntity } from 'src/database/entities';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    private readonly configService: ConfigService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @InjectModel(SessionEntity)
    private readonly sessionEntity: typeof SessionEntity,
  ) {}

  /**
   * Creates a user session used for access APIs requiring authentication
   * @param {string} username The username of the account the session is being created for
   * @param {string} password The password of the account the session is being created for
   * @param {string} userAgent The user agent of the client creating the session
   * @param {number} [expiresDays] Optional number of days until the session expires.  Defaults to 1 day if not provided.
   * @returns {Promise<string>} The JWT session token
   */
  async createSession(
    username: string,
    password: string,
    userAgent: string,
    expiresDays?: number,
  ): Promise<string> {
    const account = await this.accountEntity.findOne({
      where: {
        username,
      },
      attributes: ['id', 'passwordHash', 'sessionKey'],
    });
    if (!account?.id) {
      throw new NotFoundException(ErrorCodes.INVALID_USERNAME_ERROR);
    }
    if (!bcrypt.compareSync(password, account.passwordHash)) {
      throw new BadRequestException(ErrorCodes.INVALID_PASSWORD_ERROR);
    }
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + (expiresDays || 1));
    const session = await this.sessionEntity.create({
      accountId: account.id,
      createdAt: now,
      expiresAt,
      userAgent,
      sessionToken: Guid.create(),
    } as SessionEntity);
    return this.generateSignedToken(account, session, expiresAt);
  }

  async endSession(accountId: number, sessionId: number): Promise<void> {
    const updatedSession = await this.sessionEntity.update(
      { expiresAt: new Date() },
      {
        where: {
          id: sessionId,
          accountId,
        },
      },
    );
    if (!updatedSession[0]) {
      throw new NotFoundException(ErrorCodes.SESSION_NOT_FOUND_ERROR);
    }
  }

  /**
   * Generates a device token by hashing the session information with the account session key and a master
   * key.  This is used as part of session authentication to bind a session to a specific device user agent.
   * @param {string} userAgent The user agent of the client creating the session
   * @returns {string} The generated session token
   */
  private generateDeviceToken(userAgent: string) {
    const masterKey = this.configService.get('SESSION_MASTER_KEY');
    return `${masterKey}-${userAgent}`;
  }

  /**
   * Generates a session token by hashing the session information with the account session key and a master key.  This is used as part of the JWT token generation and verification process to ensure the JWT token is valid and was generated from the correct session information and account session key
   * @param {Guid} accountSessionKey The session key of the account
   * @param {SessionEntity} session The session entity
   * @returns {string} The generated session token
   */
  private generateSessionToken(
    accountSessionKey: Guid,
    session: SessionEntity,
  ) {
    const masterKey = this.configService.get('SESSION_MASTER_KEY');
    const sessionToken = session.sessionToken.toString();
    return `${masterKey}-${accountSessionKey}-${sessionToken}-${session.createdAt.toUTCString()}`;
  }

  generateDeviceHash(userAgent: string) {
    const token = this.generateDeviceToken(userAgent);
    return bcrypt.hashSync(token, 10);
  }

  /**
   * Hashes a new session token from the session information and account session key.  This is used as part of the JWT
   * token generation and verification process to ensure the JWT token is valid and was generated from the correct
   * session information and account session key
   * @param {Guid} accountSessionKey The session key of the account
   * @param {SessionEntity} session The session entity
   * @returns {string} The hashed session token
   */
  generateSessionTokenHash(accountSessionKey: Guid, session: SessionEntity) {
    const token = this.generateSessionToken(accountSessionKey, session);
    return bcrypt.hashSync(token, 10);
  }

  /**
   * Generates a JWT session token from a user session by hashing the session information with the account session key
   * and a master key and signing it with a secret signing key
   * @param {AccountEntity} account The account entity
   * @param {SessionEntity} session The session entity
   * @returns {Promise<string>} The JWT session token
   */
  async generateSignedToken(
    account: AccountEntity,
    session: SessionEntity,
    expires: Date,
  ): Promise<string> {
    return this.jwtService.signAsync({
      accountId: session.accountId,
      sessionId: session.id,
      tokenHash: this.generateSessionTokenHash(account.sessionKey, session),
      exp: Math.floor(expires.getTime() / 1000),
    });
  }

  async getAccount(id: number): Promise<AccountEntity> {
    const account = await this.accountEntity.findByPk(id);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    return account;
  }

  async getSession(id: number): Promise<SessionEntity> {
    const session = await this.sessionEntity.findByPk(id);
    if (!session) {
      throw new NotFoundException(ErrorCodes.SESSION_NOT_FOUND_ERROR);
    }
    return session;
  }

  verifyDeviceToken(userAgent: string, deviceToken: string): boolean {
    const token = this.generateDeviceToken(userAgent);
    return bcrypt.compareSync(token, deviceToken);
  }

  /**
   * Verifies a session token by comparing its hashed secret to the original secret string it was from
   * @param {AccountEntity} account The account entity the session belongs to
   * @param {SessionEntity} session The session entity
   * @param {string} tokenHash The hashed session token to compare against
   * @returns {boolean} Whether the session token is valid
   */
  verifySessionToken(
    account: AccountEntity,
    session: SessionEntity,
    tokenHash: string,
  ): boolean {
    const token = this.generateSessionToken(account.sessionKey, session);
    return bcrypt.compareSync(token, tokenHash);
  }
}
