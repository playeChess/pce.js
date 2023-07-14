const {
	GetPieces,
	GetPositions,
	SelectPiece,
	Board,
	Coords,
	ShowBoard,
	Move,
	GetStatus,
	FEN,
	Promote,
} = require('./pce.js')

Board('4K3/8/8/8/8/8/P7/4k3')

ShowBoard()

SelectPiece(Coords('a7'))
Move(Coords('a8'))

ShowBoard()

Promote(Coords('a8'))

ShowBoard()

SelectPiece(Coords('e8'))
Move(Coords('g8'))

ShowBoard()

console.log(GetStatus())
console.log(FEN())