#!/bin/bash

set -e

echo -n 'Cleaning Up...' && rm -rf dist/ && rm -rf dist.zip && echo 'done'
echo -n 'Copying...' && cp ext/ -r dist/ && echo 'done'

if [ "$1" != "--no-zip" ] && [ "$1" != "-n" ]
then
  echo 'Zipping...' && echo && zip -r dist.zip dist && echo && echo 'DONE!!!'
fi
