var fs = require('fs');
var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, path: '/peerjs'});