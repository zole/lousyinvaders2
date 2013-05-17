(function() {
  SHIP_SIZE = {
    w: 30,
    h: 45,
  };


  function fade(v, a, b) {
    // if v is 0, return a. if v is 1, return b. otherwise, fade from a to b.
    // if v is outside [0...1], undefined
    v = Math.max(0, Math.min(v, 1));
    return (a * (1 - v)) + (b * v);
  }


  Crafty.c('Explosion', {
    _doneExploding: function() {
      this.destroy();
    },

    init: function() {
      Crafty.audio.play('explosion');
      this.requires('2D, DOM, explo1, SpriteAnimation')
        .animate('explosion', [[0, 4], [2, 4], [4, 4], [6, 4]])
        .bind('AnimationEnd', this._doneExploding)
        .animate('explosion', 5, 0)
        ;
    },

    explosion: function() {
      return this.attr({z:1000}) // Appear over most things
    },

  });

  Crafty.c('PlayerShip', {
    VELOCITY: 10, // pixels per frame
    Z_INDEX: 1,
    STAGE_PADDING: 5,
    FRAMES_PER_BULLET: 15,

    _enterFrame: function() {
      this.fireDelay -= 1;

      var ship_to_cursor = { x: this.targetPos.x - this.x, y: this.targetPos.y - this.y };
      
      if (ship_to_cursor.x) {
        normal = ship_to_cursor.x / Math.abs(ship_to_cursor.x);

        if (Math.abs(ship_to_cursor.x) < this.VELOCITY) {
          this.x = this.targetPos.x;
        } else {
          this.x += normal * this.VELOCITY;
        }

        // Clip to sides of the stage
        this.x = Math.max(this.STAGE_PADDING, this.x);
        this.x = Math.min(Crafty.stage.elem.clientWidth - this.STAGE_PADDING - this.w, this.x);
      }

      var hit = this.hit('Enemy')[0];
      if (hit) {
        hit.obj.destroy();
        this.destroy();
        game.score -= 1000;
        Crafty('Scoreboard').each(function() {
          this.text(game.score);
        });
    

        Crafty.e('Explosion').attr({x: hit.obj.x, y: hit.obj.y});
        Crafty.e('Explosion').attr({x: this.x, y: this.y});
        Crafty.trigger('PlayerDied')
        return;
      }

      // Fire, if we're doing that
      if (this.firing && this.fireDelay <= 0) {
        this._fire();
        this.fireDelay = this.FRAMES_PER_BULLET;
      }
      
    },

    _fire: function() {
      Crafty.e('Shot')
        .attr({x: this.x + this.w / 2 - (14 / 2), y: this.y})
        .shot();
    },

    init: function() {
      this.requires('2D, DOM, SpriteAnimation, Collision, pship1');
    },

    ship: function() {
      this.targetPos = { x: this.x, y: this.y }
      this.firing = false;
      this.fireDelay = 0;
      return this
        .attr({w: SHIP_SIZE.w, h: SHIP_SIZE.h, z: this.Z_INDEX})
        .origin("center")
        .bind('EnterFrame', this._enterFrame)
        .collision(new Crafty.circle(15, 15, 10))
        .animate('playerShipFly', [[0, 0], [2, 0]])
        .animate('playerShipFly', 4, -1)
        ;
    },


  });


  Crafty.c('Shot', {
    // # of pixels before the shot fizzles out
    VERTICAL_LIFETIME: 400,

    init: function() {
      this.requires('2D, DOM, Collision, Edges, bullet')
        .attr()
        .origin("center");
    },

    shot: function() {
      this.startY = this.y;
      Crafty.audio.play('shot');
      return this
        .attr({
          w: 15,
          h: 15,
          z: 0,
          vel: {
            x: 0,
            y: -10,
          }
        })
        .collision(new Crafty.circle(7, 5, 4))
        .bind('EnterFrame', this._enterFrame);

    },

    _enterFrame: function() {
      this.y += this.vel.y;
      this.scaleX += 1;

      // Check hits with enemies
      var hit = this.hit('Enemy')[0];
      if (hit) {
        hit.obj.destroy();
        this.destroy();
        game.score += hit.obj.pointValue();
        Crafty('Scoreboard').each(function() {
          this.text(game.score);
        });
    

        Crafty.e('Explosion').attr({x: hit.obj.x, y: hit.obj.y});
        
        return;
      }

      if (this.startY - this.y  > this.VERTICAL_LIFETIME) {
        this.destroy();
      }
    }
  });


  Crafty.c('Enemy', {
    init: function() {
      this.requires('2D, Canvas, Collision');
    },

    enemy: function() {
      return this.origin('center');      
    },
  });


  Crafty.c('SinDodger', {
    init: function() {
      this.requires('2D');
    },

    sindodger: function(width, frequency, narrowing, narrowbottom) {
      this.width = width / 2;
      // frequency is the number of cycles over the length of the screen
      // period is the y coordinate at which x will be back to the start
      this.period = Crafty.stage.elem.clientHeight / (frequency);
      
      this.narrowing = narrowing;
      this.narrowbottom = narrowbottom;
      this.startingX = this.x;


      return this
        .bind('EnterFrame', this._dodgeFrame);
    },

    _dodgeFrame: function() {
      var theWidth = this.width * fade(this.y / this.narrowbottom, 1, this.narrowing);
      this.x = this.startingX + Math.sin(this.y / this.period * (2 * Math.PI)) * theWidth;


      this.x = Math.min(Crafty.stage.elem.clientWidth - this.w, this.x);
      this.x = Math.max(0, this.x);

    },
  });

  Crafty.c('GreenEnemy', {
    
    init: function() {
      this.requires('Enemy, SinDodger, ship_green')
    },

    greenenemy: function() {
      return this
        .enemy()
        .attr({
          w: 30,
          h: 30,
          rotation: 180,
        })
        .collision(new Crafty.circle(15, 15, 15))
        .sindodger(
          75,
          2.5,
          fade(Math.random(), 0.9, 1.1),
          Crafty.stage.elem.clientHeight * 0.75 +
            Crafty.stage.elem.clientHeight * 0.25 * Math.random()
          )
        .bind('EnterFrame', this._enterFrame);
    },

    pointValue: function() {
      return Math.round(fade(this.y / (Crafty.stage.elem.clientHeight * 0.75), 1, 15)) * 10;
    },

    _enterFrame: function() {
      this.y += fade(this.y / Crafty.stage.elem.clientHeight, 6, 3);

      if (this.y > Crafty.stage.elem.clientHeight) {
        this.destroy();
      }
    },

  });

})();