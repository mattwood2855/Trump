/**
 * Created by Matthew on 12/3/2015.
 */

var game = new Phaser.Game(1216, 768, Phaser.CANVAS, 'Trump');

game.points = 0;
game.lives = 3;

game.state.add('InstructionsMenu', InstructionsMenu);
game.state.add('LoadNextLevel', LoadNextLevel);
game.state.add('Game', Game);
game.state.add('Menu', Menu);

game.state.start('Menu');