var peerca = require('../');
var test = require('tape');
var os = require('os');
var path = require('path');
var concat = require('concat-stream');

var tls = require('tls');
var tmpdir = path.join((os.tmpdir || os.tmpDir)(), 'peerca-' + Math.random());

var sca = peerca({ dir: path.join(tmpdir, 'server') });
var cca = peerca({ dir: path.join(tmpdir, 'client') });

var server;

test('tls generate', function (t) {
    t.plan(2);
    sca.generate(function (err) { t.ifError(err) });
    cca.generate(function (err) { t.ifError(err) });
});

test('tls authorize', function (t) {
    t.plan(1);
    cca.request()
        .pipe(sca.authorize('client'))
        .pipe(cca.save('localhost'))
        .once('close', function () { t.ok(true) })
    ;
});

test('tls server', function (t) {
    t.plan(1);
    server = tls.createServer(sca.options(), function (stream) {
        stream.end('beep boop\n');
    });
    server.listen(0, function () { t.ok(true) });
});

test('tls', function (t) {
    t.plan(1);
    
    var opts = cca.options('localhost');
    var stream = tls.connect(server.address().port, 'localhost', opts);
    stream.pipe(concat(function (body) {
        t.equal(body.toString('utf8'), 'beep boop\n');
    }));
    
    t.once('end', function () {
        server.close();
    });
});
