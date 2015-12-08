/**
 * Created by Matthew on 12/3/2015.
 */
var GameOver = function (game) {
    this.gameOverTimer = {};
    this.messageText = '';
    this.points = 0;
    this.pointsText = '';
    this.apiCall = 'localhost:9411/api/Scores';
}

GameOver.prototype = {

    preload : function() {
        console.log("preload");
    },

    create: function () {

        this.stage.backgroundColor = '#000000';
        var style = { font: "32px Arial Bold", fill: "#ff0044", align: "center" };

        this.messageText = game.add.text(game.width/2, game.height/2, "You just cant run from the truth", style);
        this.messageText.x -= this.messageText.width /2;

        this.pointsText = game.add.text(game.width/2, game.height/2, "Points: " + this.points.toString(), style);
        this.pointsText.x -= this.pointsText.width /2;
        this.pointsText.y += this.pointsText.height;

        this.gameOverTimer = game.time.create(false);
        this.gameOverTimer.add(3000, this.loadMainMenu, this);
        this.gameOverTimer.start();
    },

    init: function(points){
      this.points = points
    },

    loadMainMenu: function(){

        game.state.remove('GameOver');
        game.state.add('Menu', Menu, true);

    },

    update: function () {

    }
}