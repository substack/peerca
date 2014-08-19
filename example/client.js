var tls = require('tls');
var fs = require('fs');

var opts = {
    key: fs.readFileSync(__dirname + '/keys/client/self-key.pem'),
    cert: fs.readFileSync(__dirname + '/keys/client/server-connect.pem'),
    ca: fs.readFileSync(__dirname + '/keys/server/ca.pem')
};

var stream = tls.connect(7007, 'localhost', opts);
stream.on('secureConnect', function () {
    console.log('connect!');
});

stream.pipe(process.stdout);
