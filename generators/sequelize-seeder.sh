#!/bin/bash
# eg: ./sequelize-seeder.sh add-table-data
TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILE_PATH=./src/database/seeders/$TIMESTAMP-$1.ts
OVERWRITE=$2

if [ -z $1 ]; then
  echo npm run generate:seeder add-table-data
  exit 0
fi

if [ -f "$FILE_PATH" ] && [ "$OVERWRITE" != "--overwrite" ]; then
  echo "Error: Seeder file already exists at $FILE_PATH"
  echo "Use the --overwrite flag to overwrite existing files."
  exit 1
fi

echo "Generating seeder at $FILE_PATH"

mkdir -p $(dirname "$FILE_PATH")

# The module file
cat <<EOF > $FILE_PATH
import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
}

export async function down(queryInterface: QueryInterface) {
}
EOF
