#!/bin/bash
# db-migrate.sh <SIZE_PART> <DATASTORE> 

args=($*)
sizePart=${args[0]}
dataStore=${args[1]}

node load-tranf-prod.js ${sizePart} ${dataStore}

for file in data/*.json
do
  node import-prod.js ${file}
done
