#!/bin/bash

# entryscript.sh for Heroku
# To disable auto bootstrap database, set DB_BOOTSTRAP to 1 on env

# web server (main)
yarn run prod &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start web server: $status"
  exit $status
fi

PROCESS_2_DIED=0
# bootstrap database
if [ ! -z "${DB_BOOTSTRAP}" ]; then
  echo "Bootstrap database option disabled"
  PROCESS_2_DIED=1
else
  yarn run bootstrap-database &
  status=$?
  if [ $status -ne 0 ]; then
    echo "Failed to start bootstrap database: $status"
    exit $status
  fi
fi

while sleep 15; do
  ps aux |grep "ts-node ./src/index.ts" |grep -q -v grep
  PROCESS_1_STATUS=$?
  ps aux |grep "ts-node --files ./scripts/database.ts" |grep -q -v grep
  PROCESS_2_STATUS=$?
  # If the greps above find anything, they exit with 0 status
  # If they are not both 0, then something is wrong
  if [ $PROCESS_1_STATUS -ne 0 ]; then
    echo "Web server has already exited."
    exit 1
  fi

  if [ $PROCESS_2_STATUS -ne 0 ] && [ $PROCESS_2_DIED -ne 1 ]; then
    echo "Bootstrap database script has already exited."
    PROCESS_2_DIED=1
  fi
done