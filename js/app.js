/**
 * Created by Matthew on 12/3/2015.
 */
winW = document.body.offsetWidth;
winH = document.body.offsetHeight;
var game = new Phaser.Game(1216, 768, Phaser.CANVAS, 'Trump');

game.state.add('Game', PhaserGame);

game.state.add('Menu', Menu);

game.state.start('Menu');