/* eslint-disable max-classes-per-file */
import { FileTypeEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';

export class LibraryTrackDto {
  /**
   * The internally-generated unique ID of the track
   */
  @IsInt()
  declare id: number;

  /**
   * The list of artists for the track, if it is a comma-delimited string then it will be parsed into
   * an array each containing one name.  This data is very inconsistently-formatted even in official-ish
   * sources like MusicBrainz so it may end up with multiple artists in a single string.
   */
  @IsString({ each: true })
  declare artists: string[];

  /**
   * The list of composers for the track, if it is a comma-delimited string then it will be parsed into
   * an array each containing one name.  This data is very inconsistently-formatted even in official-ish
   * sources like MusicBrainz so it may end up with multiple composers in a single string.
   */
  @IsString({ each: true })
  declare composers: string[];

  /**
   * The disc number of the track on the album or disc if there are multiple discs.  If this field is not
   * specified it is assumed to be a single-disc album.
   */
  declare discNumber: number;

  /**
   * The duration of the track in seconds.
   */
  @IsNumber()
  declare duration: number;

  /**
   * The internally-generated unique ID of the file associated with the track
   */
  @IsInt()
  declare fileId: number;

  /**
   * The list of genres for the track, if it is a comma-delimited string then it will be parsed into
   * an array each containing one name.
   */
  @IsString({ each: true })
  declare genres: string[];

  /**
   * The track number of the track on the album or disc if there are multiple discs.
   */
  @IsInt()
  declare trackNumber: number;

  /**
   * The rating of the track which is a value between 0 and 5 inclusive applied to the track.
   */
  @IsInt()
  declare rating: number;

  /**
   * The title of the track, which is usually the name of the song or piece of music.
   */
  @IsString()
  declare title: string;

  /**
   * The year of release of the track, often the same as the album except in "greatest hits"
   * and compilations.
   */
  @IsInt()
  declare year: number;
}

export class LibraryTrackExtendedDto extends LibraryTrackDto {
  @IsString()
  declare albumTitle: string;

  @IsString({ each: true })
  declare albumArtists: string[];

  /**
   * The comment or description associated with the track.
   */
  @IsString()
  declare comment: string;

  /**
   * The bitrate of the audio file for the track, in kbps.
   */
  @IsInt()
  declare fileBitRate: number;

  /**
   * The number of audio channels in the file for the track, such as 2 for stereo or 1 for mono.
   */
  @IsInt()
  declare fileChannels: number;

  /**
   * The frequency or sample rate of the audio file for the track, in Hz.
   */
  @IsInt()
  declare fileFrequency: number;

  /**
   * The file path of the file for the track.
   */
  @IsString()
  declare filePath: string;

  /**
   * The size of the file in bytes
   */
  @IsInt()
  declare fileSize: number;

  /**
   * The type of the file for the track, such as MP3, FLAC, etc.
   */
  @IsEnum(FileTypeEnum)
  declare fileType: FileTypeEnum;
}
