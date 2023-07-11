var 
PIECES = []

var selected = -1
var material_eval = 0

const Color = {
	NONE: -1,
	WHITE: 0,
	BLACK: 1,
}

const PieceType = {
	NONE: -1,
	PAWN: 0,
	KNIGHT: 1,
	BISHOP: 2,
	ROOK: 3,
	QUEEN: 4,
	KING: 5,
}

const Material = {
	[PieceType.PAWN]: 1,
	[PieceType.KNIGHT]: 3,
	[PieceType.BISHOP]: 3,
	[PieceType.ROOK]: 5,
	[PieceType.QUEEN]: 9,
}

const Rank = {
	1: 0,
	2: 1,
	3: 2,
	4: 3,
	5: 4,
	6: 5,
	7: 6,
	8: 7,
}

const File = {
	a: 0,
	b: 1,
	c: 2,
	d: 3,
	e: 4,
	f: 5,
	g: 6,
	h: 7,
}

const Flags = {
	NONE: -1,
	CAPTURE: 0,
	FIRST: 1,
	CASTLE: 2,
	QUEENSIDE_CASTLE: 3,
	EN_PASSANT: 4,
}

const HasFlag = (flags, flag) => flags.indexOf(flag) !== -1

const DefaultFilter = (rank, file) => rank < 8 && rank > -8 && file < 8 && file > -8 && !(rank === 0 && file === 0)

const BaseFilters = {
	[PieceType.PAWN]: (rank, file) => false, // DefaultFilter(rank, file) && (rank === 1 && file === 0),
	[PieceType.KNIGHT]: (rank, file) => DefaultFilter(rank, file) && ((Math.abs(rank) === 2 && Math.abs(file) === 1) || (Math.abs(rank) === 1 && Math.abs(file) === 2)),
	[PieceType.BISHOP]: (rank, file) => DefaultFilter(rank, file) && (Math.abs(rank) === Math.abs(file)),
	[PieceType.ROOK]: (rank, file) => DefaultFilter(rank, file) && (rank * file === 0),
	[PieceType.QUEEN]: (rank, file) => BaseFilters[PieceType.BISHOP](rank, file) || BaseFilters[PieceType.ROOK](rank, file),
	[PieceType.KING]: (rank, file) => DefaultFilter(rank, file) && (Math.abs(rank) <= 1 && Math.abs(file) <= 1),
}

const AdvancedOptionFilter = (filter, options) => (rank, file) => {
	let ret = false
	for(const option of options) {
		if(rank === option[0] && file === option[1]) { ret = true }
	}
	return ret || filter(rank, file)
}

const Filter = (type, flags = []) => {
	if(type === PieceType.PAWN) {
		let filter = []
		filter.push([1, 0])
		if(HasFlag(flags, Flags.FIRST)) {
			filter.push([2, 0])
		} else if(HasFlag(flags, Flags.CAPTURE) || HasFlag(flags, Flags.EN_PASSANT)) {
			filter = [[1, 1], [1, -1]]
		}
		return AdvancedOptionFilter(BaseFilters[PieceType.PAWN], filter)
	} else { return BaseFilters[type] }
}

const GetPath = (start, dest) => {
	const steps = []
	const x = dest[0] - start[0]
	const y = dest[1] - start[1]
	for(let i = 1; i < Math.max(Math.abs(x), Math.abs(y)); i++) {
		steps.push([x === 0 ? 0 : start[0] + (x / Math.abs(x) * i), y === 0 ? 0 : start[0] + (y / Math.abs(y) * i)])
	}
	return steps
}

const CheckPath = (piece, dest) => {
	const path = GetPath(piece.coords(), dest)
	for(const cell of path) {
		for(const piece of PIECES) {
			if(JSON.stringify(cell) === JSON.stringify(piece.coords())) { return false }
		}
	}
	return true
}

const CheckDest = (piece, dest) => {
	for(const piece_ of PIECES) {
		if(JSON.stringify(dest) === JSON.stringify(piece_.coords())) {
			if(piece.color === piece_.color) { return [false, undefined] }
			return [true, Flags.CAPTURE]
		}
	}
	return [true, undefined]
}

const BlackConversion = (coords) => [-coords[0], -coords[1]]

const Offset = (start, end) => [end[0] - start[0], end[1] - start[1]]

const CheckMove = (dest) => {
	const flags = []
	const piece = PIECES[selected]

	if(piece.type !== PieceType.KNIGHT && !CheckPath(piece, dest)) { return false }
	
	if(!piece.moved) { flags.push(Flags.FIRST) }

	const [dest_auth, capture_flag] = CheckDest(piece, dest)

	if(!dest_auth) { return false }

	if(capture_flag === 0) { flags.push(capture_flag) }

	return [Filter(piece.type, flags)(...piece.color ? BlackConversion(Offset(piece.coords(), dest)) : Offset(piece.coords(), dest)), flags]
}

const SelectPiece = (coords) => {
	for(let i = 0; i < PIECES.length; i++) {
		if(JSON.stringify(coords) === JSON.stringify(PIECES[i].coords())) { selected = i }
	}
}

const GetPiece = (coords) => {
	for(const piece of PIECES) {
		if(JSON.stringify(coords) === JSON.stringify(piece.coords())) { return piece }
	}
}

const Board = () => {
	new Piece(Color.WHITE, PieceType.ROOK, Rank[1], File.a)
	new Piece(Color.WHITE, PieceType.KNIGHT, Rank[1], File.b)
	new Piece(Color.WHITE, PieceType.BISHOP, Rank[1], File.c)
	new Piece(Color.WHITE, PieceType.QUEEN, Rank[1], File.d)
	new Piece(Color.WHITE, PieceType.KING, Rank[1], File.e)
	new Piece(Color.WHITE, PieceType.BISHOP, Rank[1], File.f)
	new Piece(Color.WHITE, PieceType.KNIGHT, Rank[1], File.g)
	new Piece(Color.WHITE, PieceType.ROOK, Rank[1], File.h)

	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.a)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.b)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.c)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.d)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.e)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.f)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.g)
	new Piece(Color.WHITE, PieceType.PAWN, Rank[2], File.h)
	
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.a)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.b)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.c)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.d)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.e)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.f)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.g)
	new Piece(Color.BLACK, PieceType.PAWN, Rank[7], File.h)
	
	new Piece(Color.BLACK, PieceType.ROOK, Rank[8], File.a)
	new Piece(Color.BLACK, PieceType.KNIGHT, Rank[8], File.b)
	new Piece(Color.BLACK, PieceType.BISHOP, Rank[8], File.c)
	new Piece(Color.BLACK, PieceType.QUEEN, Rank[8], File.d)
	new Piece(Color.BLACK, PieceType.KING, Rank[8], File.e)
	new Piece(Color.BLACK, PieceType.BISHOP, Rank[8], File.f)
	new Piece(Color.BLACK, PieceType.KNIGHT, Rank[8], File.g)
	new Piece(Color.BLACK, PieceType.ROOK, Rank[8], File.h)
}

const Coords = str =>  [str[1] - 1, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].indexOf(str[0])]
const Notations = coords => `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][coords[1]]}${coords[0] + 1}`

const TakePiece = (coords) => {
	const select_index = PIECES.indexOf(GetPiece(coords))
	const select = PIECES[select_index]
	material_eval += Material[select.type] * select.color ? 1 : -1
	PIECES = PIECES.filter((_, index) => index !== select_index)
}

const Move = (coords) => {
	const move_check = CheckMove(coords)
	if(move_check[0]) {
		if(move_check[1].indexOf(0) !== -1) {
			TakePiece(coords)
		}
		[PIECES[selected].rank, PIECES[selected].file] = coords
		PIECES[selected].moved = true
		console.log(`${PIECES[selected].toString()} (eval: ${material_eval})`)
	} else {
		console.log(`ERROR: ${Notations(coords)} is an invalid move`)
	}
}

class Piece {
	color = Color.NONE
	type = PieceType.NONE
	rank = 0
	file = 0
	moved = false
	
	constructor(color, type, rank = 0, file = 0) {
		this.color = color
		this.type = type
		this.rank = rank
		this.file = file
		PIECES.push(this)
	}
	
	coords = () => [this.rank, this.file]

	toString = () => `${this.color ? 'Black' : 'White'} ${this.type === 0 ? 'pawn' : this.type === 1 ? 'knight' : this.type === 2 ? 'bishop' : this.type === 3 ? 'rook' : this.type === 4 ? 'queen' : 'king'} on ${Notations(this.coords())}`
}

module.exports = {
	PIECES,
	Color,
	Piece,
	PieceType,
	Rank,
	File,
	Filter,
	Flags,
	CheckMove,
	SelectPiece,
	Board,
	GetPiece,
	Coords,
	Move,
}