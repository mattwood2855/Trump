/**
 * Created by Matthew on 12/3/2015.
 */
var LoadNextLevel = function (game) {
    this.messageText = '';
}

LoadNextLevel.prototype = {

    preload : function() {

    },

    create: function () {
        this.stage.backgroundColor = '#000000';
        console.log("got here");
        var style = { font: "32px Arial Bold", fill: "#ff0044", align: "center" };
        this.messageText = game.add.text(game.width/2, game.height/2, "But will New Hampshire let you run from the truth?", style);
        this.messageText.anchor(0.5);
    },

    start: function(){

    },

    update: function () {
    }
}