#!/bin/bash
shopt -s globstar
for file in ./tiles/**/*.png ; do
    newFile=${file%.png}.webp 
    cwebp "$file" -o "$newFile"
done
find ./tiles -type f -iname *.png -exec rm "{}" \;