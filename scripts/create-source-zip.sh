#! /bin/bash

zip -r gitowl-source.zip . -x "dist/*" "release/*" "scripts/*" ".*" "node_modules/*"
