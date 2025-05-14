# ♞ Knight's Tour Game

A fun browser-based game that visualizes the classic **Knight's Tour** problem from chess. Built using **FastAPI** for the backend and **HTML/CSS/JS** for the frontend.

## Gameplay

Move a knight across the entire chessboard such that it visits every square **exactly once**.

Try to complete the tour without getting stuck!

## Tech Stack

- **FastAPI** – Python backend
- **HTML/CSS/JavaScript** – Frontend game logic
- **Uvicorn** – ASGI server

## Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload
