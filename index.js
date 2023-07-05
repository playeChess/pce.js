const { Piece, Color, PieceTypes, Flag, move } = require('./pce.js')

console.log(move(
	new Piece(
		Color.White,
		PieceTypes.Queen,
		7
	),
	16
))