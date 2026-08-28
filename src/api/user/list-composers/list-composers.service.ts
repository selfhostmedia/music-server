import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListComposersQueryDto } from './list-composers.dto';

@Injectable()
export class UserListComposersService {
  constructor(private readonly libraryService: LibraryService) {}

  async listComposers(accountId: number, query: UserListComposersQueryDto) {
    const composers = await this.libraryService.listComposers(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      composers: composers.items,
      offset: query.offset || 0,
      total: composers.total,
    };
  }
}
