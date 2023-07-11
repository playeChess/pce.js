const {
	PIECES,
	Color,
	Piece,
	PieceType,
	Rank,
	File, Filter,
	Flags,
	CheckMove,
	SelectPiece,
	Board,
	GetPiece,
	Coords,
	Move,
} = require('./pce.js')

/* console.log(Filter(PieceType.PAWN, [Flags.CAPTURE, Flags.FIRST_PAWN])(2, 0))
console.log(Filter(PieceType.KNIGHT)(1, -2))
console.log(Filter(PieceType.BISHOP)(-4, 4))
console.log(Filter(PieceType.ROOK)(0, 5))
console.log(Filter(PieceType.QUEEN)(2, 2))
console.log(Filter(PieceType.KING)(1, -1)) */

/* const foo = new Piece(Color.WHITE, PieceType.BISHOP)
const bar = new Piece(Color.TRUE, PieceType.ROOK, Rank[7], File.g)

SelectPiece(foo)
console.log(CheckMove([Rank[7], File.g])) */

Board()

SelectPiece(Coords('e2'))
Move(Coords('e4'))
Move(Coords('e5'))
Move(Coords('e6'))
Move(Coords('d7'))

SelectPiece(Coords('e8'))
Move(Coords('d7'))