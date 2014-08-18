#!/bin/bash

HOST="$1"
if test -z "$HOST"; then
  echo 'host not provided' >&2
  exit 1;
fi

DIR="$2"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR"

cd "$DIR"

openssl genrsa -des3 -out client-key.pem 4096
openssl req -subj '/CN=client' -new -key client-key.pem \
  -out client.csr

