#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
    alias: { h: 'help', d: ['dir','directory'] },
    default: { dir: process.cwd() }
});

var cmd = argv._[0];

if (argv.help || match(cmd, 'help')) {
    usage(0);
}
else if (match(cmd, 'generate')) {
    var host = argv._[1];
    if (!host) {
        console.error('ERROR: peerca generate requires a HOST argument');
        return usage(1);
    }
    var args = [ host, path.join(argv.dir, host) ];
    spawn(path.join(__dirname, 'generate.sh'), args, { stdio: 'inherit' });
}
else if (match(cmd, 'sign')) {
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
    var args = [ certfile, path.join(argv.dir, host) ];
    spawn(path.join(__dirname, 'sign.sh'), args, { stdio: 'inherit' });
}
else if (match(cmd, 'cafile')) {
    var host = argv._[1];
    if (!host) {
        console.error('ERROR: peerca cafile requires a HOST argument');
        return usage(1);
    }
    console.log(path.join(argv.dir, host, 'ca.pem'));
}
else usage(1)

function match (s, m) {
    return s && s.length && m.slice(0, s.length) === s;
}

function usage (code) {
    var rs = fs.createReadStream(__dirname + '/usage.txt');
    rs.pipe(process.stdout);
    if (code) rs.on('end', function () { process.exit(code) });
}
