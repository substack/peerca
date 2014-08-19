#!/bin/bash

mkdir -p keys/client keys/localhost

peerca generate localhost -d ./keys
peerca generate client -d ./keys

peerca sign keys/client/self.csr localhost -d ./keys \
  -o keys/client/localhost-connect.pem
