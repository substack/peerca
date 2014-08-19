var tls = require('tls');
var fs = require('fs');

var opts = {
    key: fs.readFileSync(__dirname + '/keys/client/self-key.pem'),
    cert: fs.readFileSync(__dirname + '/keys/client/localhost-connect.pem'),
    ca: fs.readFileSync(__dirname + '/keys/localhost/ca.pem')
};

var stream = tls.connect(7007, 'localhost', opts);
stream.pipe(process.stdout);
