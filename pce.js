const Color = {
	None: -1,
	White: 0,
	Black: 1
}

const PieceTypes = {
	No_Piece: -1,
	Pawn: 0,
	Knight: 1,
	Bishop: 2,
	Rook: 3,
	Queen: 4,
	King: 5
}

const Flag = {
	None: 0,
	Capture: 1,
	First_Pawn: 2,
	En_Passant: 3,
	Pawn_Promotion: 4,
	Castling: 5
}

const PrimaryFilter = {
	Row: (start, end) => Math.floor(start / 8) === Math.floor(end / 8),
	File: (start, end) => start % 8 === end % 8,
	Diagonal: (start, end) => Math.abs(start - end) % 7 === 0 || Math.abs(start - end) % 9 === 0,
	King: (start, end) => Math.abs(start - end) === 1 || Math.abs(start - end) === 7 || Math.abs(start - end) === 8 || Math.abs(start - end) === 9,
	Knight: (start, end) => Math.abs(start - end) === 6 || Math.abs(start - end) === 10 || Math.abs(start - end) === 15 || Math.abs(start - end) === 17,
	WhitePawn: (start, end) => end - start === 8,
	WhitePawnFirst: (start, end) => end - start === 8 || end - start === 16,
	WhitePawnCapture: (start, end) => end - start === 7 || end - start === 9,
	BlackPawn: (start, end) => start - end === 8,
	BlackPawnFirst: (start, end) => start - end === 8 || start - end === 16,
	BlackPawnCapture: (start, end) => start - end === 7 || start - end === 9,
}

const Patterns = {
	[PieceTypes.Pawn]: {
		[Color.White]: {
			[Flag.None]: PrimaryFilter.WhitePawn,
			[Flag.First_Pawn]: PrimaryFilter.WhitePawnFirst,
			[Flag.Capture]: PrimaryFilter.WhitePawnCapture
		},
		[Color.Black]: {
			[Flag.None]: PrimaryFilter.BlackPawn,
			[Flag.First_Pawn]: PrimaryFilter.BlackPawnFirst,
			[Flag.Capture]: PrimaryFilter.BlackPawnCapture

		}
	},
	[PieceTypes.Knight]: {
		[Color.None]: {
			[Flag.None]: PrimaryFilter.Knight
		}
	},
	[PieceTypes.Bishop]: {
		[Color.None]: {
			[Flag.None]: PrimaryFilter.Diagonal
		}
	},
	[PieceTypes.Rook]: {
		[Color.None]: {
			[Flag.None]: PrimaryFilter.Row
		}
	},
	[PieceTypes.Queen]: {
		[Color.None]: {
			[Flag.None]: PrimaryFilter.Row || PrimaryFilter.Diagonal
		}
	},
	[PieceTypes.King]: {
		[Color.None]: {
			[Flag.None]: PrimaryFilter.King
		}
	}
}

const move = (piece, index, flags = [Flag.None]) => {
	const piece_pattern = Patterns[piece.type]
	const color_pattern = piece_pattern.hasOwnProperty(piece.color) ? piece_pattern[piece.color] : piece_pattern[Color.None]
	const flags_patterns = flags.map(flag => color_pattern.hasOwnProperty(flag) ? color_pattern[flag] : color_pattern[Flag.None])
	return flags_patterns.some(pattern => pattern(piece.index, index))
}

class Piece {
	index = 0
	type = PieceTypes.No_Piece
	color = Color.White
	flags = []

	constructor(color, type, index) {
		this.type = type
		this.index = index
		this.color = color
	}
}

module.exports = {
	Piece,
	Color,
	PieceTypes,
	Flag,
	move,
}