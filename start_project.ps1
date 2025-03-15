# Open the frontend terminal
Start-Process -NoNewWindow -PassThru powershell -ArgumentList "cd frontend; yarn start"

# Open the backend terminal in a new split window
Start-Process -NoNewWindow -PassThru powershell -ArgumentList "cd backend && venv\Scripts\activate && uvicorn main:app --reload"
