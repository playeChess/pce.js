const {
	GetPieces,
	GetPositions,
	Color,
	Piece,
	PieceType,
	SelectPiece,
	Board,
	Coords,
	ShowBoard,
	Move,
	GetStatus,
} = require('./pce.js')

new Piece(Color.WHITE, PieceType.KING, ...Coords('a1'))
new Piece(Color.BLACK, PieceType.KING, ...Coords('d7'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('b8'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('h2'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('h1'))

ShowBoard()

console.log(GetStatus())