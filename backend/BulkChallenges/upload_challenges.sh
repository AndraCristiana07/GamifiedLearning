#!/bin/bash

API_URL="http://localhost:5180/api/challenges/bulk"

echo "Uploading challenges..."


echo "Sending challenge..."
curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d @challenges.json

echo ""

echo "Done!"