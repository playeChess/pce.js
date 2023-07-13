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
} = require('./pce.js')

new Piece(Color.WHITE, PieceType.KING, ...Coords('d1'))
new Piece(Color.WHITE, PieceType.ROOK, ...Coords('a2'))
new Piece(Color.BLACK, PieceType.KING, ...Coords('d7'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('d6'))

ShowBoard()

SelectPiece(Coords('a2'))
Move(Coords('d2'))

ShowBoard()

SelectPiece(Coords('d6'))
Move(Coords('d2'))

ShowBoard()

SelectPiece(Coords('d1'))
Move(Coords('d2'))

ShowBoard()