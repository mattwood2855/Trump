var Game = function (game) {

    this.map = null;
    this.layer = null;

    this.scoreText = null;
    this.livesText = null;
    this.livesImages = [];

    this.trump = null;

    this.winText = '';

    this.steaks = [];
    this.steakTileIndex = 36;
    this.powerups = [];
    this.powerupTileIndex = 37;

    this.eatSteakSound = null;
    this.powerupSounds = [];
    this.powerupSoundPlaying = false;
    this.iRunSound = null;

    this.safetiles = [12,36,37];
    this.gridsize = 64;

    this.speed = 150;
    this.threshold = 3;
    this.turnSpeed = 150;

    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();

    this.directions = [ null, null, null, null, null ];
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    this.current = Phaser.UP;
    this.turning = Phaser.NONE;

    this.levels = ['assets/levels/iowa.json',
        'assets/levels/newHampshire.json',
        'assets/levels/southCarolina.json',
        'assets/levels/nevada.json'];
    this.currentLevel = 0;
    this.loadingNextLevel = false;
};

Game.prototype = {

    init: function () {

        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    preload: function () {

        // Load trump sprite
        this.load.image('trump', 'assets/sprites/trump2.png');

        // Load Steak and Duck pictures
        this.load.image('steak', 'assets/pics/steak.png');
        this.load.image('duck', 'assets/pics/duck.png');

        // Load image for lives
        this.load.image('trumpLife', 'assets/pics/trumpLife.png');

        // Load level tilemap
        this.load.tilemap('iowa', 'assets/levels/iowa.json', null, Phaser.Tilemap.TILED_JSON);
        // Load tile sheet
        this.load.image('tiles', 'assets/tilesets/iowaTiles.png');

        // Load black for tweening between game states
        this.load.image('blackScreen', 'assets/pics/black.png');

        // Load Sound effects
        this.load.audio('eatSteak', 'assets/sounds/eatSteak.mp3');
        this.load.audio('powerup0', 'assets/sounds/powerup0.mp3');
        this.load.audio('powerup1', 'assets/sounds/powerup1.mp3');
        this.load.audio('powerup2', 'assets/sounds/powerup2.mp3');
        this.load.audio('powerup3', 'assets/sounds/powerup3.mp3');
        this.load.audio('iRun', 'assets/sounds/iRun.mp3');

    },

    create: function () {

        this.map = game.add.tilemap('iowa');
        this.map.addTilesetImage('IowaTiles', 'tiles');

        this.layer = this.map.createLayer('Iowa');

        this.map.setCollisionByExclusion([12,36,37], true, this.layer);

        this.trump = this.add.sprite(96, 416, 'trump');
        this.trump.anchor.set(0.5);
        this.trump.scale.set(2);

        this.physics.arcade.enable(this.trump);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Create all the pickups
        // Loop through all tiles in the map
        for(var y = 0; y < this.map.height; ++y){
            for(var x = 0; x < this.map.width; ++x){
                var tile = this.map.getTile(x, y);
                // If the tile is a steak tile
                if(tile.index == this.steakTileIndex)
                {
                    // Create a new steak object at the center of this tile
                    var newSteak = this.add.sprite((tile.x * this.gridsize) + this.gridsize/2, tile.y * this.gridsize + this.gridsize/2, 'steak');
                    newSteak.anchor.set(0.5);
                    newSteak.scale.setTo(0.5,0.5);

                    // Add the steak to the array of steaks.
                    this.steaks.push(newSteak);
                }
                // If this is a powerup tile
                if(tile.index == this.powerupTileIndex)
                {
                    // Create a new powerup object at the center of this tile
                    var newPowerup = this.add.sprite((tile.x * this.gridsize) + this.gridsize/2, tile.y * this.gridsize + this.gridsize/2, 'duck');
                    newPowerup.anchor.set(0.5);
                    newPowerup.scale.setTo(0.5,0.5);

                    // Add a zoom tween that last forever
                    this.add.tween(newPowerup.scale).to({ x:.75, y:.75 }, 350, Phaser.Easing.Linear.None, true, 0, -1, true);

                    // Add the steak to the array of steaks.
                    this.powerups.push(newPowerup);
                }
            }
        }

        // Create Audio
        this.eatSteakSound = this.add.audio('eatSteak');
        this.powerupSounds.push(this.add.audio('powerup0'));
        this.powerupSounds.push(this.add.audio('powerup1'));
        this.powerupSounds.push(this.add.audio('powerup2'));
        this.powerupSounds.push(this.add.audio('powerup3'));
        this.iRunSound = this.add.audio('iRun');

        //  Being mp3 files these take time to decode, so we can't play them instantly
        //  Using setDecodedCallback we can be notified when they're ALL ready for use.
        //  The audio files could decode in ANY order, we can never be sure which it'll be.

        game.sound.setDecodedCallback(this.powerupSounds, this.start, this);

        var style = { font: "24px Arial Bold", fill: "#52bace", align: "center" };
        this.livesText = game.add.text(0, 0, "Lives:", style);
        this.livesText.bringToTop();

        for(var x = 0; x < game.lives; x++) {
            this.livesImages.push(this.add.sprite(this.livesText.width + 32 * x, 0, 'trumpLife').scale.set(0.5));
        }

        style = { font: "24px Arial Bold", fill: "#52bace", align: "center" };
        this.scoreText = game.add.text(0, this.livesText.height, "Score: " + game.points.toString(), style);
        this.scoreText.bringToTop();

    },

    start: function(){

        for(var x = 0; x < this.powerupSounds.length; x++){
            this.powerupSounds[x].onStop.add(this.powerupSoundStopped, this);
        }

        //this.move(Phaser.DOWN);

    },

    checkKeys: function () {

        if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
        {
            this.checkDirection(Phaser.LEFT);
        }
        else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
        {
            this.checkDirection(Phaser.RIGHT);
        }
        else if (this.cursors.up.isDown && this.current !== Phaser.UP)
        {
            this.checkDirection(Phaser.UP);
        }
        else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
        {
            this.checkDirection(Phaser.DOWN);
        }
        else
        {
            //  This forces them to hold the key down to turn the corner
            this.turning = Phaser.NONE;
        }

    },

    anyMatches: function(value, array){
        for (var i = 0; i < array.length; i++) {
            if (value == array[i])
                return true;
        }
        return false;
    },

    checkDirection: function (turnTo) {

        if (this.turning === turnTo || this.directions[turnTo] === null )
        {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index a floor tile
            return;
        }

        if(this.directions[turnTo]){
            if(!this.anyMatches(this.directions[turnTo].index, this.safetiles)){
                return;
            }
        }

        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo])
        {
            this.move(turnTo);
        }
        else
        {
            this.turning = turnTo;

            this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
            this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
        }

    },

    turn: function () {

        var cx = Math.floor(this.trump.x);
        var cy = Math.floor(this.trump.y);

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
        {
            return false;
        }

        this.trump.x = this.turnPoint.x;
        this.trump.y = this.turnPoint.y;

        this.trump.body.reset(this.turnPoint.x, this.turnPoint.y);

        this.move(this.turning);

        this.turning = Phaser.NONE;

        return true;

    },

    move: function (direction) {

        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP)
        {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
        {
            this.trump.body.velocity.x = speed;
        }
        else
        {
            this.trump.body.velocity.y = speed;
        }

        this.add.tween(this.trump).to( { angle: this.getAngle(direction) }, this.turnSpeed, "Linear", true);

        this.current = direction;

    },

    getAngle: function (to) {

        //  About-face?
        if (this.current === this.opposites[to])
        {
            return "180";
        }

        if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
            (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
            (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
            (this.current === Phaser.RIGHT && to === Phaser.UP))
        {
            return "-90";
        }

        return "90";

    },

    update: function () {

        if(!this.loadingNextLevel) {

            // Check if the player ate all the steaks (WIN)
            if (this.steaks.length == 0) {
                this.loadingNextLevel = true;
                this.iRunSound.play();
                var blackScreen = this.add.sprite(game.width / 2, game.height / 2, 'blackScreen');
                blackScreen.anchor.set(0.5);
                blackScreen.scale.setTo(1000, 1000);
                blackScreen.alpha = 0.0;

                var loadTween = this.add.tween(blackScreen).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
                loadTween.onComplete.add(this.loadNextLevel, this);
            }

            // Perform collisions between player and level
            this.physics.arcade.collide(this.trump, this.layer);

            // Wrap the player if they walk off the edge
            if(this.trump.x < -this.gridsize){
                this.trump.x = game.width + this.gridsize/2;
            }
            if(this.trump.x > game.width + this.gridsize/2){
                this.trump.x = -this.gridsize;
            }
            if(this.trump.y < -this.gridsize){
                this.trump.y = game.height + this.gridsize/2;
            }
            if(this.trump.y > game.height + this.gridsize/2){
                this.trump.y = -this.gridsize;
            }

            // Create a marker where the player is (for determining ability to turn)
            this.marker.x = this.math.snapToFloor(Math.floor(this.trump.x), this.gridsize) / this.gridsize;
            this.marker.y = this.math.snapToFloor(Math.floor(this.trump.y), this.gridsize) / this.gridsize;

            //  Update our grid sensors - places the tile index in the array
            this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
            this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
            this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
            this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

            // Update based on input
            this.checkKeys();

            // If turning, then turn the player
            if (this.turning !== Phaser.NONE) {
                this.turn();
            }

            // Eat steaks
            // Go through each steak
            for (var x = 0; x < this.steaks.length; x++) {
                // If there is a collision with trump
                var steakToEat = this.steaks[x];
                if (Phaser.Rectangle.intersects(this.trump, steakToEat)) {
                    if (!this.powerupSoundPlaying) {
                        this.eatSteakSound.play();
                    }
                    // Give the player a point
                    game.points++;
                    this.scoreText.setText("Score: " + game.points.toString());
                    // Remove the steak from the array
                    this.steaks.splice(x, 1);
                    // destroy the steak for garbage collection
                    steakToEat.destroy();
                }
            }
            // Go through powerups
            for (var x = 0; x < this.powerups.length; x++) {
                // If there is a collision with trump
                var powerupToEat = this.powerups[x];
                if (Phaser.Rectangle.intersects(this.trump, powerupToEat)) {
                    this.powerupSounds[Math.floor((Math.random() * 4))].play();
                    this.powerupSoundPlaying = true;
                    // Remove the steak from the array
                    this.powerups.splice(x, 1);
                    // destroy the steak for garbage collection
                    powerupToEat.destroy();
                }
            }
        }
    },

    powerupSoundStopped: function(){
        this.powerupSoundPlaying = false;
    },

    render: function () {

        //  Un-comment this to see the debug drawing

/*        for (var t = 1; t < 5; t++)
         {
         if (this.directions[t] === null)
         {
         continue;
         }

         var color = 'rgba(0,255,0,0.3)';

         if (!this.anyMatches(this.directions[t].index, this.safetiles))
         {
         color = 'rgba(255,0,0,0.3)';
         }

         if (t === this.current)
         {
         color = 'rgba(255,255,255,0.3)';
         }

         this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, 32, 32), color, true);
         }

         this.game.debug.geom(this.turnPoint, '#ffff00');*/

    },

    loadNextLevel: function(){
        game.state.start('LoadNextLevel');
    }
};