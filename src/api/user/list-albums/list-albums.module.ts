import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListAlbumsController } from './list-albums.controller';
import { UserListAlbumsService } from './list-albums.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListAlbumsController],
  providers: [UserListAlbumsService],
})
export class UserListAlbumsModule {}
