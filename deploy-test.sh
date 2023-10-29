#!/bin/sh
source '.env'
npm run build
rojo build -o build.rbxlx
mantle deploy --environment dev