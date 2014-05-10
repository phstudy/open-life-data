#!/bin/bash

wget -O data.json "http://data.taipei.gov.tw/opendata/apply/query/NzIyMjU2N0EtMjA3RC00QTlDLUJEREUtM0VFMjlBQjlFOEY2?$format=json"

sed s/case_id/_id/g data.json | mongoimport -h 10.211.55.13 -d iculture -c places --jsonArray --upsert

node ./geocode/geocode.js

exit 0
