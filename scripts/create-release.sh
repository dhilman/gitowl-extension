#! /bin/bash

pnpm build

rm -rf release
mkdir release

cd dist
zip -r ../release/gitowl.zip .
cd ..
