#! /bin/bash

zip -r gitowl-source.zip . -x "dist/*" "dist-pkg/*" "scripts/*" ".*" "node_modules/*"
