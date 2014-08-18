#!/bin/bash

CERT="$1"
if test -z "$CERT"; then
  echo 'cert not provided' >&2
  exit 1;
fi

DIR="$2"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR"

cd "$DIR"

openssl x509 -req -days 365 -in "$CERT" -CA ca.pem -CAkey ca-key.pem \
  -out client-cert.pem -extfile extfile.cnf || exit 1
