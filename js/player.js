/**
 * Created by Matthew on 12/5/2015.
 */

function Player() {

    this.current = Phaser.NONE;
    this.currentTileScore = 100;
    this.delay = 0;
    this.directions = [null, null, null, null, null];
    this.gameRef = {};
    this.marker = new Phaser.Point();
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.speed = 200;
    this.sprite = {};
    this.target = {};
    this.threshold = 3;
    this.turning = Phaser.NONE;
    this.turnPoint = new Phaser.Point();

};

Player.prototype = {

    preload: function (gameRef) {

        // Get a permanent reference to the game
        this.gameRef = gameRef;

        // Load trump sprite sheet
        this.gameRef.load.spritesheet('trump', 'assets/sprites/trump.png', 64, 64, 4);

    },

    create: function () {

        this.sprite = this.gameRef.add.sprite(96, 416, 'trump');
        this.sprite.anchor.set(0.5);
        this.sprite.animations.add('down', [0,1]);
        this.sprite.animations.add('right', [2,3]);
        this.sprite.animations.play('down', 4, true);

        // Enable physics for the enemy
        this.gameRef.physics.arcade.enable(this.sprite);

    },

    update: function () {

        // Perform collisions between player and level
        this.gameRef.physics.arcade.collide(this.sprite, this.gameRef.layer);

        // Wrap the player if they walk off the edge
        if(this.sprite.x < -this.gameRef.gridsize){
            this.sprite.x = game.width + this.gameRef.gridsize/2;
        }
        if(this.sprite.x > game.width + this.gameRef.gridsize/2){
            this.sprite.x = -this.gameRef.gridsize;
        }
        if(this.sprite.y < -this.gameRef.gridsize){
            this.sprite.y = game.height + this.gameRef.gridsize/2;
        }
        if(this.sprite.y > game.height + this.gameRef.gridsize/2){
            this.sprite.y = -this.gameRef.gridsize;
        }

        // Create a marker where the player is (for determining ability to turn)
        this.marker.x = this.gameRef.math.snapToFloor(Math.floor(this.sprite.x), this.gameRef.gridsize) / this.gameRef.gridsize;
        this.marker.y = this.gameRef.math.snapToFloor(Math.floor(this.sprite.y), this.gameRef.gridsize) / this.gameRef.gridsize;

        //  Update our grid sensors - places the tile index in the array
        this.directions[1] = this.gameRef.map.getTileLeft(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.gameRef.map.getTileRight(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.gameRef.map.getTileAbove(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.gameRef.map.getTileBelow(this.gameRef.layer.index, this.marker.x, this.marker.y);

        // Update based on input
        this.checkKeys();

        // If turning, then turn the player
        if (this.turning !== Phaser.NONE) {
            this.turn();
        }

    },

    checkDirection: function (turnTo) {

        if (this.turning === turnTo || this.directions[turnTo] === null) {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index a floor tile
            return;
        }

        // Verify that the tile the enemy is trying to turn to is a path tile, otherwise return
        if (this.directions[turnTo]) {
            if (!this.gameRef.anyMatches(this.directions[turnTo].index, this.gameRef.safetiles)) {
                return;
            }
        }

        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo]) {
            this.move(turnTo);
        }
        // Otherwise mark the enemy to turn in the requested direction
        else {
            this.turning = turnTo;

            // Set the turn point
            this.turnPoint.x = (this.marker.x * this.gameRef.gridsize) + (this.gameRef.gridsize / 2);
            this.turnPoint.y = (this.marker.y * this.gameRef.gridsize) + (this.gameRef.gridsize / 2);
        }

    },

    turn: function () {

        // Get the coordinates of the enemy
        var cx = Math.floor(this.sprite.x);
        var cy = Math.floor(this.sprite.y);

        //  Dont let the player turn until they are at the center of the tile. We use fuzzyEqual to allow an imperfect match to account for decimals in physics calcs
        if (!this.gameRef.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.gameRef.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
            return false;
        }

        // Set the sprite to the center of the tile they are turning on
        this.sprite.x = this.turnPoint.x;
        this.sprite.y = this.turnPoint.y;
        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);

        // Move the enemy in the new direction
        this.move(this.turning);

        // Reset turning now that we are finished turning
        this.turning = Phaser.NONE;

        // Return a successful turn attempt
        return true;

    },

    move: function (direction) {

        // Create a temp var to hold the speed
        var speed = this.speed;

        // If going left or up, negate the speed
        if (direction === Phaser.LEFT || direction === Phaser.UP) {
            speed = -speed;
        }

        // Update if x-axis movement
        if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
            this.sprite.body.velocity.x = speed;
        }
        // Otherwise, update y-axis movement
        else {
            this.sprite.body.velocity.y = speed;
        }

        // Set the current direction to the moved direction
        this.current = direction;

    },

    checkKeys: function () {

        if (this.gameRef.cursors.left.isDown && this.current !== Phaser.LEFT)
        {
            this.checkDirection(Phaser.LEFT);
            console.log("Pressed Left");
        }
        else if (this.gameRef.cursors.right.isDown && this.current !== Phaser.RIGHT)
        {
            this.checkDirection(Phaser.RIGHT);
            console.log("Pressed Right");
        }
        else if (this.gameRef.cursors.up.isDown && this.current !== Phaser.UP)
        {
            this.checkDirection(Phaser.UP);
            console.log("Pressed Up");
        }
        else if (this.gameRef.cursors.down.isDown && this.current !== Phaser.DOWN)
        {
            this.checkDirection(Phaser.DOWN);
            console.log("Pressed Down");
        }
        else
        {
            //  This forces them to hold the key down to turn the corner
            this.turning = Phaser.NONE;
        }

    }

};