const { Board, Piece } = require('./pce.js')

Board.init('K1k5/8/8/8/8/8/8/8')

Board.show()

Piece.select('c1')
Piece.move('b1')

Board.show()

console.log(Board.status())
console.log(Board.fen())