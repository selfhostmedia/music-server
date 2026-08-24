import { IsDate, IsInt, IsString } from 'class-validator';

export class LibraryAlbumDto {
  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @IsString({ each: true })
  declare albumArtists: string[];

  @IsString({ each: true })
  declare albumComposers: string[];

  /**
   * The date the album was added to the library
   */
  @IsDate()
  declare createdAt: Date;

  /**
   * The display name of the artist, which is used for sorting and display consistency when albums
   * have a different artist name than the album artist name.  For example, a compilation album may have
   * multiple artists but the album artist is "Various Artists" and the display artist is "Various".
   */
  @IsString({ each: true })
  declare displayArtist: string[];

  /**
   * The name or title of the album, this would usually come from an official source such as MusicBrainz
   * or Discogs.
   */
  @IsString()
  declare displayName: string;

  /**
   * The internally-generated unique ID of the album
   */
  @IsInt()
  declare id: number;

  /**
   * The aggregate rating for the album, which is a value between 0 and 5 inclusive applied to tracks.
   */
  @IsString({ each: true })
  declare rating: number;

  /**
   * The name of the album used for sorting and display consistency, eg "Greatest Hits" but the display
   * name is "Greatest Hits (Remastered)".
   */
  @IsString()
  declare sortName: string;

  /**
   * The year the album was released.
   */
  @IsInt()
  declare year: number;
}
