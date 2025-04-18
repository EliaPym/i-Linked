import { useState } from "react";

export default function GenerateShortURL({
  className,
}: {
  className?: string;
}) {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState<string>("");
  const [customAlias, setCustomAlias] = useState<string>("");
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const [isValidAlias, setIsValidAlias] = useState<boolean>(false);

  const aliasMinLength = 5;
  const aliasMaxLength = 20;

  const urlRegex =
    /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/;
  const aliasRegex = new RegExp(
    `^[a-zA-Z0-9_-]{${aliasMinLength},${aliasMaxLength}}$`
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setIsValidUrl(urlRegex.test(value));
  };

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAlias(value);
    setIsValidAlias(aliasRegex.test(value));
  };

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
      body: JSON.stringify({
        long_url: url,
        custom_url: formData.get("customAlias") || null,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        if (data && data.short_url) {
          setShortUrl(data.short_url);
        } else {
          setError(
            "Received success response but no shortened URL was returned"
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(`Error: ${error.message || "Failed to shorten URL"}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div
      className={`flex flex-col items-center justify-center w-full max-w-md p-4 align-middle ${
        className || ""
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <input
          type="text"
          name="url"
          placeholder="Enter your URL here..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          value={url}
          onChange={handleUrlChange}
          required
        />
        <div className="flex flex-row w-full h-fit my-5 items-center font-mono">
          <p className="whitespace-nowrap my-auto mr-0">https://y-l.ink/</p>
          <input
            type="text"
            name="customAlias"
            placeholder={`custom-alias`}
            className="w-full p-0.5 border-b border-gray-300 shadow-sm focus:outline-none"
            disabled={isLoading}
            value={customAlias}
            onChange={handleAliasChange}
          />
        </div>
        <button
          type="submit"
          className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate!"}
        </button>
      </form>

      {!isValidUrl && url && (
        <div className="text-red-500 mt-2">Invalid URL format</div>
      )}
      {!isValidAlias && customAlias && (
        <div className="text-red-500 mt-2">
          Invalid alias format ({aliasMinLength}-{aliasMaxLength} characters,
          letters, numbers, underscores, or dashes)
        </div>
      )}

      {/* Results and error handling */}
      {error && (
        <div className="mt-4 p-3 w-full bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {
        /*shortUrl &&*/ <div className="mt-4 p-3 w-full bg-green-300 border border-green-400 text-green-800 rounded">
          <p className="font-semibold">Your shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {shortUrl} https://y-l.ink/testURL
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shortUrl);
              alert("URL copied to clipboard!");
            }}
            className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
          >Copy</button>
        </div>
      }
    </div>
  );
}
