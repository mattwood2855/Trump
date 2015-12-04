/**
 * Created by Matthew on 12/3/2015.
 */

var Menu = function(game) {

}

Menu.prototype = {

    preload : function() {
        // Loading images is required so that later on we can create sprites based on the them.
        // The first argument is how our image will be refered to,
        // the second one is the path to our file.
        game.load.image('menu', 'assets/pics/mainMenu.png');
        game.load.image('play', 'assets/pics/playGame.png');
        game.load.image('inst', 'assets/pics/instructions.png');
        game.load.image('donate', 'assets/pics/donate.png');
        game.load.image('steak', 'assets/pics/steak.png');
    },


    create: function () {
        // Add a sprite to your game, here the sprite will be the game's logo
        // Parameters are : X , Y , image name (see above)
        this.add.sprite(0, 0, 'menu');
        this.add.button(400, 300, 'play', this.startGame, this);
        this.add.sprite(400, 380, 'inst');
        this.add.sprite(400, 460, 'donate');

    },

    startGame: function () {

        // Change the state to the actual game.
        game.state.start('Game');

    }

};