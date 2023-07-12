const {
	GetPieces,
	GetPositions,
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
	ShowBoard,
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

/* Board()

SelectPiece(Coords('e2'))
Move(Coords('e4'))
ShowBoard()
Move(Coords('e5'))
ShowBoard()
Move(Coords('e6'))
ShowBoard()
Move(Coords('d7'))
ShowBoard()

SelectPiece(Coords('e8'))
Move(Coords('d7'))
ShowBoard() */

/* new Piece(Color.WHITE, PieceType.PAWN, ...Coords('e5'))
new Piece(Color.BLACK, PieceType.PAWN, ...Coords('f7'))
SelectPiece(Coords('f7'))
Move(Coords('f5'))
SelectPiece(Coords('e5'))
Move(Coords('f6')) */

/* new Piece(Color.WHITE, PieceType.KING, ...Coords('e1'))
new Piece(Color.WHITE, PieceType.ROOK, ...Coords('a1'))
new Piece(Color.WHITE, PieceType.ROOK, ...Coords('h1'))

ShowBoard()

SelectPiece(Coords('e1'))
Move(Coords('g1'))

ShowBoard() */

Board()
ShowBoard()
console.log(GetPositions())