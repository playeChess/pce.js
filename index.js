const { Board, Piece } = require('./pce.js')

Board.init('K7/1p6/8/7P/8/8/8/7k')

Board.show()

Piece.select('h4')
Piece.move('h5')

Board.show()

console.log(Board.status())
console.log(Board.fen())