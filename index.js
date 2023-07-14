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

Board('4K3/8/8/8/8/8/8/4k3')

ShowBoard()

console.log(GetStatus())
console.log(FEN())