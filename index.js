#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var minimist = require('minimist');
var split = require('split');
var through = require('through2');
var defined = require('defined');
var concat = require('concat-stream');
var tar = require('tar');
var mkdirp = require('mkdirp');

module.exports = PeerCA;

function bin (cmd, args, opts) {
    return spawn(path.join(__dirname, 'bin', cmd), args, opts);
}

function PeerCA (opts) {
    if (!(this instanceof PeerCA)) return new PeerCA(opts);
    if (!opts) opts = {};
    this.dir = defined(opts.dir, process.env.PEERCA_PATH);
}

PeerCA.prototype.generate = function (host, cb) {
    if (typeof host === 'function') {
        cb = host;
        host = undefined;
    }
    if (!host) host = 'localhost';
    var args = [ host, path.join(this.dir, host) ];
    var ps = bin('generate.sh', args);
    ps.on('exit', function (code) {
        if (cb && code) cb(new Error('non-zero exit code: ' + code))
        else if (cb) cb(null)
    });
    return ps;
};

PeerCA.prototype.fingerprint = function (host, cb) {
    if (typeof host === 'function') {
        cb = host;
        host = undefined;
    }
    if (!host) host = 'localhost';
    var args = [
        'x509',
        '-in',
        path.join(this.dir, host, 'self-cert.pem'),
        '-sha1',
        '-noout',
        '-fingerprint'
    ];
    var ps = spawn('openssl', args);
    ps.stdout.pipe(concat(function (body) {
        var line = body.toString('utf8');
        var m = /^SHA1 Fingerprint=(\S+)/.exec(line);
        if (!m) return cb(new Error('unexpected output'));
        cb(null, m[1].split(':').join('').toLowerCase());
    }));
};

PeerCA.prototype.add = function (host) {
    var p = tar.Parse();
    p.on('entry', function (entry) {
        console.log('entry=', entry);
    });
    return p;
};

PeerCA.prototype.authorize = function (host) {
    var p = tar.Pack();
    var files = {
        ca: path.join(this.dir, 'ca.pem'),
        authorized: path.join(this.dir, 'authorized', host + '.pem')
    };
    fstream.File(files.ca).pipe(p, { end: false });
    fstream.File(files.authorized).pipe(p, { end: false });
    
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
    
    return rfs.pipe(tar.Pack());
};

PeerCA.prototype._archive = function (host) {
    var r = fstream.Reader(path.join(this.dir, 'authorized', host));
    return r.pipe(tar.Pack())
};

PeerCA.prototype.request = function (host) {
    if (!host) host = 'localhost';
    var file = path.join(this.dir, host, 'self.csr');
    return fs.createReadStream(file);
};
