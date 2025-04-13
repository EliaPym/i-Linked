from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from mangum import Mangum
import boto3
import uuid
import re

app = FastAPI()
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Y-Link_URL_Shortener_NoSQL")

class URLRequest(BaseModel):
    long_url: str = lambda s : s.replace("\'", "\"")

@app.get("/")
def read_root():
    return {"message": "Welcome to the URL shortener!"}

@app.options("/{short_code}")
def options_handler(short_code: str):
    return JSONResponse(
        content={},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://y-l.ink",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )


@app.get("/{short_code}")
def redirect_to_long_url(short_code: str):
    response = table.get_item(Key={"ShortURL": short_code})
    if "Item" not in response:
        raise HTTPException(status_code=404, detail="Short URL not found")
    
    return JSONResponse(
            content={"Original URL": response["Item"]["LongURL"]},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "https://y-l.ink",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
    )

@app.post("/Shorten")
async def shorten_url(request: URLRequest):
    url_regex = "^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$"
    long_url = request.long_url
    re_match = re.match(url_regex, long_url)
    
    # Validate URL format
    if not re_match:
        raise HTTPException(status_code=400, detail="Invalid URL format")
    
    # Check if URL exists in database
    try:
        response = table.scan(
            FilterExpression="LongURL = :url",
            ExpressionAttributeValues={":url": long_url}
        )
        if "Items" in response and response["Items"]:
            short_code = response["Items"][0]["ShortURL"]
            short_url = f"https://y-l.ink/{short_code}"
            return JSONResponse(
                content={"Shortened URL (new)": short_url},
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": "https://y-l.ink",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error {str(e)}")
    
    # Generate corresponding short code for long URL
    short_code = str(uuid.uuid4())[:6]
    
    # Store short code and long URL in the database
    table.put_item(Item={"ShortURL": short_code, "LongURL": long_url})
    
    # return new shortened URL
    short_url = f"https://y-l.ink/{short_code}"
    return JSONResponse(
            content={"Shortened URL (new)": short_url},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "https://y-l.ink",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
    )

handler = Mangum(app)