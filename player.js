const { spawn } = require('child_process');
var player;
var reservedSongs = [];
var nowPlayingIndex = 0;
var rotate = true;
var volume = -9;

function play(name) {
  player = spawn('omxplayer', [__dirname + '/songs/' + name]);
  volume = -9;
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

module.exports = playSong;
