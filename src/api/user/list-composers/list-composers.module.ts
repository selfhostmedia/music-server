import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListComposersController } from './list-composers.controller';
import { UserListComposersService } from './list-composers.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListComposersController],
  providers: [UserListComposersService],
})
export class UserListComposersModule {}
