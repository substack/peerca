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
    var ca = peerca(argv);
    var ps = ca.generate();
    ps.stderr.pipe(process.stderr);
    ps.stdout.pipe(process.stdout);
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
    var name = argv._[1];
    if (!name) {
        console.error('ERROR: local name required for csr\n');
        return usage(1);
    }
    
    var ca = peerca(argv);
    var input = argv.infile !== '-'
        ? fs.createReadStream(argv.infile)
        : process.stdin
    ;
    var output = argv.outfile !== '-'
        ? fs.createWriteStream(argv.outfile)
        : process.stdout
    ;
    input.pipe(ca.authorize(name)).pipe(output);
}
else if (match(cmd, 'request', 2)) {
    var ca = peerca(argv);
    ca.request().pipe(process.stdout);
}
else if (match(cmd, 'save', 2)) {
    var name = argv._[1];
    if (!name) {
        console.error('ERROR: FQDN argument required\n');
        return usage(1);
    }
    var ca = peerca(argv);
    var input = argv.infile !== '-'
        ? fs.createReadStream(argv.infile)
        : process.stdin
    ;
    input.pipe(ca.save(name));
}
else if (match(cmd, 'list', 1) || match(cmd, 'ls', 1)) {
    var name = argv._[1];
    if (match(name, 'host', 1)) name = 'host';
    if (match(name, 'authorized', 1)) name = 'authorized';
    if (match(name, 'saved', 1)) name = 'saved';
    var ca = peerca(argv);
    ca.list(name, function (err, ls) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        else ls.forEach(function (l) { console.log(l) });
    });
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
