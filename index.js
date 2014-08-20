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
var duplexer = require('duplexer');
var fstream = require('fstream');

module.exports = PeerCA;

function bin (cmd, args, opts) {
    return spawn(path.join(__dirname, 'bin', cmd), args, opts);
}

function PeerCA (opts) {
    if (!(this instanceof PeerCA)) return new PeerCA(opts);
    if (!opts) opts = {};
    this.dir = defined(opts.dir, process.env.PEERCA_PATH);
    this.host = defined(opts.host, process.env.PEERCA_HOST, 'localhost');
}

PeerCA.prototype.generate = function (host, cb) {
    if (typeof host === 'function') {
        cb = host;
        host = undefined;
    }
    if (!host) host = this.host;
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
    if (!host) host = this.host;
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

PeerCA.prototype.authorize = function (name) {
    var self = this;
    var dir = path.join(this.dir, this.host, 'authorized', name);
    var files = {
        ca: path.join(this.dir, this.host, 'ca.pem'),
        csr: path.join(dir, 'cert.csr'),
        pem: path.join(dir, 'cert.pem')
    };
    var ps = spawn('openssl', [
        'x509',
        '-req',
        '-days', '365',
        '-CA', path.join(this.dir, this.host, 'ca.pem'),
        '-CAkey', path.join(this.dir, this.host, 'ca-key.pem'),
        '-extfile', path.join(this.dir, this.host, 'extfile.cnf'),
        '-CAcreateserial',
        '-CAserial', path.join(this.dir, this.host, 'ca.seq'),
        '-noout'
    ]);
    ps.stderr.pipe(process.stderr);
    
    var input = through();
    var output = through();
    var dup = duplexer(input, output);
    
    mkdirp(dir, function (err) {
        input.pipe(ps.stdin);
        input.pipe(fs.createWriteStream(files.csr));
        var ws = fs.createWriteStream(files.pem);
        ps.stdout.pipe(ws);
        
        ws.once('close', function next () {
            self._archive(name).pipe(output);
        });
    });
    return dup;
};

PeerCA.prototype._archive = function (name) {
    var dir = path.join(this.dir, this.host, 'authorized', name);
    var r = fstream.Reader(dir);
    return r.pipe(tar.Pack())
};

PeerCA.prototype.request = function (host) {
    if (!host) host = 'localhost';
    var file = path.join(this.dir, host, 'self.csr');
    return fs.createReadStream(file);
};
