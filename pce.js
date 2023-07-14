var PIECES = {}

const GetPieces = () => PIECES

const None = -1

var selected = None
const moves = []
var en_passant_offset = 0
const king_pos = [[0, 4], [7, 4]]
const fen_history = []
var move_count = 0
var promotion = [None, None]

const Color = {
	NONE: None,
	WHITE: 0,
	BLACK: 1,
}

const PieceType = {
	NONE: None,
	PAWN: 0,
	KNIGHT: 1,
	BISHOP: 2,
	ROOK: 3,
	QUEEN: 4,
	KING: 5,
}

const Material = {
	[PieceType.KING]: 0,
	[PieceType.PAWN]: 1,
	[PieceType.KNIGHT]: 3,
	[PieceType.BISHOP]: 3,
	[PieceType.ROOK]: 5,
	[PieceType.QUEEN]: 9,
}

const Flags = {
	NONE: None,
	CAPTURE: 0,
	FIRST: 1,
	CASTLE: 2,
	QUEENSIDE_CASTLE: 3,
	EN_PASSANT: 4,
}

const Status = {
	DEFAULT: 0,
	CHECK: 1,
	STALEMATE: 2,
	THREEFOLD: 3,
	INSUFFICIENT: 4,
	FIFTY_MOVES: 5,
	CHECKMATE: 6,
}

class MoveObj {
	piece
	from
	to

	constructor(piece, from = [0, 0], to = [0, 0]) {
		this.piece = piece.clone()
		this.piece.__proto__ = piece.__proto__
		this.from = from
		this.to = to
	}
}

const HasFlag = (flags, flag) => flags.indexOf(flag) !== None

const DefaultFilter = (rank, file) => rank < 8 && rank > -8 && file < 8 && file > -8 && !(rank === 0 && file === 0)

const BaseFilters = {
	[PieceType.PAWN]: () => false,
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
		steps.push([x === 0 ? start[0] : start[0] + (x / Math.abs(x) * i), y === 0 ? start[1] : start[1] + (y / Math.abs(y) * i)])
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

const InCoordsList = (coord, coords) => {
	for(const c of coords) {
		if(JSON.stringify(c) === JSON.stringify(coord)) { return true }
	}
	return false
}

const CheckMove = (dest, piece=undefined) => {
	const flags = []
	piece = piece ?? PIECES[selected]

	if(IsCheck(piece.color)) {
		const rays = KingRays(piece.color)
		const coords_list = rays[1]
		const ncheck = rays[2]
		const pcheck = rays[3]
		if(JSON.stringify(ncheck) !== JSON.stringify([]) && piece.type !== PieceType.KING && JSON.stringify(dest) != JSON.stringify(ncheck)) { return [false, [], 'Need to move/protect king (from n)'] }
		if(JSON.stringify(pcheck) !== JSON.stringify([]) && piece.type !== PieceType.KING && JSON.stringify(dest) != JSON.stringify(pcheck)) { return [false, [], 'Need to move/protect king (from p)'] }
		if(coords_list.length !== 0 && piece.type !== PieceType.KING && !(coords_list.length > 1 || InCoordsList(dest, coords_list[0]))) { return [false, [], 'Need to move/protect king'] }
	}
	if((piece.type === PieceType.KING && IsCheck(piece.color, dest))) { return [false, [], 'Check (king move ->)'] }
	else if(piece.type !== PieceType.KNIGHT && !CheckPath(piece, dest)) { return [false, [], 'Path'] }

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
		!IsCheck(piece.color, [rank, 1]) &&
		GetPiece(rank, 2) === undefined &&
		!IsCheck(piece.color, [rank, 2]) &&
		GetPiece(rank, 3) === undefined &&
		!IsCheck(piece.color, [rank, 3])
	) { flags.push(Flags.QUEENSIDE_CASTLE) }
	if(
		JSON.stringify(dest) === JSON.stringify([rank, 6]) &&
		rook &&
		piece.type === PieceType.KING &&
		!piece.moved &&
		rook.type === PieceType.ROOK &&
		!rook.moved &&
		GetPiece(rank, 5) === undefined &&
		!IsCheck(piece.color, [rank, 5]) &&
		GetPiece(rank, 6) === undefined &&
		!IsCheck(piece.color, [rank, 6])
	) { flags.push(Flags.CASTLE) }
	
	if(!piece.moved) { flags.push(Flags.FIRST) }

	const [dest_auth, capture_flag] = CheckDest(piece, dest)

	if(!dest_auth) { return [false, [], 'Destination'] }

	if(capture_flag === 0) { flags.push(capture_flag) }
	
	return [Filter(piece.type, flags)(...piece.color && piece.type !== PieceType.KING ? BlackConversion(Offset(piece.coords(), dest)) : Offset(piece.coords(), dest)), flags, 'Filters']
}

const SelectPiece = (notation) => {
	for(const nota of Object.keys(PIECES)) {
		if(nota === notation) { selected = notation }
	}
}

const GetPiece = coords => PIECES[Notations(coords)]

const IsUpperCase = str => str === str.toUpperCase()

const Board = (fen = 'RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr') => {
	fen_history.push(fen)
	let [rank, file] = [0, 0]
	for(const line of fen.split('/')) {
		file = 0
		for(const char of line) {
			if('pnbrqk'.indexOf(char.toLowerCase()) !== None) {
				let color, type
				switch(char.toLowerCase()) {
					case 'p':
						type = PieceType.PAWN
						break
					case 'n':
						type = PieceType.KNIGHT
						break
					case 'b':
						type = PieceType.BISHOP
						break
					case 'r':
						type = PieceType.ROOK
						break
					case 'q':
						type = PieceType.QUEEN
						break
					case 'k':
						type = PieceType.KING
						break
					default:
						break
				}

				color = IsUpperCase(char) ? Color.WHITE : Color.BLACK

				new Piece(color, type, rank, file)
				file++
			} else {
				file -= -char
			}
		}
		rank++
	}
}

const MaterialEval = () => Object.values(PIECES).reduce((eva, piece) => eva + Material[piece.type] * (piece.color ? 1 : -1), 0)

const Coords = str =>  [str[1] - 1, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].indexOf(str[0])]
const Notations = coords => `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][coords[1]]}${coords[0] + 1}`

const TakePiece = coords => { delete PIECES[Notations(coords)] }

const Move = notation => {
	const coords = Coords(notation)
	const move_check = CheckMove(coords)
	const start = PIECES[selected].coords()
	if(move_check[0]) {
		if(PIECES[selected].type === PieceType.KING) { king_pos[PIECES[selected].color] = coords }
		if(PIECES[selected].type === PieceType.PAWN) {
			move_count = -1
			if(coords[0] === (PIECES[selected].color ? 0 : 7)) {
				promotion = coords
			}
		}
		if(move_check[1].indexOf(Flags.CAPTURE) !== None) {
			TakePiece(coords)
			move_count = -1
		} else if(move_check[1].indexOf(Flags.EN_PASSANT) !== None) {
			TakePiece([coords[0] - 1, coords[1]])
			move_count = -1
		} else if(move_check[1].indexOf(Flags.QUEENSIDE_CASTLE) !== None) {
			const rank = PIECES[selected].color ? 7 : 0
			GetPiece([rank, 0]).file = 3
			PIECES[Notations([rank, 3])] = GetPiece([rank, 0])
			delete PIECES[Notations([rank, 0])]
		} else if(move_check[1].indexOf(Flags.CASTLE) !== None) {
			const rank = PIECES[selected].color ? 7 : 0
			GetPiece([rank, 7]).file = 5
			PIECES[Notations([rank, 5])] = GetPiece([rank, 7])
			delete PIECES[Notations([rank, 7])]
		}
		PIECES[notation] = PIECES[selected]
		delete PIECES[Notations(PIECES[selected].coords())];
		[PIECES[notation].rank, PIECES[notation].file] = coords
		PIECES[notation].moved = true
		moves.push(new MoveObj(PIECES[notation], start, coords))
		console.log(`${PIECES[notation].toString()} from ${Notations(start)} (eval: ${MaterialEval()})`)
		if(IsCheck(1 - PIECES[notation].color)) { console.log(`Your opponent (${PIECES[notation].color ? 'white' : 'black'}) is check`) }
		fen_history.push(FEN())
		move_count++
	} else {
		console.log(`ERROR: ${Notations(coords)} is an invalid move (${move_check[2]})`)
	}
}

const Promote = (notation, type = PieceType.QUEEN) => {
	const coords = Coords(notation)
	if(JSON.stringify(coords) === JSON.stringify(promotion)) {
		if(type === PieceType.KNIGHT || type === PieceType.BISHOP || type === PieceType.ROOK || type === PieceType.QUEEN) {
			PIECES[notation].type = type
		} else {
			console.log('Invalid type')
		}
	} else {
		console.log('Invalid coords')
	}
}

const GetEveryColoredMove = color => {
	const mvs = []
	for(let i = 0; i < 8; i++) {
		for(let j = 0; j < 8; j++) {
			for(const piece of Object.values(PIECES)) {
				if(piece.color === color && CheckMove([i, j], piece)[0]) { mvs.push([piece.coords(), [i, j]]) }
			}
		}
	}
	return mvs
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
		PIECES[Notations(this.coords())] = this
		if(type === PieceType.KING) { king_pos[color] = this.coords() }
	}
	
	coords() { return [this.rank, this.file] }

	toString() { return `${this.color ? 'Black' : 'White'} ${this.type === 0 ? 'pawn' : this.type === 1 ? 'knight' : this.type === 2 ? 'bishop' : this.type === 3 ? 'rook' : this.type === 4 ? 'queen' : 'king'} on ${Notations(this.coords())}` }

	clone() { return Object.setPrototypeOf(structuredClone(this), this.__proto__) }
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
	console.log('')
	console.log('    a b c d e f g h')
	console.log('  #-----------------#')
	for(let i = 7; i >= 0; i--) {
		let str = `${i + 1} | `
		for(let j = 0; j < 8; j++) {
			let type
			const piece = GetPiece([i, j])
			if(piece) {
				type = PieceRepr(piece)
			} else { type = ' ' }
			str += type + ' '
		}
		console.log(str + ` | ${i + 1}`)
	}
	console.log('  #-----------------#')
	console.log('    a b c d e f g h')
	console.log('')
}

const FEN = () => {
	let fen = ''
	for(let i = 0; i < 8; i++) {
		let spaces = 0
		for(let j = 0; j < 8; j++) {
			const piece = GetPiece([i, j])
			if(piece) {
				if(spaces > 0) {
					fen += `${spaces}`
					spaces = 0
				}
				fen += PieceRepr(piece)
			} else { spaces++ }
		}
		if(spaces > 0) { fen += spaces }
		fen += i < 7 ? '/' : ''
	}
	return fen
}

const AddCoords = (...coords) => {
	const rt = [0, 0]
	for(const coord of coords) {
		rt[0] += coord[0]
		rt[1] += coord[1]
	}
	return rt
}

const InBounds = coords => coords[0] < 8 && coords[0] >= 0 && coords[1] < 8 && coords[1] >= 0

const Ray = offset => [
	[offset, offset], [offset, -offset], [-offset, offset], [-offset, -offset],
	[offset, 0], [0, offset], [-offset, 0], [0, -offset]
]

const KnightThreats = pos => [
	AddCoords(pos, [2, 1]), AddCoords(pos, [2, -1]), AddCoords(pos, [-2, 1]), AddCoords(pos, [-2, -1]),
	AddCoords(pos, [1, 2]), AddCoords(pos, [1, -2]), AddCoords(pos, [-1, 2]), AddCoords(pos, [-1, -2])
]

const KingRays = (color, coords=undefined) => {
	const ray_center = coords ?? king_pos[color]
	// B + R
	const buffer = [[], [], [], [], [], [], [], []]
	const lines = [[], [], [], [], [], [], [], []]
	const enemy = [false, false, false, false, false, false, false, false]
	const out = [false, false, false, false, false, false, false, false]
	for(let i = 1; i < 8; i++) {
		const rays = Ray(i)
		for(let j = 0; j < rays.length; j++) {
			if(!out[j]) {
				const coord = AddCoords(ray_center, rays[j])
				if(!InBounds(coord)) {
					out[j] = true
					continue
				}
				lines[j].push(coord)
				const piece = GetPiece(coord)
				if(piece) {
					if(piece.type === PieceType.KING) { continue }
					if(piece.color === color) { buffer[j].push(coord) }
					else {
						out[j] = true
						if(piece.type === (j < 4 ? PieceType.BISHOP : PieceType.ROOK) || piece.type === PieceType.QUEEN) {
							enemy[j] = true
						}
					}
				}
			}
		}
	}

	// N
	let ncheck = []
	const knight_reaches = KnightThreats(ray_center)
	for(const knight_pos of knight_reaches) {
		const knight = GetPiece(knight_pos)
		if(knight && knight.color !== color) { ncheck = knight.coords() }
	}

	// P
	let pcheck = []
	const pawns =  [GetPiece(AddCoords(ray_center, [1, color ? -1 : 1])), GetPiece(AddCoords(ray_center, [color ? -1 : 1, -1]))]
	for(const pawn of pawns) {
		if(pawn && pawn.color !== color) { pcheck = pawn.coords() }
	}

	// Return
	const res = [
		[], // Positions of interposed pieces
		[], // Path they are pinned to
		ncheck, // Position(s) of opponent's checking knight(s)
		pcheck // Position(s) of opponent's checking pawn(s)
	]
	for(const el of buffer) {
		if(el.length === 1) { res[0].push(el[0]) }
		else if(el.length === 0 && enemy[buffer.indexOf(el)]) { res[0].push(el) }
		else { enemy[buffer.indexOf(el)] = false }
	} for(let i = 0; i < lines.length; i++) {
		if(enemy[i]) { res[1].push(lines[i]) }
	}
	return res
}

const IsCheck = (color, coords = undefined) => {
	const [defenders, _, ncheck, pcheck] = KingRays(color, coords)
	for(const defender of defenders) {
		if(defender.length === 0) { return true }
	}
	if(ncheck.length !== 0) { return true }
	if(pcheck.length !== 0) { return true }
	return false
}

const ThreefoldRepetition = () => {
	const r = {}
	for(const val of fen_history) {
		if(r[val]) {
			r[val]++
		} else { r[val] = 1 }
	}
	return Object.values(r).reduce((mem, val) => {
		if(val >= 3) {
			return true
		} else { return mem }
	}, false)
}

const InsufficientMaterial = () => {
	let ncount = 0
	let bcount = 0
	for(const piece of Object.values(PIECES)) {
		switch(piece.type) {
			case PieceType.PAWN:
			case PieceType.ROOK:
			case PieceType.QUEEN:
				return false
			case PieceType.KNIGHT:
				ncount++
				break
			case PieceType.BISHOP:
				bcount++
				break
			default:
				break
		}
	}
	return ncount + bcount < 2 || bcount === 0 && ncount === 2
}

const GetStatus = () => {
	let status = [Status.DEFAULT, Color.NONE]
	if(ThreefoldRepetition()) {
		return [Status.THREEFOLD, Color.NONE]
	}
	if(move_count >= 50) {
		return [Status.FIFTY_MOVES, Color.NONE]
	}
	if(InsufficientMaterial()) {
		return [Status.INSUFFICIENT, Color.NONE]
	}
	for(const color of [Color.WHITE, Color.BLACK]) {
		if(IsCheck(color)) {
			status = [Status.CHECK, color]
		}
		if(GetEveryColoredMove(color).length === 0) {
			if(JSON.stringify(status) === JSON.stringify([Status.CHECK, color])) { status[0] = Status.CHECKMATE }
			else { status[0] = Status.STALEMATE }
		}
	}
	status.push(promotion)
	return status
}

module.exports = {
	Board: {
		init: Board,
		show: ShowBoard,
		pieces: GetPieces,
		status: GetStatus,
		fen: FEN,
	},
	Piece: {
		select: SelectPiece,
		move: Move,
		promote: Promote,
	},
}