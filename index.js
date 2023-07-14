const {
	Board,
	Piece,
} = require('./pce.js')

Board.init()

Board.show()

Piece.select('e2')
Piece.move('e4')

Board.show()

console.log(Board.status())
console.log(Board.fen())