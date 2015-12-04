/**
 * Created by Matthew on 12/3/2015.
 */

var Menu = function(game) {

    // Create variables handles for all graphics objects
    this.background = null;
    this.playButton = null;
    this.playButtonX = 800;
    this.playButtonY = 300;
    this.instructionsButton = null;
    this.instructionsButtonX = 800;
    this.instructionsButtonY = 380;
    this.donateButton = null;
    this.donateButtonX = 800;
    this.donateButtonY = 460;
    this.selectorSteaks = [];

    // Hold the current selected button
    this.currentSelection = 0;

    // Handles for input
    this.upKey = null;
    this.downKey = null;
    this.selectKey = null;

    // Flag for if selectors are currently moving
    this.movingSelectors = false;
}

Menu.prototype = {

    preload : function() {

        // Load all the menu graphics
        game.load.image('menu', 'assets/pics/mainMenu.png');
        game.load.image('play', 'assets/pics/playGame.png');
        game.load.image('instructions', 'assets/pics/instructions.png');
        game.load.image('donate', 'assets/pics/donate.png');
        game.load.image('steak', 'assets/pics/steak.png');
        this.load.image('blackScreen', 'assets/pics/black.png');

    },


    create: function () {

        // Add the background and set it to the width and height of the canvas
        this.background = this.add.sprite(0, 0, 'menu');
        this.background.width = game.width;
        this.background.height = game.height;

        // Add the menu buttons
        this.playButton = this.add.sprite(this.playButtonX, this.playButtonY, 'play');
        this.instructionsButton = this.add.sprite(this.instructionsButtonX, this.instructionsButtonY, 'instructions');
        this.donateButton = this.add.sprite(this.donateButtonX, this.donateButtonY, 'donate');

        // Add the selector steaks
        this.selectorSteaks.push(this.add.sprite(this.playButtonX - (this.playButton.width / 2) + 32, this.playButtonY, 'steak'));
        this.selectorSteaks.push(this.add.sprite(this.playButtonX + (this.playButton.width / 2) + 108, this.playButtonY, 'steak'));

        // Register the Up, Down, and Enter keys
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.selectKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    },

    update: function(){
        if(!this.movingSelectors) {
            if (this.upKey.isDown) {
                if(this.currentSelection > 0){
                    this.currentSelection--;
                    this.movingSelectors = true;
                    this.add.tween(this.selectorSteaks[0]).to({y:(this.selectorSteaks[0].y-80)}, 500, Phaser.Easing.Elastic.Out, true, 0, 0, false);
                    this.add.tween(this.selectorSteaks[1]).to({y:(this.selectorSteaks[0].y-80)}, 500, Phaser.Easing.Elastic.Out, true, 0, 0, false).onComplete.add(this.movingSelectorsStopped, this);
                }
            }
            if (this.downKey.isDown) {
                if(this.currentSelection < 2) {
                    this.currentSelection++;
                    this.movingSelectors = true;
                    this.add.tween(this.selectorSteaks[0]).to({y:(this.selectorSteaks[0].y+80)}, 500, Phaser.Easing.Elastic.Out, true, 0, 0, false);
                    this.add.tween(this.selectorSteaks[1]).to({y:(this.selectorSteaks[0].y+80)}, 500, Phaser.Easing.Elastic.Out, true, 0, 0, false).onComplete.add(this.movingSelectorsStopped, this);
                }
            }
            if (this.selectKey.isDown) {
                if(this.currentSelection == 0){
                    game.state.start('Game');
                }
            }
        }
    },

    movingSelectorsStopped: function(){
        this.movingSelectors = false;
    },

    startGame: function () {

        // Change the state to the actual game.
        game.state.start('Game');

    }

};