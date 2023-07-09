const PIECES = []

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

const Flags = {
	NONE: -1,
	CAPTURE: 0,
	FIRST_PAWN: 1,
	CASTLE: 2,
	QUEENSIDE_CASTLE: 3,
	EN_PASSANT: 4,
}

const HasFlag = (flags, flag) => {
	for(const fl of flags) {
		if(fl === flag) { return true }
	}
	return false
}

const DefaultFilter = (rank, file) => rank < 8 && rank > -8 && file < 8 && file > -8 && !(rank === 0 && file === 0)

const BaseFilters = {
	[PieceType.PAWN]: (rank, file) => DefaultFilter(rank, file) && (rank === 1 && file === 0),
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
		const filter = []
		filter.push([1, 0])
		if(HasFlag(flags, Flags.CAPTURE) || HasFlag(flags, Flags.EN_PASSANT)) {
			filter.push([1, 1], [1, -1])
		} if(HasFlag(flags, Flags.FIRST_PAWN)) {
			filter.push([2, 0])
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

const CheckMove = (piece, dest) => {
	const flags = []

	if(!CheckPath(piece, dest)) { return false }

	const [dest_auth, capture_flag] = CheckDest(piece, dest)

	if(!dest_auth) { return false }

	if(capture_flag === 0) { flags.push(capture_flag) }
	
	return Filter(piece.type, flags)(...dest)
}

class Piece {
	color = Color.NONE
	type = PieceType.NONE
	rank = 0
	file = 0
	
	constructor(color, type, rank = 0, file = 0) {
		this.color = color
		this.type = type
		this.rank = rank
		this.file = file
		PIECES.push(this)
	}
	
	coords = () => [this.rank, this.file]
}

module.exports = {
	PIECES,
	Color,
	Piece,
	PieceType,
	Filter,
	Flags,
	CheckMove,
}