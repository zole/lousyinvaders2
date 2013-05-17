(function() {

  function spawnEnemy() {
    Crafty.e('GreenEnemy').attr({
      x: Crafty.stage.elem.clientWidth / 2 - 15 + (Crafty.stage.elem.clientWidth * 0.75 * (Math.random() - 0.5)),
      y: -30,
    }).greenenemy();
  };


  function spawnPlayer() {
    Crafty('Enemy').each(function() {
      this.destroy();
    });

    game.player = Crafty.e("PlayerShip").attr({
      x: Crafty.stage.elem.clientWidth / 2 - (SHIP_SIZE.w / 2),
      y: Crafty.stage.elem.clientHeight / 8 * 7,
    }).ship();

    game.playerAlive = true;
  };


  function init() {
    // Start music
    Crafty.audio.play('music', -1, 1)

    spawnPlayer();

    game.score = 0;
    Crafty.e("2D, DOM, Text, Scoreboard")
      .text(game.score)
      .attr({x: 0, y: 0, w: Crafty.stage.elem.clientWidth})
      .css({
        'font-size': '22px',
        'font-family': 'Verdana, sans-serif',
        'color': 'white',
        'text-align': 'right',
        'margin': '5px -5px',
      });

    // game.mousePos = {x:-1, y:-1};

    Crafty.e('2D, DOM, Mouse')
      .attr({
        x: 0,
        y: 0,
        // Apparently the z order before was making this element appear above
        // the player, which meant that mousing over the player resulted in
        // the mouse coordinates being relative to the player!
        z: 10000,
        w: Crafty.stage.elem.clientWidth,
        h: Crafty.stage.elem.clientHeight
      })
      .bind('MouseMove', function(e) {
        game.player.targetPos = { x: e.offsetX || e.layerX, y: e.offsetY || e.layerY };
      })
      .bind('MouseDown', function(e) {
        game.player.targetPos = { x: e.offsetX || e.layerX, y: e.offsetY || e.layerY };
        
        game.player.firing = true;
      })
      .bind('MouseUp', function(e) { game.player.firing = false; });


    var framesToSpawn = 30;
    Crafty.bind("EnterFrame", function (e) {
      if (!game.playerAlive) {
        return;
      }
      framesToSpawn -= 1;

      if (framesToSpawn < 0) {
        spawnEnemy();
        framesToSpawn = 15 + (30 * Math.random());
      }
      
    });

    Crafty.e('Delay').bind('PlayerDied', function() {
      game.playerAlive = false;
      this.delay(spawnPlayer, 2000);
    });
  }


  function teardown() {
    Crafty.audio.stop();
  }

  Crafty.scene('game', init, teardown);

})();