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
	KingRays,
	IsCheck,
} = require('./pce.js')

new Piece(Color.WHITE, PieceType.KING, ...Coords('d4'))
new Piece(Color.WHITE, PieceType.ROOK, ...Coords('a1'))
new Piece(Color.BLACK, PieceType.KING, ...Coords('h6'))
new Piece(Color.BLACK, PieceType.PAWN, ...Coords('c6'))

ShowBoard()

SelectPiece(Coords('d4'))
Move(Coords('d5'))

ShowBoard()

SelectPiece(Coords('a1'))
Move(Coords('a8'))

ShowBoard()