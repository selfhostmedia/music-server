import { AlbumEntity } from 'src/database/entities/album.entity';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserAlbumCoverController } from './album-cover.controller';
import { UserAlbumCoverService } from './album-cover.service';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [UserAlbumCoverController],
  providers: [UserAlbumCoverService],
})
export class UserAlbumCoverModule {}
