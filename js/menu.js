/**
 * Created by Matthew on 12/3/2015.
 */

var Menu = function(game) {

    this.selectedButton = 0

}

Menu.prototype = {

    preload : function() {
        // Loading images is required so that later on we can create sprites based on the them.
        // The first argument is how our image will be refered to,
        // the second one is the path to our file.
        game.load.image('menu', 'assets/pics/mainMenu.png');
        game.load.image('play', 'assets/pics/playGame.png');
        game.load.image('instructions', 'assets/pics/instructions.png');
        game.load.image('donate', 'assets/pics/donate.png');
        game.load.image('selector', 'assets/pics/steak.png');
    },

    create: function () {
        // Add a sprite to your game, here the sprite will be the game's logo
        // Parameters are : X , Y , image name (see above)
        this.add.sprite(0, 0, 'menu');
        this.add.button(500, 300, 'play', this.startGame, this);
        this.add.sprite(430, 300, 'selector');
        this.add.button(500, 380, 'instructions', this.startInstructions, this);
        this.add.button(500, 460, 'donate', this.startDonate, this);

        // add keyboard controls
        this.selectKeyDown = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.selectKeyDown.onDown(this.moveSelectorDown, this);

        // keep the spacebar from propogating up to the browser
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.DOWN]);
    },

    startGame: function () {

        // Change the state to the actual game.
        game.state.start('Game');

    },

    moveSelectorDown: function () {
        this.add.sprite(430, 380, 'selector');
    }

};