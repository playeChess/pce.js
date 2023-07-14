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
	FEN,
} = require('./pce.js')

new Piece(Color.WHITE, PieceType.KING, ...Coords('e1'))
new Piece(Color.WHITE, PieceType.ROOK, ...Coords('a1'))
new Piece(Color.WHITE, PieceType.ROOK, ...Coords('f1'))
new Piece(Color.BLACK, PieceType.KING, ...Coords('e8'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('h8'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('d8'))

ShowBoard()

SelectPiece(Coords('e1'))
Move(Coords('c1'))

ShowBoard()

SelectPiece(Coords('e8'))
Move(Coords('g8'))

ShowBoard()

console.log(GetStatus())
console.log(FEN())