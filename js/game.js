var filter;
var sprite;

var Game = function (game) {

    this.map = null;
    this.layer = null;

    this.scoreText = null;
    this.livesText = null;
    this.livesImages = [];

    this.player = new Player();
    this.enemies = [];
    this.enemies[0] = new Enemy();
    this.enemies[1] = new Enemy();
    this.enemies[2] = new Enemy();
    this.enemies[3] = new Enemy();
    this.everyOther = false;

    this.winText = '';

    this.steaks = [];
    this.steakTileIndex = 36;
    this.powerups = [];
    this.powerupTileIndex = 37;
    this.powerupModeLength = 6000;

    this.powerupMode = false;
    this.warnPowerupModeLength = 3000;



    this.eatSteakSound = null;
    this.powerupSounds = [];
    this.powerupSoundPlaying = false;
    this.iRunSound = null;

    this.safetiles = [12, 36, 37];
    this.gridsize = 64;
    this.pathPoints = [];

    this.levels = ['assets/levels/iowa.json',
        'assets/levels/newHampshire.json',
        'assets/levels/southCarolina.json',
        'assets/levels/nevada.json'];
    this.currentLevel = 0;
    this.loadingNextLevel = false;
};

Game.prototype = {

    init: function () {
        // Initialize the physics engine
        this.physics.startSystem(Phaser.Physics.ARCADE);
    },

    preload: function () {

        // Preload the player
        this.player.preload(this);
        // Preload the enemy
        for (var x = 0; x < this.enemies.length; x++) {
            this.enemies[x].preload(this);
        }

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

        this.powerupModeTimer = game.time.create(false);
        this.powerupModeTimer.add(this.powerupModeLength, this.stopPowerupMode, this);
        this.warnPowerupModeTimer = game.time.create(false);
        this.warnPowerupModeTimer.add(this.warnPowerupModeLength, this.warnStopPowerupMode, this);

        this.map = game.add.tilemap('iowa');
        this.map.addTilesetImage('IowaTiles', 'tiles');
        this.layer = this.map.createLayer('Ground');
        this.map.setCollisionByExclusion([12, 36, 37], true, this.layer);

        this.player.create();

        this.enemies[0].create(96, 96, EnemyType.RED);
        this.enemies[1].create(1120, 96, EnemyType.PINK);
        this.enemies[2].create(96, 672, EnemyType.BLUE);
        this.enemies[3].create(1120, 672, EnemyType.YELLOW);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Create all the pickups
        // Loop through all tiles in the map
        for (var y = 0; y < this.map.height; ++y) {
            for (var x = 0; x < this.map.width; ++x) {
                var tile = this.map.getTile(x, y);
                // If the tile is a steak tile
                if (tile.index == this.steakTileIndex) {
                    // Create a new steak object at the center of this tile
                    var newSteak = this.add.sprite((tile.x * this.gridsize) + this.gridsize / 2, tile.y * this.gridsize + this.gridsize / 2, 'steak');
                    newSteak.anchor.set(0.5);
                    newSteak.scale.setTo(0.5, 0.5);

                    // Add the steak to the array of steaks.
                    this.steaks.push(newSteak);
                }
                // If this is a powerup tile
                if (tile.index == this.powerupTileIndex) {
                    // Create a new powerup object at the center of this tile
                    var newPowerup = this.add.sprite((tile.x * this.gridsize) + this.gridsize / 2, tile.y * this.gridsize + this.gridsize / 2, 'duck');
                    newPowerup.anchor.set(0.5);
                    newPowerup.scale.setTo(0.5, 0.5);

                    // Add a zoom tween that last forever
                    this.add.tween(newPowerup.scale).to({
                        x: .75,
                        y: .75
                    }, 350, Phaser.Easing.Linear.None, true, 0, -1, true);

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

        var style = {font: "24px Arial Bold", fill: "#52bace", align: "center"};
        this.livesText = game.add.text(0, 0, "Lives:", style);
        this.livesText.bringToTop();

        for (var x = 0; x < game.lives; x++) {
            var lifeToken = this.add.sprite(this.livesText.width + 32 * x, 0, 'trumpLife');
            lifeToken.scale.set(0.5);
            this.livesImages.push(lifeToken);
        }

        style = {font: "24px Arial Bold", fill: "#52bace", align: "center"};
        this.scoreText = game.add.text(0, this.livesText.height, "Score: " + game.points.toString(), style);
        this.scoreText.bringToTop();


    },

    start: function () {

        for (var x = 0; x < this.powerupSounds.length; x++) {
            this.powerupSounds[x].onStop.add(this.powerupSoundStopped, this);
        }

    },

    anyMatches: function (value, array) {
        for (var i = 0; i < array.length; i++) {
            if (value == array[i])
                return true;
        }
        return false;
    },

    getAngle: function (to) {

        //  About-face?
        if (this.current === this.opposites[to]) {
            return "180";
        }

        if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
            (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
            (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
            (this.current === Phaser.RIGHT && to === Phaser.UP)) {
            return "-90";
        }

        return "90";

    },

    update: function () {

        if (!this.loadingNextLevel) {

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

            if (this.powerupMode) {
                //this.applySpecialEffects();
            }

            this.player.update();

            // Calculate the pathmap every other update to save cpu
            this.everyOther = !this.everyOther;
            if(this.everyOther) {

                this.pathPoints = [];
                for(var y = 0; y < this.map.height; y++)
                for (var x = 0; x < this.map.width; x++) {
                    if(this.anyMatches(this.map.getTile(x,y).index,this.safetiles)) {
                        this.pathPoints[this.map.width*y+x] = 20;
                    }
                }
                this.recursiveDrawPoints(this.player.marker, 0, 15);
            }

            for (var x = 0; x < this.enemies.length; x++) {
                this.enemies[x].update();
            }

            // Go through each steak
            for (var x = 0; x < this.steaks.length; x++) {
                // If there is a collision with trump
                var steakToEat = this.steaks[x];
                if (Phaser.Rectangle.intersects(this.player.sprite, steakToEat)) {
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
                if (Phaser.Rectangle.intersects(this.player.sprite, powerupToEat)) {

                    // Enter powerup mode
                    this.startPowerupMode();

                    // Remove the powerup from the array
                    this.powerups.splice(x, 1);

                    // destroy the powerup for garbage collection
                    powerupToEat.destroy();
                }
            }

            for (var x = 0; x < this.enemies.length; x++){
                if (Phaser.Rectangle.intersects(this.player.sprite, this.enemies[x].sprite)){
                    this.killPlayer();

                }
            }
        }
    },


    killPlayer: function(){
        if(game.lives > 0) {
            game.lives--;
            this.livesImages[game.lives].destroy();
        }
        
    },

    recursiveDrawPoints: function (tile, level, max) {

        // Max recursion level
        if (level > max) return;

        if (level == 0) {
            this.pathPoints[tile.y * this.map.width + tile.x] = level;
            level++;
        }

        // Get all the surrounding tiles
        var tiles = [];
        tiles[0] = this.map.getTileLeft(this.layer.index, tile.x, tile.y);
        tiles[1] = this.map.getTileRight(this.layer.index, tile.x, tile.y);
        tiles[2] = this.map.getTileAbove(this.layer.index, tile.x, tile.y);
        tiles[3] = this.map.getTileBelow(this.layer.index, tile.x, tile.y);

        // Go through each surrounding tile
        for (var x = 0; x < 4; x++) {
            // If the tile exists and is not the player tile
            if (tiles[x] && !(tiles[x].x == this.player.marker.x && tiles[x].y == this.player.marker.y)) {
                // Calculate the 1 dimensional position of the tile
                var tile1Dindex = tiles[x].y * this.map.width + tiles[x].x;

                // If the tile is a path tile (not a wall)
                if (this.anyMatches(tiles[x].index, this.safetiles)) {

                    // If this tile has already been assigned a point
                    if (this.pathPoints[tile1Dindex]) {

                        // If this path calculation is shorter
                        if (level < this.pathPoints[tile1Dindex]) {

                            // Assign the smaller point value
                            this.pathPoints[tile1Dindex] = level;
                        }
                    }
                    else {
                        this.pathPoints[tile1Dindex] = level;
                    }
                    this.recursiveDrawPoints(tiles[x], level + 1, max);
                }
            }
        }
    },

    render: function () {

        for (var x = 0; x < this.pathPoints.length; x++) {
            if (this.pathPoints[x] >= 0)
                game.debug.text(this.pathPoints[x], x % this.map.width * this.gridsize + this.gridsize / 2, Math.floor(x / this.map.width) * this.gridsize + this.gridsize / 2);
        }

    },

    loadNextLevel: function () {
        game.state.start('LoadNextLevel');
    },

    startPowerupMode: function () {

        // Set the powerupMode flag
        this.powerupMode = true;

        this.player.activatePowerupMode();
        for (var x = 0; x < this.enemies.length; x++) {
            this.enemies[x].activatePowerupMode();
        }

        // Play a random powerup sound
        this.powerupSounds[Math.floor((Math.random() * 4))].play();
        this.powerupSoundPlaying = true;

        // Start a timer to end the powerup mode
        this.warnPowerupModeTimer.start();
        this.powerupModeTimer.start();
    },

    warnStopPowerupMode: function(){
        this.warnPowerupModeTimer.destroy();
        this.warnPowerupModeTimer = game.time.create(false);
        this.warnPowerupModeTimer.add(this.warnPowerupModeLength, this.warnStopPowerupMode, this);
        for (var x = 0; x < this.enemies.length; x++) {
            this.enemies[x].warnPowerupMode();
        }
    },

    stopPowerupMode: function () {

        this.powerupModeTimer.destroy();
        this.powerupModeTimer = game.time.create(false);
        this.powerupModeTimer.add(this.powerupModeLength, this.stopPowerupMode, this);
        this.powerupMode = false;
        this.player.deActivatePowerupMode();
        for (var x = 0; x < this.enemies.length; x++) {
            this.enemies[x].deActivatePowerupMode();
        }
    },

    powerupSoundStopped: function () {
        this.powerupSoundPlaying = false;
    }
};