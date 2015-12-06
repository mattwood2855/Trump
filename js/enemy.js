/**
 * Created by Matthew on 12/5/2015.
 */
AI = {
    CHASE: 0,
    SCATTER: 1,
    FRIGHTENED: 2
};

function Enemy(){
    this.sprite = {};
    this.ai = AI.SCATTER;
    this.speed = 100;
    this.target = {};
    this.gameRef = {};
    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();
    this.directions = [ null, null, null, null, null ];
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];
};

Enemy.prototype = {

    preload: function(gameRef){
        gameRef.load.spritesheet('enemy', 'assets/sprites/pacmansprites.gif', 32,32,64);
    },

    create: function(gameRef){

        this.gameRef = gameRef;

        this.sprite = gameRef.add.sprite(96, 96, 'enemy');
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(2, 2);

        this.sprite.animations.add('right', [22,23]);
        this.sprite.animations.add('left', [20,21]);
        this.sprite.animations.add('up', [16,17]);
        this.sprite.animations.add('down', [18,19]);
        this.sprite.animations.play('down', 4, true);

        gameRef.physics.arcade.enable(this.sprite);

        this.move(Phaser.Down);
    },

    update: function() {

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

        if(this.gameRef.anyMatches(this.directions[2].index, this.gameRef.safetiles)) this.move(Phaser.RIGHT);

    },

    move: function(direction){
        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP)
        {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
        {
            this.sprite.body.velocity.x = speed;
        }
        else
        {
            this.sprite.body.velocity.y = speed;
        }
    }


};