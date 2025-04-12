from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from mangum import Mangum
import boto3
import uuid

app = FastAPI()
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Y-Link_URL_Shortener_NoSQL")

class URLRequest(BaseModel):
    long_url: str = lambda s : s.replace("\'", "\"")

@app.get("/")
def read_root():
    return {"message": "Welcome to the URL shortener!"}

@app.get("/{short_code}")
def redirect_to_long_url(short_code: str):
    response = table.get_item(Key={"ShortURL": short_code})
    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Short URL not found")
    return {"LongURL": response["Item"]["LongURL"]}

@app.post("/Shorten")
async def shorten_url(request: URLRequest):
    short_url = f"http://short.url/{URLRequest.long_url[-6:]}"
    return JSONResponse({"ShortURL": short_url})

handler = Mangum(app)