BOARD_SIZE = 8

KNIGHT_MOVES = [
    (2, 1), (1, 2), (-1, 2), (-2, 1),
    (-2, -1), (-1, -2), (1, -2), (2, -1)
]

def is_valid(x, y, board):
    return 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and board[y][x] == -1

def get_legal_moves(x, y, board):
    moves = []
    for dx, dy in KNIGHT_MOVES:
        nx, ny = x + dx, y + dy
        if is_valid(nx, ny, board):
            moves.append((nx, ny))
    return moves
