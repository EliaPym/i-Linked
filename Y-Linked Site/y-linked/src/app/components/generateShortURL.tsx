import { useState } from 'react';

export default function GenerateShortURL({ className }: { className?: string }) {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setShortUrl(null);
    
    const formData = new FormData(event.currentTarget);
    const url = formData.get("url") as string;
    
    // Validate URL
    if (!url || !url.trim()) {
      setError("Please enter a URL");
      setIsLoading(false);
      return;
    }
    
    fetch("https://api.y-l.ink/Shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ long_url: url }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Success:", data);
        if (data && data.short_url) {
          setShortUrl(data.short_url);
        } else {
          setError("Received success response but no shortened URL was returned");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        setError(`Error: ${error.message || 'Failed to shorten URL'}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full max-w-md p-4 align-middle ${className || ''}`}>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <input
          type="text"
          name="url"
          placeholder="Enter your URL here..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate!'}
        </button>
      </form>

      {/* Results and error handling */}
      {error && (
        <div className="mt-4 p-3 w-full bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {shortUrl && (
        <div className="mt-4 p-3 w-full bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-semibold">Your shortened URL:</p>
          <a 
            href={shortUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {shortUrl}
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shortUrl);
              alert('URL copied to clipboard!');
            }}
            className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
