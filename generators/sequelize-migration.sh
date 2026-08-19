#!/bin/bash
# eg: ./sequelize-migration.sh create-table-foo
TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILE_PATH=./src/database/migrations/$TIMESTAMP-$1.ts
OVERWRITE=$2

if [ -z $1 ]; then
  echo npm run generate:migration create-table-foo
  exit 0
fi


if [ -f "$FILE_PATH" ] && [ "$OVERWRITE" != "--overwrite" ]; then
  echo "Error: Migration file already exists at $FILE_PATH"
  echo "Use the --overwrite flag to overwrite existing files."
  exit 1
fi

echo "Generating migration at $FILE_PATH"

mkdir -p $(dirname "$FILE_PATH")

# The module file
cat <<EOF > $FILE_PATH
import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
}

export async function down(queryInterface: QueryInterface) {
}
EOF
