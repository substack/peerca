#!/bin/bash
# in a real setting, replace localhost with FQDN like "substack.net"

mkdir -p keys/client keys/server

peerca generate -d keys/server -h localhost
peerca generate -d keys/client

peerca request -d keys/client \
| peerca authorize -d keys/server \
| peerca add localhost -d keys/client
