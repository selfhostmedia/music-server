import { AlbumEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserArtistCoverController } from './artist-cover.controller';
import { UserArtistCoverService } from './artist-cover.service';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [UserArtistCoverController],
  providers: [UserArtistCoverService],
})
export class UserArtistCoverModule {}
