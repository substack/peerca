#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2), {
    alias: { h: 'help' }
});

var cmd = argv._[0];

if (argv.help || match(cmd, 'help')) {
    usage(0);
}
else if (match(cmd, 'generate')) {
}
else if (match(cmd, 'sign')) {
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
