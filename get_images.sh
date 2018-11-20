#!/usr/bin/env bash

mkdir -p images
cd images

for link in $(cat "../data.json" | jq -r ".[] | .link"); do
  echo "Link: $link"
  article=$(wget -qO- "$link" | pup "article:nth-of-type(1)")

  id=$(echo "$article" | pup "article attr{data-article-id}")
  echo "ID: $id"

  hero=$(echo "$article" | pup "header attr{style}" | grep -oP "(?<=\(&#39;).*(?=&#39;\))")
  echo "Hero: $hero"

  images=$(echo "$article" | pup "img attr{src}")
  echo "Images:"
  echo "$images"

  mkdir -p $id
  cd $id

  hero_filename="${hero##*/}"
  wget "$hero" -O "hero.${hero_filename}"

  for image in $images; do
    wget "$image"
  done

  cd ..
done
