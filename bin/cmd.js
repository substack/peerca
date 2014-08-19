#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var spawn = require('child_process').spawn;

var minimist = require('minimist');
var split = require('split');
var through = require('through2');
var defined = require('defined');

var peerca = require('../');

var argv = minimist(process.argv.slice(2), {
    alias: {
        h: 'host',
        d: ['dir','directory'],
        p: 'port',
        o: 'outfile',
        i: 'infile'
    },
    default: {
        dir: defined(
            process.env.PEERCA_PATH,
            path.join(process.env.HOME, '.config/peerca')
        ),
        host: defined(process.env.PEERCA_HOST, 'localhost'),
        outfile: '-',
        infile: '-'
    }
});

var cmd = argv._[0];

if (argv.help || match(cmd, 'help', 2)) {
    usage(0);
}
else if (match(cmd, 'generate', 1)) {
    var host = defined(argv._[1], 'localhost');
    var args = [ host, path.join(argv.dir, host) ];
    spawn(path.join(__dirname, 'generate.sh'), args, { stdio: 'inherit' })
        .on('exit', function (code) { assert.equal(code, 0) })
    ;
}
else if (match(cmd, 'fingerprint', 2)) {
    var ca = peerca(argv);
    ca.fingerprint(function (err, hash) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else console.log(hash);
    });
}
else if (match(cmd, 'authorize', 2)) {
    var certfile = argv._[1];
    if (!certfile) {
        console.error('ERROR: peerca sign requires a CERT.ca argument');
        return usage(1);
    }
    var host = defined(argv._[2], 'localhost');
    var args = [
        path.resolve(certfile),
        path.join(argv.dir, host)
    ];
    var input = argv.infile !== '-'
        ? fs.createReadStream(argv.infile)
        : process.stdin
    ;
    var output = argv.outfile !== '-'
        ? fs.createWriteStream(argv.outfile)
        : process.stdout
    ;
    var ps = spawn(path.join(__dirname, 'sign.sh'), args);
    ps.on('exit', function (code) { assert.equal(code, 0) })
    ps.stdout.pipe(output);
}
else if (match(cmd, 'request', 2)) {
    var host = defined(argv._[1], 'localhost');
    var file = path.join(argv.dir, host, 'self.csr');
    fs.createReadStream(file).pipe(process.stdout);
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
