
var express = require('express');
var app = express();
const fs = require('fs');
const player = require('./player');

app.use('/app', express.static('app'));
app.use('/songs', express.static('songs'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/get_list', (req, res) => {
  var songs = [];
  fs.readdirSync('./songs').forEach(file => {
    songs.push(file);
  });
  res.json(songs);
});

app.get('/get_play_list', (req, res) => {
  res.json(player.list());
});

app.get('/listen_song/:song', (req, res) => {
  player(req.params.song);
  res.json(player.list());
});

app.get('/controll/:command', (req, res) => {
  player.controll(req.params.command); res.send('done');
});

app.get('/download/:song', (req, res) => {
  var file = __dirname + '/songs/' + req.params.song;
  res.download(file); // Set disposition and send it.
});

app.listen(3000, function () {
  console.log('app listening on port 3000!');
});
