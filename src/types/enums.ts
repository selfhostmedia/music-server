export enum FileType {
  FLAC = 'flac',
  M4A = 'm4a',
  MP3 = 'mp3',
  OGG = 'ogg',
}

export enum ContentType {
  FILE = 'file',
  FOLDER = 'folder',
  REMOTE = 'remote',
}

export enum ShoutcastItemType {
  CONTAINER = 'container',
  STATION = 'station',
}

export enum PlaylistType {
  NORMAL = 'normal',
  SMART = 'smart',
}

export enum SmartPlaylistConjugal {
  AND = 'and',
  OR = 'or',
}

export enum SmartPlaylistOperation {
  /**
   * A field date value is after a rule value.
   */
  AFTER = 'after',
  /**
   * A field date value is before a rule value.
   */
  BEFORE = 'before',
  /**
   * A field string value contains a rule value.
   */
  CONTAINS = 'contains',
  /**
   * A field string value does not contain a rule value.
   */
  DOES_NOT_CONTAIN = 'does_not_contain',
  /**
   * A field string value is GTE to a rule value.
   */
  GREATER_THAN_OR_EQUAL_TO = 'greater_than_or_equal_to',
  /**
   * A field date value is in the last <rule value> <interval value>.
   */
  IN_THE_LAST = 'in_the_last',
  /**
   * A field string value is equal to a rule value.
   */
  IS = 'is',
  /**
   * A field string value is not equal to a rule value.
   */
  IS_NOT = 'is_not',
  /**
   * A field numeric value is less than a rule value.
   */
  LESS_THAN = 'less_than',
  /**
   * A field date value is not in the last <rule value> <interval value>.
   */
  NOT_IN_THE_LAST = 'not_in_the_last',
}

export enum SmartPlaylistIntervalTag {
  /**
   * A field date value is in or not in the last <rule value> days.
   */
  DAYS = 'days',
  /**
   * A field date value is in or not in the last <rule value> weeks.
   */
  WEEKS = 'weeks',
  /**
   * A field date value is in or not in the last <rule value> months.
   */
  MONTHS = 'months',
}

export enum SmartPlaylistField {
  ARTIST = 'artist',
  ALBUM = 'album',
  ALBUM_ARTIST = 'album_artist',
  COMPOSER = 'composer',
  GENRE = 'genre',
  FILE_PATH = 'file_path',
  YEAR = 'year',
  BIT_RATE = 'bit_rate',
  DATE_ADDED = 'date_added',
  RATING = 'rating',
}
