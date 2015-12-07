/**
 * Created by Matthew on 12/5/2015.
 */
AI = {
    CHASE: 0,
    SCATTER: 1,
    FRIGHTENED: 2
};

EnemyType = {
    RED: 0,
    PINK: 1,
    BLUE: 2,
    YELLOW: 3,
}

function Enemy() {

    this.ai = AI.SCATTER;
    this.current = Phaser.NONE;
    this.delay = 0;
    this.directions = [null, null, null, null, null];
    this.gameRef = {};
    this.marker = new Phaser.Point();
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.powerupMode = false;
    this.speed = 175;
    this.sprite = {};
    this.threshold = 3;
    this.turning = Phaser.NONE;
    this.turnPoint = new Phaser.Point();

};

Enemy.prototype = {

    activatePowerupMode: function(){
        this.powerupMode = true;
        this.sprite.animations.play('powerup', 4, true);
    },

    calculateNextMove: function(){

        // Set the marker to the tile that the enemy falls within
        this.marker.x = this.gameRef.math.snapToFloor(Math.floor(this.sprite.x), this.gameRef.gridsize) / this.gameRef.gridsize;
        this.marker.y = this.gameRef.math.snapToFloor(Math.floor(this.sprite.y), this.gameRef.gridsize) / this.gameRef.gridsize;

        // Get the 4 potential tiles around the enemy
        this.directions[1] = this.gameRef.map.getTileLeft(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.gameRef.map.getTileRight(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.gameRef.map.getTileAbove(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.gameRef.map.getTileBelow(this.gameRef.layer.index, this.marker.x, this.marker.y);

        // Create an array of valid directions to move
        // If the tile from above is not null (if its not a floor/path tile it will be undefined) assign it the tile's pathfinding score
        var potentialMovePoints = [];
        if (this.directions[1]) potentialMovePoints[Phaser.LEFT] = this.gameRef.pathPoints[this.directions[1].y * this.gameRef.map.width + this.directions[1].x];
        if (this.directions[2]) potentialMovePoints[Phaser.RIGHT] = this.gameRef.pathPoints[this.directions[2].y * this.gameRef.map.width + this.directions[2].x];
        if (this.directions[3]) potentialMovePoints[Phaser.UP] = this.gameRef.pathPoints[this.directions[3].y * this.gameRef.map.width + this.directions[3].x];
        if (this.directions[4]) potentialMovePoints[Phaser.DOWN] = this.gameRef.pathPoints[this.directions[4].y * this.gameRef.map.width + this.directions[4].x];

        var bestMove = 0;
        if(this.powerupMode){
            var value = 0;
            for (var i = 1; i < potentialMovePoints.length; i++) {
                if (potentialMovePoints[i] >= 0) {

                    if (potentialMovePoints[i] > value) {
                        value = potentialMovePoints[i];
                        bestMove = i;
                    }
                }
            }
        }
        // Get the lowest pathfinding score of all the enemies potential moves. The lowest number is the shortest path to the player
        else {

            var value = 100;
            for (var i = 1; i < potentialMovePoints.length; i++) {
                if (potentialMovePoints[i] >= 0) {

                    if (potentialMovePoints[i] < value) {
                        value = potentialMovePoints[i];
                        bestMove = i;
                    }
                }
            }
        }

        // If the best move is different than the current direction and not equal to 0 (0 occurs when the enemy is not near a scored tile)
        if (this.current !== bestMove) {
            if( bestMove !== 0) {
                this.checkDirection(bestMove);
            }
            else{
                if(this.sprite.x > this.gameRef.player.sprite.x ){
                    this.checkDirection(1);
                }
            }
        }
        // If there is no better move than set turning to NONE
        else {
            this.turning = Phaser.NONE;
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

    create: function (x,y, enemyType) {

        // Create the enemy sprite
        this.sprite = this.gameRef.add.sprite(x, y, 'enemy');
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(2, 2);

        // Create all the animations
        if(enemyType == EnemyType.RED) {
            this.sprite.animations.add('right', [22, 23]);
            this.sprite.animations.add('left', [20, 21]);
            this.sprite.animations.add('up', [16, 17]);
            this.sprite.animations.add('down', [18, 19]);
        }
        else if(enemyType == EnemyType.PINK){
            this.sprite.animations.add('right', [30, 31]);
            this.sprite.animations.add('left', [28, 29]);
            this.sprite.animations.add('up', [24, 25]);
            this.sprite.animations.add('down', [26, 27]);
        }
        else if(enemyType == EnemyType.BLUE){
            this.sprite.animations.add('right', [38, 39]);
            this.sprite.animations.add('left', [36, 37]);
            this.sprite.animations.add('up', [32, 33]);
            this.sprite.animations.add('down', [34, 35]);
        }
        else if(enemyType == EnemyType.YELLOW){
            this.sprite.animations.add('right', [46, 47]);
            this.sprite.animations.add('left', [44, 45]);
            this.sprite.animations.add('up', [40, 41]);
            this.sprite.animations.add('down', [42, 43]);
        }
        this.sprite.animations.add('powerup', [12,13]);
        this.sprite.animations.add('powerupEnding', [12,13,14,15]);

        // Enable physics for the enemy
        this.gameRef.physics.arcade.enable(this.sprite);

        this.move(Math.floor(Math.random() * 4 + 1));
    },

    deActivatePowerupMode: function(){
        this.powerupMode = false;
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

    preload: function (gameRef) {

        // Get a permanent reference to the game
        this.gameRef = gameRef;

        // Load the sprite sheet for the bad guy
        this.gameRef.load.spritesheet('enemy', 'assets/sprites/pacmansprites.png', 32, 32, 64);

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

        // Determine the best direction to move
        this.calculateNextMove();

        // If turning, then turn the enemy
        if (this.turning !== Phaser.NONE) {
            this.turn();
        }

        // Update the animations
        if(!this.powerupMode) {
            if (this.current == 1) this.sprite.animations.play('left', 4, true);
            if (this.current == 2) this.sprite.animations.play('right', 4, true);
            if (this.current == 3) this.sprite.animations.play('up', 4, true);
            if (this.current == 4) this.sprite.animations.play('down', 4, true);
        }

    },

    warnPowerupMode: function(){
        this.sprite.animations.play('powerupEnding', 4, true)
    }

};