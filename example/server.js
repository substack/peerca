var tls = require('tls');
var ca = require('../')({ dir: 'keys/server' });
var opts = ca.options();

var server = tls.createServer(opts, function (stream) {
    stream.end('beep boop\n');
});
server.on('clientError', function (err) {
    console.log(err);
});
server.listen(7007);
