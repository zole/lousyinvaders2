(function() {
  window.game = window.game || {};
  
  game.SIZE = { w: 320, h: 480 };
  
  game.IS_MOBILE = (function() {
    // stolen from Modernizr
    // TODO: does Lime or Closure already have this somewhere?
    try {  
      document.createEvent("TouchEvent");  
      return true;  
    } catch (e) {  
      return false;  
    } 
  })();


  Crafty.scene('loading', function() {
    Crafty.e('2D, DOM, Text').attr({
      w: Crafty.stage.elem.clientWidth,
      h: 20,
      x: 0,
      y: 120
    }).text('Lousy Invaders is loading, hold on a minute, geez').css({
      'text-align': 'center',
      'text-transform': 'uppercase',
    });

    Crafty.sprite(15, 'res/i_are_spaceship.png', {
      pship1: [0,0, 2, 3],
      bullet: [4,2],
      ship_green: [6, 2, 2, 2],
      explo1: [0, 4, 2, 2],
    });


    Crafty.background('black');


    Crafty.load([
      'res/i_are_spaceship.png',
      'res/music.mp3',
      'res/music.ogg',
      'res/shot.mp3',
      'res/shot.ogg',
      'res/explosion.mp3',
      'res/explosion.ogg'
      ], function() {
      Crafty.audio.add({
        explosion: ['res/explosion.ogg', 'res/explosion.mp3'],
        shot: ['res/shot.ogg', 'res/shot.mp3'],
        music: ['res/music.ogg', 'res/music.mp3'],
      });
      Crafty.scene('game');
    }, function(e) {
      // Progress
    }, function(e) {
      // Error
    }); 


  });

  window.onload = function() {
    if (window.navigator.hasOwnProperty('standalone') && !window.navigator.standalone) {
      document.getElementById('help').innerHTML = 'To play, tap the middle button down there and select "Add To Home Screen". Then get ready for, just... just amazing amounts of fun.';
      return;
    }
    Crafty.mobile = false;
    Crafty.init(game.SIZE.w, game.SIZE.h);
    Crafty.canvas.init();
    Crafty.settings.modify('autoPause', true)
    // Crafty.canvas.init();
    Crafty.scene('loading');


    setTimeout(function() {
      window.scrollTo(0, 1);
    }, 1);
  };
})();

