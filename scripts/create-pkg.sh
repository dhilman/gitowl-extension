#! /bin/bash

pnpm build

rm -rf dist-pkg
mkdir dist-pkg

cd dist
zip -r ../dist-pkg/gitowl.zip .
cd ..
