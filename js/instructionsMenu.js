/**
 * Created by Matthew on 12/3/2015.
 */

var InstructionsMenu = function(game) {

    // Create variables handles for all graphics objects
    this.background = null;


    // Hold the current selected button
    this.currentSelection = 0;

    // Handles for input
    this.upKey = null;
    this.downKey = null;
    this.selectKey = null;

}

InstructionsMenu.prototype = {

    preload : function() {

        // Load all the menu graphics
        this.load.image('instructionsMenu', 'assets/instructionsMenu.png');

    },


    create: function () {

        // Add the background and set it to the width and height of the canvas
        this.background = this.add.sprite(0, 0, 'instructionsMenu');
        this.background.width = game.width;
        this.background.height = game.height;

        // Register the Up, Down, and Enter keys
        this.selectKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    },

    update: function(){
        if(!this.movingSelectors) {
            if (this.selectKey.isDown) {
                if(this.currentSelection == 0){
                    this.backgroundSound.stop();
                    game.state.start('Menu');
                }
            }

        }
    },

};