/**
 * Created by Matthew on 12/3/2015.
 */

var Menu = function (game) {

    // Create variables handles for all graphics objects
    this.background = null;
    this.buttonWidth = 250;
    this.buttonHeight = 55;

    this.playButton = {};
    this.playButtonText = {};
    this.playButtonX = 880;
    this.playButtonY = 50;

    this.instructionsButton = {};
    this.instructionsButtonText = {};
    this.instructionsButtonX = 880;
    this.instructionsButtonY = 115;

    this.donateButton = {};
    this.donateButtonText = {};
    this.donateButtonX = 880;
    this.donateButtonY = 180;

    this.instructionsPopup = {};

    this.buttonPulse = 80;
    this.buttonPulseFading = true;

    // Hold the current selected button
    this.currentSelection = 0;
    this.selectionTimer = {};
    // Handles for input
    this.upKey = null;
    this.downKey = null;
    this.selectKey = null;


    // Background sound clip
    this.backgroundSound = null;

    this.preventKeypress = false;


}

Menu.prototype = {

    allowKeypress: function () {
        this.preventKeypress = false;

    },

    preload: function () {

        // Load all the menu graphics
        this.load.image('menu', 'assets/pics/bg.jpg');

        this.load.image('blackScreen', 'assets/pics/black.png');
        this.load.image('instructionsMenu', 'assets/pics/instructionsMenu.png');

        // Load the background sound clip
        this.load.audio('trumpSaysChina', 'assets/sounds/trumpSaysChina.mp3');
        this.load.audio('plop', 'assets/sounds/140705__dreeke__champaign-cork.mp3');
    },

    clickDonate: function(){
        this.backgroundSound.stop();
        this.visitPage();
    },

    clickInstructions: function(){
        game.paused = true;
        this.instructionsPopup = game.add.sprite(game.width / 2, game.height / 2, 'instructionsMenu');
        this.instructionsPopup.anchor.setTo(0.5);
        game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(this.destroyInstructions, this);
    },

    clickPlay: function(){
        this.backgroundSound.stop();
        game.state.remove('Menu');
        game.state.add('Game', Game, true);
    },

    hoverDonate: function(){
        this.clickSound.play();
        this.currentSelection = 2;
    },

    hoverInstructions: function(){
        this.clickSound.play();
        this.currentSelection = 1;
    },

    hoverPlay: function(){
        this.clickSound.play();
        this.currentSelection = 0;
    },

    create: function () {

        // Add the background and set it to the width and height of the canvas
        this.background = this.add.sprite(0, 0, 'menu');
        this.background.width = game.width;
        this.background.height = game.height;

        // Add the menu buttons
        var style = {font: "32px Arial Bold", fill: "#ff6600", align: "center"};

        this.playButton = game.add.graphics(this.playButtonX, this.playButtonY);
        this.playButton.beginFill(0xffffff, 1).drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 10);
        this.playButton.inputEnabled = true;
        this.playButton.input.useHandCursor = true;
        this.playButton.events.onInputOver.add(this.hoverPlay, this);
        this.playButton.events.onInputDown.add(this.clickPlay, this);
        this.playButtonText = game.add.text(this.playButtonX + this.buttonWidth / 2, this.playButtonY + this.buttonHeight / 2, "Play", style);
        this.playButtonText.anchor.set(0.5);

        this.instructionsButton = game.add.graphics(this.instructionsButtonX, this.instructionsButtonY);
        this.instructionsButton.beginFill(0xffffff, 1).drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 10);
        this.instructionsButton.inputEnabled = true;
        this.instructionsButton.input.useHandCursor = true;
        this.instructionsButton.events.onInputOver.add(this.hoverInstructions, this);
        this.instructionsButton.events.onInputDown.add(this.clickInstructions, this);
        this.instructionsButtonText = game.add.text(this.instructionsButtonX + this.buttonWidth / 2, this.instructionsButtonY + this.buttonHeight / 2, "Instructions", style);
        this.instructionsButtonText.anchor.set(0.5);

        this.donateButton = game.add.graphics(this.donateButtonX, this.donateButtonY);
        this.donateButton.beginFill(0xffffff, 1).drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, 10);
        this.donateButton.inputEnabled = true;
        this.donateButton.input.useHandCursor = true;
        this.donateButton.events.onInputOver.add(this.hoverDonate, this);
        this.donateButton.events.onInputDown.add(this.clickDonate, this);
        this.donateButtonText = game.add.text(this.donateButtonX + this.buttonWidth / 2, this.donateButtonY + this.buttonHeight / 2, "Donate", style);
        this.donateButtonText.anchor.set(0.5);

        // Add the selector steaks
        this.currentSelection = 0;

        this.selectionTimer = game.time.create(false);
        this.selectionTimer.loop(400, this.allowKeypress, this);
        this.selectionTimer.start();

        // Register the Up, Down, and Enter keys
        this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.selectKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        // Decode the background audio file
        this.backgroundSound = this.add.audio('trumpSaysChina');

        // add select sound
        this.clickSound = this.add.audio('plop');
        this.clickSound.volume = 0.5;
        game.sound.setDecodedCallback(this.backgroundSound, this.start, this);

    },

    start: function () {

        //this.backgroundSound.play();
    },

    destroyInstructions: function(){
        this.instructionsPopup.kill();
        game.paused = false;
    },

    update: function () {

        if (this.buttonPulseFading) {
            this.buttonPulse--;
            if (this.buttonPulse <= 48) this.buttonPulseFading = false;
        }
        else {
            this.buttonPulse++;
            if (this.buttonPulse >= 80) this.buttonPulseFading = true;
        }

        if (!this.preventKeypress) {
            if (this.upKey.isDown) {
                this.preventKeypress = true;

                if (this.currentSelection > 0) {
                    this.currentSelection--;
                    this.clickSound.play();
                }
            }
            if (this.downKey.isDown) {
                this.preventKeypress = true;
                if (this.currentSelection < 2) {
                    this.currentSelection++;
                    this.clickSound.play();
                }
            }
        }

        if (this.selectKey.isDown) {

            if (this.currentSelection == 0) {
                this.clickPlay();
            }

            if (this.currentSelection == 1) {
                this.clickInstructions();
            }

            if (this.currentSelection == 2) {
                this.clickDonate();
            }
        }

        if (this.currentSelection == 0) {
            this.playButton.tint = '0x' + this.buttonPulse.toString() + '00' + '00';
            this.instructionsButton.tint = '0xFFFFFF';
            this.donateButton.tint = '0xFFFFFF';
        }
        if (this.currentSelection == 1) {
            this.playButton.tint = '0xFFFFFF';
            this.instructionsButton.tint = '0x' + this.buttonPulse.toString() + '00' + '00';
            this.donateButton.tint = '0xFFFFFF';
        }
        if (this.currentSelection == 2) {
            this.playButton.tint = '0xFFFFFF';
            this.instructionsButton.tint = '0xFFFFFF';
            this.donateButton.tint = '0x' + this.buttonPulse.toString() + '00' + '00';
        }
    },


    visitPage: function () {
        window.open('http://www.google.com', '_blank');
    },

};