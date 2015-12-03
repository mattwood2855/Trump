/**
 * Created by Matthew on 12/3/2015.
 */
winW = document.body.offsetWidth;
winH = document.body.offsetHeight;
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Trump');

//game.state.add('Menu', Menu, true);
game.state.add('Game', PhaserGame, true);