import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { long_url } = await request.json();
    
    console.log("Proxying request to shorten URL:", long_url);
    
    const response = await fetch("https://api.y-l.ink/Shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ long_url }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return NextResponse.json(
        { error: `Error shortening URL: Status ${response.status}` },
        { status: response.status }
      );
    }
    
    const apiResponse = await response.json();
    console.log("API response data:", apiResponse);
    
    // Check for the new response format
    if (apiResponse && apiResponse["Shortened URL"]) {
      // Return with consistent field name for the frontend
      return NextResponse.json({ 
        short_url: apiResponse["Shortened URL"]
      });
    }
    
    // Handle the possibility of the old nested format (for backward compatibility)
    if (apiResponse && apiResponse.body) {
      try {
        const bodyData = JSON.parse(apiResponse.body);
        if (bodyData.short_url) {
          return NextResponse.json({ 
            short_url: bodyData.short_url 
          });
        } else if (bodyData["Shortened URL"]) {
          return NextResponse.json({ 
            short_url: bodyData["Shortened URL"] 
          });
        }
      } catch (parseError) {
        console.error("Error parsing body:", parseError);
      }
    }
    
    // If we can't find the shortened URL in any format
    return NextResponse.json(
      { error: "Couldn't find shortened URL in API response" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in proxy API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}