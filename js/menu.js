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

    // Background sound clip
    this.backgroundSound = null;
}

Menu.prototype = {

    preload : function() {

        // Load all the menu graphics
        this.load.image('menu', 'assets/pics/mainMenu.png');
        this.load.image('play', 'assets/pics/playGame.png');
        this.load.image('instructions', 'assets/pics/instructions.png');
        this.load.image('donate', 'assets/pics/donate.png');
        this.load.image('steak', 'assets/pics/steak.png');
        this.load.image('blackScreen', 'assets/pics/black.png');

        // Load the background sound clip
        this.load.audio('trumpSaysChina', 'assets/sounds/trumpSaysChina.mp3');
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
        this.selectorSteaks.push(this.add.sprite(this.playButtonX - (this.playButton.width / 2) + 32, this.playButtonY+5, 'steak'));
        this.selectorSteaks.push(this.add.sprite(this.playButtonX + (this.playButton.width / 2) + 108, this.playButtonY+5, 'steak'));
        this.add.tween(this.selectorSteaks[0].scale).to({ x:.85, y:0.85 }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
        this.add.tween(this.selectorSteaks[1].scale).to({ x:0.85, y:0.85 }, 500, Phaser.Easing.Linear.None, true, 0, -1, true);

        // Register the Up, Down, and Enter keys
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.selectKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        // Decode the background audio file
        this.backgroundSound = this.add.audio('trumpSaysChina');

        game.sound.setDecodedCallback(this.backgroundSound, this.start, this);
    },

    start: function(){
        this.backgroundSound.play();
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
                    this.backgroundSound.stop();
                    game.state.start('Game');
                }
            }
        }
    },

    movingSelectorsStopped: function(){
        this.movingSelectors = false;
    },

    visitPage: function() {
        window.location='http://www.google.com';
    }
};