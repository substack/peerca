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

  peerca generate {-d DIR | -p PROFILE}

  peerca sign CERT.pem {-d DIR | -p PROFILE}

  peerca cafile {-d DIR | -p PROFILE}

    Print the path to the cafile for PROFILE in DIR.

  OPTIONS
  
    -d DIR      Profile directory. If not provided uses the environment
                variable $PEERCA_DIR or ~/.config/peerca

    -p PROFILE  Profile name. Defaults to the $PEERCA_PROFILE environment
                variable, which is a subdirectory of the profile
                directory.

```

# methods

``` js

```
