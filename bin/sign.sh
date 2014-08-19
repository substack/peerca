#!/bin/bash

CERT="$1"
if test -z "$CERT"; then
  echo 'cert not provided' >&2
  exit 1;
fi

DIR="$2"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR"

openssl x509 -req -days 365 -noin -CA "$DIR/ca.pem" \
  -CAkey "$DIR/ca-key.pem" -extfile "$DIR/extfile.cnf" -noout \
  || exit 1
