var fs = require('fs');

var https = require('https');
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/yourwebsite.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/yourwebsite.com/cert.pem', 'utf8');

var credentials = {
	key: privateKey, 
	cert: certificate
};

var express = require('express');
var app = express();

var httpsServer = https.createServer(credentials, app);

var https_server = httpsServer.listen(3000);

var express_peer_server = require('peer').ExpressPeerServer;
var peer_options = {
    debug: true
};

app.use('/peerjs', express_peer_server(https_server, peer_options));