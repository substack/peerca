#!/bin/bash

DIR="$1"
if test -z "$DIR"; then DIR="$PWD"; fi
mkdir -p "$DIR"

openssl x509 -in "$DIR/self-cert.pem" -sha1 -noout -fingerprint || exit 1
