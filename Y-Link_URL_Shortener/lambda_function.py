from io import BytesIO
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

url_regex = "^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})"

class shortenURLRequest(BaseModel):
    long_url: str
    custom_url: str | None = None
    
class qrURLRequest(BaseModel):
    long_url: str
    params: dict = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the URL shortener!"}

@app.options("/{short_code}")
def options_handler(short_code: str):
    return JSONResponse(
        content={},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://i-l.ink",
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
                "Access-Control-Allow-Origin": "https://i-l.ink",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
    )

@app.options("/Shorten")
def options_handler(request: shortenURLRequest):
    return JSONResponse(
        content={},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://i-linked.org",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )

@app.post("/Shorten")
async def shorten_url(request: shortenURLRequest):
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
            short_url = f"https://i-l.ink/{short_code}"
            return JSONResponse(
                content={"short_url": short_url},
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": "https://i-linked.org",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error {str(e)}")
    
    short_code = None
    
    # Generate corresponding short code for long URL
    if request.custom_url is not None and request.custom_url != "":
        short_code = request.custom_url
    else: 
        short_code = str(uuid.uuid4())[:6]
    
    # Store short code and long URL in the database
    table.put_item(Item={"ShortURL": short_code, "LongURL": long_url})
    
    # return new shortened URL
    short_url = f"https://i-l.ink/{short_code}"
    return JSONResponse(
            content={"short_url": short_url},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "https://i-linked.org",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
    )

"""
@app.post("/qr-generator")
async def qr_generator(request: qrURLRequest):
    long_url = request.long_url
    re_match = re.match(url_regex, long_url)
    
    # Validate URL format
    if not re_match:
        raise HTTPException(status_code=400, detail="Invalid URL format")
    
    # Generate QR code
    qr_image = qrcode.make(long_url)
    
    # Convert QR code image to base64 string
    buffered = BytesIO()
    qr_image.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return JSONResponse(
            content={"qr_code": f"data:image/png;base64,{qr_base64}"},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "https://y-linked.com",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
    )
"""

handler = Mangum(app)