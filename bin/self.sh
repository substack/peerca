#!/bin/bash

# generate keys for the local system

HOST="$1"
if test -z "$HOST"; then
  echo 'host not provided' >&2
  exit 1;
fi

DIR="$2"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR"

cd "$DIR"

# generate CA certificates
if test \! -e ca.pem; then
    echo 01 > ca.srl
    echo | openssl genrsa -passout stdin -out ca-key.pem 4096
    openssl req -batch -new -x509 -days 365 -key ca-key.pem -out ca.pem
    openssl rsa -in ca-key.pem -out ca-key.pem
fi

# generate and sign server key
if test \! -e server-cert.pem; then
    echo | openssl genrsa -passout stdin -out server-key.pem 4096
    openssl req -subj "/CN=$HOST" -new -key server-key.pem \
      -out server.csr
    
    openssl x509 -req -days 365 -in server.csr -CA ca.pem \
      -CAkey ca-key.pem -out server-cert.pem
fi
