const {
	Color,
	Piece,
	PieceType,
	SelectPiece,
	Board,
	Coords,
	ShowBoard,
	Move,
	KingRays,
} = require('./pce.js')

new Piece(Color.WHITE, PieceType.KING, ...Coords('d4'))
// new Piece(Color.WHITE, PieceType.PAWN, ...Coords('d5'))
new Piece(Color.WHITE, PieceType.PAWN, ...Coords('e5'))
new Piece(Color.WHITE, PieceType.PAWN, ...Coords('f6'))
new Piece(Color.BLACK, PieceType.ROOK, ...Coords('d8'))
new Piece(Color.BLACK, PieceType.BISHOP, ...Coords('h8'))

const [defenders, paths, ncheck, pcheck] = KingRays(Color.WHITE)

console.log(defenders)
console.log(paths)
console.log(ncheck)
console.log(pcheck)