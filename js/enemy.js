/**
 * Created by Matthew on 12/5/2015.
 */
AI = {
    CHASE: 0,
    SCATTER: 1,
    FRIGHTENED: 2
};

function Enemy() {
    this.delay = 0;
    this.sprite = {};
    this.ai = AI.SCATTER;
    this.speed = 100;
    this.target = {};
    this.gameRef = {};
    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();
    this.directions = [null, null, null, null, null];
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.current = Phaser.DOWN;
    this.turning = Phaser.NONE;
    this.threshold = 3;
    this.currentTileScore = 100;
};

Enemy.prototype = {

    preload: function (gameRef) {
        gameRef.load.spritesheet('enemy', 'assets/sprites/pacmansprites.gif', 32, 32, 64);
    },

    create: function (gameRef) {

        this.gameRef = gameRef;

        this.sprite = gameRef.add.sprite(96, 96, 'enemy');
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(2, 2);

        this.sprite.animations.add('right', [22, 23]);
        this.sprite.animations.add('left', [20, 21]);
        this.sprite.animations.add('up', [16, 17]);
        this.sprite.animations.add('down', [18, 19]);
        this.sprite.animations.play('down', 4, true);

        gameRef.physics.arcade.enable(this.sprite);

        this.move(Phaser.Down);
    },

    update: function () {


        // Perform collisions between player and level
        this.gameRef.physics.arcade.collide(this.sprite, this.gameRef.layer);

        // Get potential tiles
        // Create a marker where the enemy is
        this.marker.x = this.gameRef.math.snapToFloor(Math.floor(this.sprite.x), this.gameRef.gridsize) / this.gameRef.gridsize;
        this.marker.y = this.gameRef.math.snapToFloor(Math.floor(this.sprite.y), this.gameRef.gridsize) / this.gameRef.gridsize;


        //  Update our grid sensors - places the tile index in the array
        this.directions[1] = this.gameRef.map.getTileLeft(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.gameRef.map.getTileRight(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.gameRef.map.getTileAbove(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.gameRef.map.getTileBelow(this.gameRef.layer.index, this.marker.x, this.marker.y);

        var potentialMovePoints = [];
        if (this.directions[1]) potentialMovePoints[Phaser.LEFT] = this.gameRef.pathPoints[this.directions[1].y * this.gameRef.map.width + this.directions[1].x];
        if (this.directions[2]) potentialMovePoints[Phaser.RIGHT] = this.gameRef.pathPoints[this.directions[2].y * this.gameRef.map.width + this.directions[2].x];
        if (this.directions[3]) potentialMovePoints[Phaser.UP] = this.gameRef.pathPoints[this.directions[3].y * this.gameRef.map.width + this.directions[3].x];
        if (this.directions[4]) potentialMovePoints[Phaser.DOWN] = this.gameRef.pathPoints[this.directions[4].y * this.gameRef.map.width + this.directions[4].x];

        var bestMove = 0;
        var value = 100;
        for (var i = 1; i < potentialMovePoints.length; i++) {
            if (potentialMovePoints[i]) {

                if (potentialMovePoints[i] < value) {
                    value = potentialMovePoints[i];
                    bestMove = i;
                }
            }
        }

        if (this.current !== bestMove && bestMove !== 0) {
            this.checkDirection(bestMove);
        }
        else {
            this.turning = Phaser.NONE;
        }

        // If turning, then turn the player
        if (this.turning !== Phaser.NONE) {
            this.turn();
        }

        /*var xDif = Math.abs(this.sprite.x - (this.marker.x * this.gameRef.gridsize + (this.gameRef.gridsize/2)));
         var yDif = Math.abs(this.sprite.y - (this.marker.y * this.gameRef.gridsize + (this.gameRef.gridsize/2)));
         if(xDif < 1 && yDif < 1) {
         this.move(bestMove);
         }*/


    },

    checkDirection: function (turnTo) {

        if (this.turning === turnTo || this.directions[turnTo] === null) {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index a floor tile
            return;
        }

        if (this.directions[turnTo]) {
            if (!this.gameRef.anyMatches(this.directions[turnTo].index, this.gameRef.safetiles)) {
                return;
            }
        }

        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo]) {
            this.move(turnTo);
        }
        else {
            this.turning = turnTo;


            this.turnPoint.x = (this.marker.x * this.gameRef.gridsize) + (this.gameRef.gridsize / 2);
            this.turnPoint.y = (this.marker.y * this.gameRef.gridsize) + (this.gameRef.gridsize / 2);
        }

    },

    turn: function () {

        var cx = Math.floor(this.sprite.x);
        var cy = Math.floor(this.sprite.y);

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!this.gameRef.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.gameRef.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
            return false;
        }

        this.sprite.x = this.turnPoint.x;
        this.sprite.y = this.turnPoint.y;

        this.sprite.body.reset(this.turnPoint.x, this.turnPoint.y);

        this.move(this.turning);

        this.turning = Phaser.NONE;

        return true;

    },

    move: function (direction) {
        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP) {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
            this.sprite.body.velocity.x = speed;
        }
        else {
            this.sprite.body.velocity.y = speed;
        }
        this.current = direction;
    }


};