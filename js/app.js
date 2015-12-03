/**
 * Created by Matthew on 12/3/2015.
 */
winW = document.body.offsetWidth;
winH = document.body.offsetHeight;
var game = new Phaser.Game(900,900, Phaser.CANVAS, 'Trump');


game.state.add('Menu', Menu);


game.state.start('Menu');