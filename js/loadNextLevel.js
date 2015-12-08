/**
 * Created by Matthew on 12/3/2015.
 */
var LoadNextLevel = function (game) {
    this.messageText = '';
    this.levelToLoad = 0;
}

LoadNextLevel.prototype = {

    init: function(levelToLoad){
        console('LevelToLoad: ' + levelToLoad);
        this.levelToLoad = levelToLoad;
    },

    preload : function() {

    },

    create: function () {
        this.stage.backgroundColor = '#000000';
        var style = { font: "32px Arial Bold", fill: "#ff0044", align: "center" };
        this.messageText = game.add.text(game.width/2, game.height/2, "But will New Hampshire let you run from the truth?", style);
        this.messageText.x -= this.messageText.width /2;
    },

    update: function () {
        game.state.add('Game', Game, false);
        game.state.start('Game', true, false, this.levelToLoad);
    }
}