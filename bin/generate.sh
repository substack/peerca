#!/bin/bash

# generate keys for the local system

HOST="$1"
if test -z "$HOST"; then
  echo 'host not provided' >&2
  exit 1;
fi

DIR="$2"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR" "$DIR/authorized" "$DIR/saved"

cd "$DIR"

# generate CA certificates
if test \! -e ca.pem; then
    echo 01 > ca.srl
    echo | openssl genrsa -passout stdin -out ca-key.pem 4096 || exit 1
    openssl req -batch -new -x509 -days 365 -key ca-key.pem -out ca.pem \
        || exit 1
    openssl rsa -in ca-key.pem -out ca-key.pem || exit 1
fi

# generate and sign server key
if test \! -e self-cert.pem; then
    echo 'extendedKeyUsage = clientAuth' > extfile.cnf
    
    echo | openssl genrsa -passout stdin -out self-key.pem 4096 \
        || exit 1
    
    openssl req -subj "/CN=$HOST" -new -key self-key.pem \
        -out self.csr || exit 1
    
    openssl x509 -req -days 365 -in self.csr -CA ca.pem \
        -CAkey ca-key.pem -out self-cert.pem || exit 1
fi
