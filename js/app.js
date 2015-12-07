/**
 * Created by Matthew on 12/3/2015.
 */

var game = new Phaser.Game(1216, 768, Phaser.CANVAS, 'Trump');



/*game.state.add('InstructionsMenu', InstructionsMenu, false);
game.state.add('LoadNextLevel', LoadNextLevel, false);
game.state.add('Game', Game, false);*/
game.state.add('Menu', Menu, true);

