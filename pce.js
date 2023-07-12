var PIECES = []

const POSITIONS = {}

const GetPieces = () => PIECES
const GetPositions = () => POSITIONS

var selected = -1
var material_eval = 0
const moves = []
var en_passant_offset = 0
const king_pos = [[0, 4], [7, 4]]

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

class MoveObj {
	piece
	from
	to

	constructor(piece = new Piece(Color.NONE, PieceType.NONE, 0, 0), from = [0, 0], to = [0, 0]) {
		this.piece = JSON.parse(JSON.stringify(piece))
		this.from = from
		this.to = to
	}
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
		} if(HasFlag(flags, Flags.CAPTURE)) {
			filter = [[1, 1], [1, -1]]
		} if(HasFlag(flags, Flags.EN_PASSANT)) {
			filter.push([1, en_passant_offset])
		}
		return AdvancedOptionFilter(BaseFilters[PieceType.PAWN], filter)
	} else if(type === PieceType.KING) {
		let filter = []
		if(HasFlag(flags, Flags.QUEENSIDE_CASTLE)) {
			filter.push([0, -2])
		}
		if(HasFlag(flags, Flags.CASTLE)) {
			filter.push([0, 2])
		}
		return AdvancedOptionFilter(BaseFilters[PieceType.KING], filter)
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
		if(GetPiece(cell)) { return false }
	}
	return true
}

const CheckDest = (piece, dest) => {
	const piece_ = GetPiece(dest)
	if(piece_) {
		if(piece.color === piece_.color) { return [false, undefined] }
		return [true, Flags.CAPTURE]
	}
	return [true, undefined]
}

const BlackConversion = (coords) => [-coords[0], -coords[1]]

const Offset = (start, end) => [end[0] - start[0], end[1] - start[1]]

const CheckMove = (dest) => {
	const flags = []
	const piece = PIECES[selected]

	if(piece.type !== PieceType.KNIGHT && !CheckPath(piece, dest)) { return false }

	const last = moves[moves.length - 1]
	if(
		moves.length != 0 &&
		piece.type === PieceType.PAWN &&
		last.piece.type === PieceType.PAWN &&
		Math.abs(last.from[1] - piece.file) === 1 &&
		last.to[0] === piece.rank &&
		(
			(piece.color === Color.WHITE && last.from[0] - 2 === piece.rank) ||
			(piece.color === Color.BLACK && last.from[0] + 2 === piece.rank)
		)
	) {
		flags.push(Flags.EN_PASSANT)
		en_passant_offset = last.from[1] - piece.file
	}

	const rank = piece.color ? 7 : 0
	const qrook = GetPiece([rank, 0])
	const rook = GetPiece([rank, 7])
	if(
		JSON.stringify(dest) === JSON.stringify([rank, 2]) &&
		qrook &&
		piece.type === PieceType.KING &&
		!piece.moved &&
		qrook.type === PieceType.ROOK &&
		!qrook.moved &&
		GetPiece(rank, 1) === undefined &&
		GetPiece(rank, 2) === undefined &&
		GetPiece(rank, 3) === undefined
	) { flags.push(Flags.QUEENSIDE_CASTLE) }
	if(
		JSON.stringify(dest) === JSON.stringify([rank, 6]) &&
		rook &&
		piece.type === PieceType.KING &&
		!piece.moved &&
		rook.type === PieceType.ROOK &&
		!rook.moved &&
		GetPiece(rank, 5) === undefined &&
		GetPiece(rank, 6) === undefined
	) { flags.push(Flags.CASTLE) }
	
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

const GetPiece = coords => POSITIONS[Notations(coords)]

const Board = () => {
	new Piece(Color.WHITE, PieceType.ROOK, ...Coords('a1'))
	new Piece(Color.WHITE, PieceType.KNIGHT, ...Coords('b1'))
	new Piece(Color.WHITE, PieceType.BISHOP, ...Coords('c1'))
	new Piece(Color.WHITE, PieceType.QUEEN, ...Coords('d1'))
	new Piece(Color.WHITE, PieceType.KING, ...Coords('e1'))
	new Piece(Color.WHITE, PieceType.BISHOP, ...Coords('f1'))
	new Piece(Color.WHITE, PieceType.KNIGHT, ...Coords('g1'))
	new Piece(Color.WHITE, PieceType.ROOK, ...Coords('h1'))

	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('a2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('b2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('c2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('d2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('e2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('f2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('g2'))
	new Piece(Color.WHITE, PieceType.PAWN, ...Coords('h2'))
	
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('a7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('b7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('c7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('d7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('e7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('f7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('g7'))
	new Piece(Color.BLACK, PieceType.PAWN, ...Coords('h7'))
	
	new Piece(Color.BLACK, PieceType.ROOK, ...Coords('a8'))
	new Piece(Color.BLACK, PieceType.KNIGHT, ...Coords('b8'))
	new Piece(Color.BLACK, PieceType.BISHOP, ...Coords('c8'))
	new Piece(Color.BLACK, PieceType.QUEEN, ...Coords('d8'))
	new Piece(Color.BLACK, PieceType.KING, ...Coords('e8'))
	new Piece(Color.BLACK, PieceType.BISHOP, ...Coords('f8'))
	new Piece(Color.BLACK, PieceType.KNIGHT, ...Coords('g8'))
	new Piece(Color.BLACK, PieceType.ROOK, ...Coords('h8'))
}

const Coords = str =>  [str[1] - 1, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].indexOf(str[0])]
const Notations = coords => `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][coords[1]]}${coords[0] + 1}`

const TakePiece = (coords) => {
	const select_index = PIECES.indexOf(GetPiece(coords))
	material_eval += Material[PIECES[select_index].type] * PIECES[select_index].color ? 1 : -1
	PIECES = PIECES.filter((_, index) =>  index !== select_index)
}

const Move = (coords) => {
	const move_check = CheckMove(coords)
	const start = PIECES[selected].coords()
	if(move_check[0]) {
		delete POSITIONS[PIECES[selected].coords()]
		POSITIONS[coords] = PIECES[selected]
		if(PIECES[selected].type === PieceType.KING) { king_pos[PIECES[selected].color] = coords }
		if(move_check[1].indexOf(Flags.CAPTURE) !== -1) {
			TakePiece(coords)
		} else if(move_check[1].indexOf(Flags.EN_PASSANT) !== -1) {
			TakePiece([coords[0] - 1, coords[1]])
		} else if(move_check[1].indexOf(Flags.QUEENSIDE_CASTLE) !== -1) {
			const i = PIECES[selected].color ? 7 : 0
			GetPiece([i, 0]).file += 3
		} else if(move_check[1].indexOf(Flags.CASTLE) !== -1) {
			const i = PIECES[selected].color ? 7 : 0
			GetPiece([i, 7]).file -= 2
		}
		[PIECES[selected].rank, PIECES[selected].file] = coords
		PIECES[selected].moved = true
		moves.push(new MoveObj(PIECES[selected], start, coords))
		console.log(`${PIECES[selected].toString()} from ${Notations(start)} (eval: ${material_eval})`)
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
		POSITIONS[Notations(this.coords())] = this
	}
	
	coords = () => [this.rank, this.file]

	toString = () => `${this.color ? 'Black' : 'White'} ${this.type === 0 ? 'pawn' : this.type === 1 ? 'knight' : this.type === 2 ? 'bishop' : this.type === 3 ? 'rook' : this.type === 4 ? 'queen' : 'king'} on ${Notations(this.coords())}`
}

const PieceRepr = piece => {
	let type = ''
	switch(piece.type) {
		case PieceType.PAWN:
			type = 'p'
			break
		case PieceType.KNIGHT:
			type = 'n'
			break
		case PieceType.BISHOP:
			type = 'b'
			break
		case PieceType.ROOK:
			type = 'r'
			break
		case PieceType.QUEEN:
			type = 'q'
			break
		case PieceType.KING:
			type = 'k'
			break
		default:
			break
	}
	if(!piece.color) { type = type.toUpperCase() }
	return type
}

const ShowBoard = () => {
	console.log('#-----------------#')
	for(let i = 7; i >= 0; i--) {
		let str = '| '
		for(let j = 0; j < 8; j++) {
			let type
			const piece = GetPiece([i, j])
			if(piece) {
				type = PieceRepr(piece)
			} else {
				type = ' '
			}
			str += type + ' '
		}
		console.log(str + '|')
	}
	console.log('#-----------------#')
}

const KingRays = color => {
	for(let i = 0; i < 8; i++) {

	}
}

module.exports = {
	GetPieces,
	GetPositions,
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
	ShowBoard,
}