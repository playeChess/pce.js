const {
	Board,
	Piece,
} = require('./pce.js')

Board.init()

Board.show()

Piece.select('e2')
Piece.move('e4')

Board.show()

Piece.select('d7')
Piece.move('d5')

Board.show()

Piece.select('e4')
Piece.move('d5')

Board.show()

console.log(Board.status())
console.log(Board.fen())