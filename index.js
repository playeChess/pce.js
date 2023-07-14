const {
	Board,
	Piece,
	Coords,
} = require('./pce.js')

Board.init('4K3/8/8/8/8/8/P7/4k3')

Board.show()

Piece.select(Coords('a7'))
Piece.move(Coords('a8'))

Board.show()

Piece.promote(Coords('a8'))

Board.show()

Piece.select(Coords('e8'))
Piece.move(Coords('g8'))

Board.show()

console.log(Board.status())
console.log(Board.fen())