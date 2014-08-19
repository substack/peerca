#!/bin/bash

mkdir -p keys/client keys/server

peerca generate server -d ./keys
peerca generate client -d ./keys

peerca sign keys/client/self.csr server -d ./keys \
  -o keys/client/server-connect.pem
