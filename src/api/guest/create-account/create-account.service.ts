import * as bcrypt from 'bcryptjs';
import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import {
  GuestCreateAccountBodyDto,
  GuestCreateAccountDataDto,
} from './create-account.dto';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class GuestCreateAccountService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async post(
    userAgent: string,
    body: GuestCreateAccountBodyDto,
  ): Promise<GuestCreateAccountDataDto> {
    const { username, password } = body;
    const exists = await this.accountEntity.findOne({
      attributes: ['id'],
      where: {
        username,
      },
    });
    if (exists?.id) {
      throw new BadRequestException(
        ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
      );
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    try {
      const account = await this.accountEntity.create({
        username,
        passwordHash,
      } as AccountEntity);
      const jwtToken = await this.authenticationService.createSession(
        username,
        password,
        userAgent,
        7,
      );
      return {
        accountId: account.id,
        jwtToken,
      };
    } catch {
      throw new InternalServerErrorException(ErrorCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
