from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.game_logic import get_legal_moves
from typing import List

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Game state (ideally you'd use sessions or a DB for users)
board = [[-1 for _ in range(8)] for _ in range(8)]
knight_pos = None
move_count = 0

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/manifest.json")
async def manifest():
    return FileResponse("app/manifest.json", media_type="application/json")

@app.get("/sw.js")
async def service_worker():
    return FileResponse("app/sw.js", media_type="application/javascript")

@app.post("/start")
def start_game(x: int, y: int):
    global board, knight_pos, move_count
    board = [[-1 for _ in range(8)] for _ in range(8)]
    knight_pos = (x, y)
    move_count = 0
    board[y][x] = move_count
    legal_moves = get_legal_moves(x, y, board)
    return {"board": board, "knight_pos": knight_pos, "legal_moves": legal_moves}

@app.post("/move")
def move(x: int, y: int):
    global board, knight_pos, move_count
    if board[y][x] != -1:
        return JSONResponse({"error": "Invalid move"}, status_code=400)
    move_count += 1
    board[y][x] = move_count
    knight_pos = (x, y)
    legal_moves = get_legal_moves(x, y, board)
    return {"board": board, "knight_pos": knight_pos, "legal_moves": legal_moves}
