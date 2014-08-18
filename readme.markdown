# peerca

issue and revoke certificates for authentication over TLS connections

Certificates can function in a similar way to ~/.ssh/authorized_keys except with
more indirection. This package removes some of that indirection.

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

# example

## tls authentication

``` js
```

## docker authentication

