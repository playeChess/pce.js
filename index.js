const { Board, Piece } = require('./pce.js')

Board.init('8/8/K1k5/8/8/8/8/PP1P4')

Board.show()

Piece.select('a3')
Piece.move('a4')

Board.show()

console.log(Board.status())
console.log(Board.fen())