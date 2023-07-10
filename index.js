const { PIECES, Color, Piece, PieceType, Filter, Flags, CheckMove, SelectPiece } = require('./pce.js')

/* console.log(Filter(PieceType.PAWN, [Flags.CAPTURE, Flags.FIRST_PAWN])(2, 0))
console.log(Filter(PieceType.KNIGHT)(1, -2))
console.log(Filter(PieceType.BISHOP)(-4, 4))
console.log(Filter(PieceType.ROOK)(0, 5))
console.log(Filter(PieceType.QUEEN)(2, 2))
console.log(Filter(PieceType.KING)(1, -1)) */
const foo = new Piece(Color.WHITE, PieceType.BISHOP)
const bar = new Piece(Color.TRUE, PieceType.ROOK, 6, 6)

SelectPiece(foo)
console.log(CheckMove([6, 6]))