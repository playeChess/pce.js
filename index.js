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
new Piece(Color.BLACK, PieceType.KING, ...Coords('e8'))

ShowBoard()

SelectPiece(Coords('e1'))
Move(Coords('e2'))

ShowBoard()

SelectPiece(Coords('e8'))
Move(Coords('e7'))

ShowBoard()

SelectPiece(Coords('e2'))
Move(Coords('e1'))

ShowBoard()

SelectPiece(Coords('e7'))
Move(Coords('e8'))

console.log(GetStatus())
console.log(FEN())