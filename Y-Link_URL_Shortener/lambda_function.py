from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from mangum import Mangum

app = FastAPI()

class URLRequest(BaseModel):
    long_url: str = lambda s : s.replace("\'", "\"")

@app.get("/")
def read_root():
    return {"message": "Welcome to the URL shortener!"}

@app.get("/{short_url}")
def redirect_to_long_url(short_url: str):
    # Implement the logic to retrieve and redirect to the long URL corresponding to the short URL
    # For simplicity, we will return a placeholder message here.
    return {"message": f"Redirecting to the long URL for '{short_url}'."}

@app.post("/Shorten")
async def shorten_url(request: URLRequest):
    URLRequest.long_url = request.long_url.replace("'", "\"")
    # Placeholder for URL shortening logic
    short_url = f"http://short.url/{URLRequest.long_url[-6:]}"  # Simulate a shortened URL
    return JSONResponse({"short_url": short_url})

handler = Mangum(app)