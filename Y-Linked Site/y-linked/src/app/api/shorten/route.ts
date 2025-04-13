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
    
    // Parse the stringified JSON body if it exists
    if (apiResponse && apiResponse.body) {
      try {
        // The body is a JSON string that needs to be parsed
        const bodyData = JSON.parse(apiResponse.body);
        
        // Return only the needed data from the parsed body
        return NextResponse.json({ 
          short_url: bodyData.short_url 
        });
      } catch (parseError) {
        console.error("Error parsing body:", parseError);
        return NextResponse.json(
          { error: "Failed to parse API response body" },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Invalid response format from API" },
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