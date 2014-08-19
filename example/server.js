var tls = require('tls');
var fs = require('fs');

var opts = {
    key: fs.readFileSync(__dirname + '/keys/localhost/self-key.pem'),
    cert: fs.readFileSync(__dirname + '/keys/localhost/self-cert.pem'),
    ca: fs.readFileSync(__dirname + '/keys/localhost/ca.pem')
};

var server = tls.createServer(opts, function (stream) {
    stream.end('beep boop');
});
server.listen(7007);
