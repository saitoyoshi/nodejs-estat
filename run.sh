#!/bin/bash
URL=$(cat api_request_url)
filename=popu_source.csv
curl $URL -o $filename
echo "Save to $filename"
