// Generated by CoffeeScript 1.10.0
(function() {
  var STREAM_MAGIC_BYTES, WebSocketServer, app, currentSocket, express, ffmpeg, ffmpegParams, height, http, server, spawn, width, wss;

  http = require('http');

  express = require('express');

  spawn = require('child_process').spawn;

  WebSocketServer = require('ws').Server;

  server = http.createServer();

  wss = new WebSocketServer({
    server: server
  });

  app = express();

  app.use(express["static"]('public'));

  STREAM_MAGIC_BYTES = 'jsmp';

  ffmpegParams = ['-s', '80x60', '-f', 'video4linux2', '-i', '/dev/video0', '-f', 'mpeg1video', '-r', '24', '-loglevel', 'quiet', '-'];

  ffmpeg = spawn('ffmpeg', ffmpegParams);

  ffmpeg.stdout.resume();

  width = 80;

  height = 60;

  currentSocket = null;

  wss.on('connection', function(socket) {
    var streamHeader;
    currentSocket = socket;
    streamHeader = new Buffer(8);
    streamHeader.write(STREAM_MAGIC_BYTES);
    streamHeader.writeUInt16BE(width, 4);
    streamHeader.writeUInt16BE(height, 6);
    return socket.send(streamHeader, {
      binary: true
    });
  });

  ffmpeg.stdout.on('data', function(chunk) {
    var e, error;
    if (currentSocket !== null) {
      try {
        return currentSocket.send(chunk, {
          binary: true
        });
      } catch (error) {
        e = error;
        return console.log(e);
      }
    }
  });

  app.post('/die', function(req, res) {
    return server.close(function() {
      return res.send('OK');
    });
  });

  server.on('request', app);

  http.request({
    method: 'POST',
    path: '/die'
  }, function() {
    return server.listen(80);
  }).on('error', function() {
    return console.log('ignored error');
  });

}).call(this);
