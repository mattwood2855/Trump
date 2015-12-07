/**
 * Created by Matthew on 12/7/2015.
 */
function Hud() {
    this.gameRef = {};
    this.points = 0;
    this.scoreText = null;
    this.livesText = '';
    this.livesImages = [];
}

Hud.prototype = {

    addPoint: function(){

        this.points++;
        this.scoreText.setText("Score: " + this.points.toString());

    },

    create: function(){

        var style = {font: "24px Arial Bold", fill: "#52bace", align: "center"};
        this.livesText = game.add.text(0, 0, "Lives:", style);
        this.livesText.bringToTop();

        for (var x = 0; x < this.gameRef.player.lives; x++) {
            var lifeToken = this.gameRef.add.sprite(this.livesText.width + 32 * x, 0, 'trumpLife');
            lifeToken.scale.set(0.5);
            this.livesImages.push(lifeToken);
        }

        style = {font: "24px Arial Bold", fill: "#52bace", align: "center"};
        this.scoreText = game.add.text(0, this.livesText.height, "Score: " + this.points.toString(), style);
        this.scoreText.bringToTop();

    },

    preload: function(gamRef){

        // Get a permanent reference to the game
        this.gameRef = gamRef;
        // Load image for lives
        this.gameRef.load.image('trumpLife', 'assets/pics/trumpLife.png');

    },

    removeLife: function(){

    },

    update: function(){
        if(this.gameRef.player.lives < this.livesImages.length)
        {
            this.livesImages[this.gameRef.player.lives].kill();
        }
    }
}