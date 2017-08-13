
var express = require('express');
const { spawn } = require('child_process');
var app = express();
var request = require('superagent');
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

app.get('/apply_song/:id/:name', (req, res) => {
  console.log(req.params.id, req.params.name);

  applyer = spawn('youtube-dl', [
    '--extract-audio',
    '--audio-format',
    'mp3',
    `https://youtu.be/${req.params.id}`,
    '-o',
    `${__dirname}/songs/${req.params.name}.mp3`
  ]);
  applyer.stdout.on('data', function(data) {
    console.log(data.toString());
  });

  applyer.stderr.on('data', data => {
    console.log(data.toString());
  });

  applyer.on( 'close', code => {
    console.log(`player process exited with code ${code}`);
    res.send(`${req.params.id}//${req.params.name}`)
  });

});

app.get('/search/:keyword', (req, res) => {
  //'https://www.googleapis.com/youtube/v3/search?type=video&q=dd&maxResults=10&part=snippet&key=AIzaSyBYm2WTyTUU-4bdzUdMOM-PkPFHcEPYDkA'
  const searchApiUrl = 'https://www.googleapis.com/youtube/v3/search?';
  const query = {
    type: 'video',
    q: req.params.keyword,
    maxResults: 10,
    part: 'snippet',
    other: 'viewCount',
    key: 'AIzaSyBYm2WTyTUU-4bdzUdMOM-PkPFHcEPYDkA'
  }
  request
  .get(searchApiUrl)
  .query(query) // query string
  .end((err, response) => {
    res.json(response.body);
  });
});

app.get('/reset', (req, res) => {
  player.reset();
  res.send('done');
});

app.get('/rotate', (req, res) => {
  player.toggleRotate();
  res.send('done');
});

app.listen(3000, function () {
  console.log('app listening on port 3000!');
});
