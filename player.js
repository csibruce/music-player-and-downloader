const { spawn } = require('child_process');
var player;
var reservedSongs = [];
var nowPlayingIndex = 0;
var rotate = false;
var volume = -9;

function play(name) {
  if (!name) {
    player = null;
    return;
  }
  player = spawn('omxplayer', ['--vol', `${volume * 100}` , __dirname + '/songs/' + name]);
  player.stdout.on('data', function(data) {
    console.log('=========================stdout');
    console.log(data.toString());
  });

  player.stderr.on('data', data => {
    console.log('=========================error');
    console.log(data.toString());
  });

  player.on( 'close', code => {
    console.log(`player process exited with code ${code}`);
    if (!rotate && !reservedSongs[nowPlayingIndex]) return;
    nowPlayingIndex++;
    if (rotate && (reservedSongs.length > 0) && !reservedSongs[nowPlayingIndex]) {
      nowPlayingIndex = 0;
    }
    play(reservedSongs[nowPlayingIndex]);
  });
}

function playSong(filename) {
  //omxplayer가 실행중이면 큐에 다음음악 추가하기
  //지금음악 정지후 다음으로갈지 정하는 변수 받기
  if (filename) reservedSongs.push(filename);
  console.log({ reservedSongs, nowPlayingIndex });

  if (player) {
    console.log('song is added. will playing..');
    return;
  }
  play(filename);
}

playSong.controll = function(command) {
  if (player) {
    console.log('controlled  = ' + command);
    switch (command) {
      case '+':
        volume+=3;
        break;
      case '-':
        volume-=3;
        break;
    }
    player.stdin.write(command);
  }
}

playSong.list = () => {
  return {
    reservedSongs: reservedSongs,
    nowPlayingIndex: nowPlayingIndex,
    rotate: rotate,
    volume: volume,
  }
}

playSong.reset = () => {
  console.log(player);
  reservedSongs = [];
  nowPlayingIndex = 0;
  rotate = false;
  volume = -9;
}

playSong.toggleRotate = () => {
  rotate = !rotate;
}

module.exports = playSong;
