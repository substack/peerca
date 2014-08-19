#!/bin/bash

CERT="$1"
if test -z "$CERT"; then
  echo 'cert not provided' >&2
  exit 1;
fi

OUTFILE="$2"
if test -z "$CERT"; then
  echo 'outfile not provided' >&2
  exit 1;
fi

DIR="$3"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR"

openssl x509 -req -days 365 -in "$CERT" -CA "$DIR/ca.pem" \
  -CAkey "$DIR/ca-key.pem" -extfile "$DIR/extfile.cnf" -out "$OUTFILE" \
  || exit 1
