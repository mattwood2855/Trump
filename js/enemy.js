/**
 * Created by Matthew on 12/5/2015.
 */
AI = {
    CHASE: 0,
    SCATTER: 1,
    FRIGHTENED: 2
}

function Enemy(){
    this.sprite = {};
    this.ai = AI.SCATTER;
    this.target = {};
    this.gameRef = {};
}

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
    },

    update: function(){
        // Get potential tiles
        // Create a marker where the enemy is
        this.marker.x = this.math.snapToFloor(Math.floor(this.sprite.x), this.gridsize) / this.gridsize;
        this.marker.y = this.math.snapToFloor(Math.floor(this.sprite.y), this.gridsize) / this.gridsize;

        //  Update our grid sensors - places the tile index in the array
        this.directions[1] = this.map.getTileLeft(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.map.getTileRight(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.map.getTileAbove(this.gameRef.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.map.getTileBelow(this.gameRef.layer.index, this.marker.x, this.marker.y);
    }



}