# peerca

issue and revoke TLS certificates for authentication

Certificates can function in a similar way to ~/.ssh/authorized_keys except with
more indirection. This package removes some of that indirection.

This package shells out to `openssl` commands to generate certificates.

# example

## tls authentication

``` js
```

## docker authentication

# usage

```
peerca COMMAND OPTIONS

  peerca generate HOST {-d DIR}
 
    Generate local certificates for HOST in DIR/HOST.

  peerca sign CERT.pem HOST {-d DIR}

    Sign CERT.pem using the certificates in DIR/HOST.

  peerca cafile HOST {-d DIR}

    Print the path to the cafile for PROFILE in DIR.

  OPTIONS
  
    -d DIR      Profile directory. If not provided uses the environment
                variable $PEERCA_DIR or ~/.config/peerca

```

# methods

``` js
```

