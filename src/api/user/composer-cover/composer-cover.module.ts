import { AlbumEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserComposerCoverController } from './composer-cover.controller';
import { UserComposerCoverService } from './composer-cover.service';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [UserComposerCoverController],
  providers: [UserComposerCoverService],
})
export class UserComposerCoverModule {}
