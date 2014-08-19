#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var spawn = require('child_process').spawn;

var minimist = require('minimist');
var split = require('split');
var through = require('through2');

var argv = minimist(process.argv.slice(2), {
    alias: {
        h: 'help',
        d: ['dir','directory'],
        p: 'port',
        o: 'outfile'
    },
    default: {
        dir: process.env.PEERCA_PATH
            || path.join(process.env.HOME, '.config/peerca')
    }
});

var cmd = argv._[0];

if (argv.help || match(cmd, 'help', 2)) {
    usage(0);
}
else if (match(cmd, 'generate', 1)) {
    var host = argv._[1];
    if (!host) {
        console.error('ERROR: peerca generate requires a HOST argument');
        return usage(1);
    }
    var args = [ host, path.join(argv.dir, host) ];
    spawn(path.join(__dirname, 'generate.sh'), args, { stdio: 'inherit' })
        .on('exit', function (code) { assert.equal(code, 0) })
    ;
}
else if (match(cmd, 'hash', 2)) {
    var host = argv._[1];
    if (!host) {
        console.error('ERROR: peerca generate requires a HOST argument');
        return usage(1);
    }
    var args = [ path.join(argv.dir, host) ];
    spawn(path.join(__dirname, 'hash.sh'), args, { stdio: [ 0, 'pipe', 2 ] })
        .on('exit', function (code) { assert.equal(code, 0) })
        .stdout.pipe(split()).pipe(through(function (buf, enc, next) {
            var line = buf.toString('utf8');
            var m = /^SHA1 Fingerprint=(\S+)/.exec(line);
            if (!m) { this.push(buf + '\n'); return next() }
            this.push(m[1].split(':').join('').toLowerCase());
            next();
        })).pipe(process.stdout)
    ;
}
else if (match(cmd, 'sign', 2)) {
    var certfile = argv._[1];
    if (!certfile) {
        console.error('ERROR: peerca sign requires a CERT.ca argument');
        return usage(1);
    }
    var host = argv._[2];
    if (!host) {
        console.error('ERROR: peerca sign requires a HOST argument');
        return usage(1);
    }
    var args = [
        path.resolve(certfile),
        argv.outfile,
        path.join(argv.dir, host)
    ];
    var opts = { stdio: [ 0, 'pipe', 2 ] };
    spawn(path.join(__dirname, 'sign.sh'), args, opts)
        .on('exit', function (code) { assert.equal(code, 0) })
        .stdout.pipe(process.stdout)
    ;
}
else if (match(cmd, 'cafile', 2)) {
    var host = argv._[1];
    if (!host) {
        console.error('ERROR: peerca cafile requires a HOST argument');
        return usage(1);
    }
    console.log(path.join(argv.dir, host, 'ca.pem'));
}
else usage(1)

function match (s, m, len) {
    return s && s.length >= len && m.slice(0, s.length) === s;
}

function usage (code) {
    var rs = fs.createReadStream(__dirname + '/usage.txt');
    rs.pipe(process.stdout);
    if (code) rs.on('end', function () { process.exit(code) });
}
