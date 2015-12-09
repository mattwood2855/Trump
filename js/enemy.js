/**
 * Created by Matthew on 12/5/2015.
 */
AI = {
    CHASE: 0,
    SCATTER: 1,
    FRIGHTENED: 2,
    EATEN: 3,
    STOP: 4
};

EnemyType = {
    RED: 0,
    PINK: 1,
    BLUE: 2,
    YELLOW: 3,
}

function Enemy() {

    this.ai = AI.SCATTER;
    this.chaseTimer = {};
    this.timeToScatter = 10000;
    this.current = Phaser.NONE;
    this.delay = 0;
    this.directions = [null, null, null, null, null];
    this.enemyType = null;
    this.gameRef = {};
    this.id = 0;
    this.homeMap = [];
    this.killedPlayer = false;
    this.marker = new Phaser.Point();
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.powerupMode = false;
    this.scatterMap = [];
    this.speed = 200;
    this.originalSpeed = 200;
    this.powerupSpeed = 100;
    this.potentialMovePoints = [];
    this.eatenSpeed = 400;
    this.sprite = {};
    this.startX = 0;
    this.startY = 0;
    this.targetTile = new Phaser.Point();
    this.threshold = 5;
    this.turning = Phaser.NONE;
    this.turnPoint = new Phaser.Point();

};

Enemy.prototype = {

    activatePowerupMode: function () {

        // Set powerup mode to true
        this.powerupMode = true;
        // Set the animation to the powerup animation
        this.sprite.animations.play('powerup', 4, true);
        // If the enemy is not currently returning to home (eaten)
        if (this.ai != AI.EATEN) {
            // Switch to freightened mode
            this.ai = AI.FRIGHTENED;
        }
        //this.move(this.current);
    },

    calculateShortestMove: function () {
        var value = 100;
        var shortestMove = 0;
        for (var i = 1; i < this.potentialMovePoints.length; i++) {
            if (this.potentialMovePoints[i] || this.potentialMovePoints[i] === 0) {
                if (this.potentialMovePoints[i] >= 0) {
                    if (this.potentialMovePoints[i] === value) {
                        if (Math.random() < .5) {
                            shortestMove = i;
                        }
                    }else
                    if (this.potentialMovePoints[i] < value) {
                        value = this.potentialMovePoints[i];
                        shortestMove = i;
                    }
                }
            }
        }
        return shortestMove;
    },

    calculateFurthestMove: function(){
        var value = 0;
        var furthestMove = 0;
        for (var i = 1; i < this.potentialMovePoints.length; i++) {
            if (this.potentialMovePoints[i] || this.potentialMovePoints[i] === 0) {
                if (this.potentialMovePoints[i] >= 0) {
                    if (this.potentialMovePoints[i] === value){
                        if (Math.random() < .5) {
                            shortestMove = i;
                        }
                    } else
                    if (this.potentialMovePoints[i] > value) {
                        value = this.potentialMovePoints[i];
                        furthestMove = i;
                    }
                }
            }
        }
        return furthestMove;
    },

    calculateNextMove: function () {

        // Default best move to no movement
        var bestMove = 0;
        this.potentialMovePoints = [];

        if (this.ai === AI.SCATTER) {
            // Determine the potential moves based on the scatter map
            if (this.directions[1]) this.potentialMovePoints[Phaser.LEFT] = this.scatterMap[this.directions[1].y * this.gameRef.map.width + this.directions[1].x];
            if (this.directions[2]) this.potentialMovePoints[Phaser.RIGHT] = this.scatterMap[this.directions[2].y * this.gameRef.map.width + this.directions[2].x];
            if (this.directions[3]) this.potentialMovePoints[Phaser.UP] = this.scatterMap[this.directions[3].y * this.gameRef.map.width + this.directions[3].x];
            if (this.directions[4]) this.potentialMovePoints[Phaser.DOWN] = this.scatterMap[this.directions[4].y * this.gameRef.map.width + this.directions[4].x];

            if (this.current > 0) {
                this.potentialMovePoints[this.opposites[this.current]] = null;
            }

            bestMove = this.calculateShortestMove();
        }
        if (this.ai === AI.EATEN) {
            // Determine the potential moves based on the home map
            if (this.directions[1]) this.potentialMovePoints[Phaser.LEFT] = this.homeMap[this.directions[1].y * this.gameRef.map.width + this.directions[1].x];
            if (this.directions[2]) this.potentialMovePoints[Phaser.RIGHT] = this.homeMap[this.directions[2].y * this.gameRef.map.width + this.directions[2].x];
            if (this.directions[3]) this.potentialMovePoints[Phaser.UP] = this.homeMap[this.directions[3].y * this.gameRef.map.width + this.directions[3].x];
            if (this.directions[4]) this.potentialMovePoints[Phaser.DOWN] = this.homeMap[this.directions[4].y * this.gameRef.map.width + this.directions[4].x];

            bestMove = this.calculateShortestMove();
        }
        if (this.ai === AI.FRIGHTENED || this.ai === AI.CHASE) {

            if (this.directions[1]) this.potentialMovePoints[Phaser.LEFT] = this.gameRef.pathPoints[this.directions[1].y * this.gameRef.map.width + this.directions[1].x];
            if (this.directions[2]) this.potentialMovePoints[Phaser.RIGHT] = this.gameRef.pathPoints[this.directions[2].y * this.gameRef.map.width + this.directions[2].x];
            if (this.directions[3]) this.potentialMovePoints[Phaser.UP] = this.gameRef.pathPoints[this.directions[3].y * this.gameRef.map.width + this.directions[3].x];
            if (this.directions[4]) this.potentialMovePoints[Phaser.DOWN] = this.gameRef.pathPoints[this.directions[4].y * this.gameRef.map.width + this.directions[4].x];

            if (this.current > 0) {
                this.potentialMovePoints[this.opposites[this.current]] = null;
            }

            if (this.ai === AI.FRIGHTENED) {
                // If the tile from above is not null (if its not a floor/path tile it will be undefined) assign it the tile's pathfinding score
                bestMove = this.calculateFurthestMove();
            }
            else if (this.ai === AI.CHASE) {
                // If the tile from above is not null (if its not a floor/path tile it will be undefined) assign it the tile's pathfinding score
                bestMove = this.calculateShortestMove();
            }
        }


        // If the best move is different than the current direction and not equal to 0 (0 occurs when the enemy is not near a scored tile - fixed by adding default 20s)
        if (this.current !== bestMove) {
            if( bestMove !== 0) {
                this.checkDirection(bestMove);
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
            if (!this.gameRef.anyMatches(this.directions[turnTo].index, this.gameRef.pathTiles)) {
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

    create: function (id, map, enemyType) {

        this.startX = map.properties.EnemyStartX * map.tileWidth + (map.tileWidth / 2);
        this.startY = map.properties.EnemyStartY * map.tileHeight + (map.tileHeight / 2);
        // Create the enemy sprite
        this.sprite = this.gameRef.add.sprite(this.startX, this.startY, 'enemy');
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(2, 2);

        this.enemyType = enemyType;

        // Create all the animations
        if (enemyType === EnemyType.RED) {
            this.sprite.animations.add('right', [22, 23]);
            this.sprite.animations.add('left', [20, 21]);
            this.sprite.animations.add('up', [16, 17]);
            this.sprite.animations.add('down', [18, 19]);
        }
        else if (enemyType === EnemyType.PINK) {
            this.sprite.animations.add('right', [30, 31]);
            this.sprite.animations.add('left', [28, 29]);
            this.sprite.animations.add('up', [24, 25]);
            this.sprite.animations.add('down', [26, 27]);
        }
        else if (enemyType === EnemyType.BLUE) {
            this.sprite.animations.add('right', [38, 39]);
            this.sprite.animations.add('left', [36, 37]);
            this.sprite.animations.add('up', [32, 33]);
            this.sprite.animations.add('down', [34, 35]);
        }
        else if (enemyType === EnemyType.YELLOW) {
            this.sprite.animations.add('right', [46, 47]);
            this.sprite.animations.add('left', [44, 45]);
            this.sprite.animations.add('up', [40, 41]);
            this.sprite.animations.add('down', [42, 43]);
        }

        this.sprite.animations.add('powerup', [12, 13]);
        this.sprite.animations.add('powerupEnding', [12, 13, 14, 15]);

        this.sprite.animations.add('eatenLeft', [62]);
        this.sprite.animations.add('eatenRight', [63]);
        this.sprite.animations.add('eatenUp', [60]);
        this.sprite.animations.add('eatenDown', [61]);

        this.sprite.animations.play('up', 4, true);

        // Enable physics for the enemy
        this.gameRef.physics.arcade.enable(this.sprite);

        this.id = id;
        // Build a scatter map for this enemy
        if (id === 0) {
            this.targetTile.x = parseInt(this.gameRef.map.properties.Enemy1X);
            this.targetTile.y = parseInt(this.gameRef.map.properties.Enemy1Y);
        }
        if (id === 1) {
            this.targetTile.x = parseInt(this.gameRef.map.properties.Enemy2X);
            this.targetTile.y = parseInt(this.gameRef.map.properties.Enemy2Y);
        }
        if (id === 2) {
            this.targetTile.x = parseInt(this.gameRef.map.properties.Enemy3X);
            this.targetTile.y = parseInt(this.gameRef.map.properties.Enemy3Y);
        }
        if (id === 3) {
            this.targetTile.x = parseInt(this.gameRef.map.properties.Enemy4X);
            this.targetTile.y = parseInt(this.gameRef.map.properties.Enemy4Y);
        }

        this.scatterMap = this.gameRef.buildPathfindingMap(this.targetTile, 0, 15);
        this.homeMap = this.gameRef.buildPathfindingMap(new Phaser.Point(map.properties.EnemyStartX, map.properties.EnemyStartY), 0, 15);

        this.chaseTimer = game.time.create(false);
        this.chaseTimer.add(this.timeToScatter, this.switchToChase, this);
        this.chaseTimer.start();

    },

    deActivatePowerupMode: function () {
        this.powerupMode = false;

        if (!this.ai === AI.EATEN) {
            this.ai = AI.CHASE;
            this.speed = this.originalSpeed;
        }
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

    resetMovementVars: function(){
        this.ai = AI.SCATTER;
        this.chaseTimer.add(this.timeToScatter, this.switchToChase, this);
        this.chaseTimer.start();
        this.turning = Phaser.NONE;
        this.current = Phaser.NONE;
    },

    switchToChase: function () {
        this.ai = AI.CHASE;
    },

    switchToScatter: function (milliseconds) {
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

        //if (this.id === 0) console.log(this);

        // Perform collisions between enemy and level
        this.gameRef.physics.arcade.collide(this.sprite, this.gameRef.layer);

        // Update the marker (used for pathfinding and determining possible turning) to whatever tile the sprite is on
        this.updateCurrentTileMarker();

        // Update the surround tiles according to our tile marker
        this.updateSurroundingTiles();

        // Wrap the player if they walk off the edge
        if (this.sprite.x < -this.gameRef.gridsize) {
            this.sprite.x = game.width + this.gameRef.gridsize / 2;
        }
        if (this.sprite.x > game.width + this.gameRef.gridsize / 2) {
            this.sprite.x = -this.gameRef.gridsize;
        }
        if (this.sprite.y < -this.gameRef.gridsize) {
            this.sprite.y = game.height + this.gameRef.gridsize / 2;
        }
        if (this.sprite.y > game.height + this.gameRef.gridsize / 2) {
            this.sprite.y = -this.gameRef.gridsize;
        }

        // Determine the best direction to move
        this.calculateNextMove();

        // If turning, then turn the enemy
        if (this.turning !== Phaser.NONE) {
            this.turn();
        }

        // Update the animations
        if (!this.powerupMode) {
            if (this.current == 1) this.sprite.animations.play('left', 4, true);
            if (this.current == 2) this.sprite.animations.play('right', 4, true);
            if (this.current == 3) this.sprite.animations.play('up', 4, true);
            if (this.current == 4) this.sprite.animations.play('down', 4, true);
        }

        // set values based on AI
        if (this.ai == AI.CHASE) {
            this.speed = this.originalSpeed;
            this.threshold = 3;
        }
        if (this.ai == AI.EATEN) {
            this.speed = this.eatenSpeed;
            this.threshold = 10;

            if (this.current == 1) this.sprite.animations.play('eatenLeft', 4, true);
            if (this.current == 2) this.sprite.animations.play('eatenRight', 4, true);
            if (this.current == 3) this.sprite.animations.play('eatenUp', 4, true);
            if (this.current == 4) this.sprite.animations.play('eatenDown', 4, true);

            if(this.homeMap[this.marker.y * this.gameRef.map.width + this.marker.x] == 1 && !this.powerupMode){
                this.ai = AI.CHASE;
                this.move(Phaser.UP);
            }
        }
        if (this.ai == AI.FRIGHTENED) {
            this.speed = this.powerupSpeed;
            this.threshold = 3;

            if(!this.gameRef.powerupMode && this.ai != AI.EATEN){
                this.ai == AI.CHASE;
            }
        }
        if (this.ai == AI.SCATTER) {
            this.speed = this.originalSpeed;
            this.threshold = 3;
        }

    },

    updateCurrentTileMarker: function () {
        // Set the marker to the tile that the enemy falls within
        this.marker.x = this.gameRef.math.snapToFloor(Math.floor(this.sprite.x), this.gameRef.gridsize) / this.gameRef.gridsize;
        this.marker.y = this.marker.y = this.gameRef.math.snapToFloor(Math.floor(this.sprite.y), this.gameRef.gridsize) / this.gameRef.gridsize;
    },

    updateSurroundingTiles: function () {
        this.directions = [];
        // Get the 4 potential tiles around the enemy
        this.directions[1] = this.gameRef.map.getTileLeft(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.gameRef.map.getTileRight(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.gameRef.map.getTileAbove(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.gameRef.map.getTileBelow(this.gameRef.layer.index, this.marker.x, this.marker.y);
    },

    warnPowerupMode: function () {
        this.sprite.animations.play('powerupEnding', 4, true)
    },

    wasEaten: function () {
        this.ai = AI.EATEN;
    }

};