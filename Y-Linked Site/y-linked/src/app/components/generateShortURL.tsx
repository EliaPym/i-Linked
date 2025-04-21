import { Button, InputAdornment, TextField, Tooltip } from "@mui/material";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

export default function GenerateShortURL({
  className,
}: {
  className?: string;
}) {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopyClick = () => {
    navigator.clipboard.writeText(shortUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTooltipClose = () => {
    setCopied(false);
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

    fetch("https://api.i-l.ink/Shorten", {
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
        className="w-full flex flex-col items-center gap-y-8"
      >
        <TextField
          id="url"
          name="url"
          label="Enter a URL to shorten"
          placeholder="https://example.com"
          value={url}
          variant="outlined"
          fullWidth
          helperText={
            !isValidUrl &&
            url && (
              <div className="text-red-500 mt-2">
                Invalid URL format, must start with https:// or www.
              </div>
            )
          }
          onChange={handleUrlChange}
          error={!isValidUrl && url ? true : false}
          disabled={isLoading}
        />
        <TextField
          label="Custom URL Alias (optional)"
          id="custom_alias"
          name="customAlias"
          value={customAlias}
          placeholder="custom-alias"
          multiline
          fullWidth
          sx={{ fontFamily: "Monospace" }}
          onChange={handleAliasChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontFamily: "Monospace" }}>
                    https://i-L.ink/
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          disabled={isLoading}
          helperText={
            !isValidAlias &&
            customAlias &&
            `Invalid alias format (${aliasMinLength}-${aliasMaxLength} characters, letters, numbers, underscores, or dashes)`
          }
          variant="standard"
          error={!isValidAlias && customAlias ? true : false}
          inputProps={{ style: { fontFamily: "monospace" } }}
        />
        <Button
          variant="contained"
          disabled={
            isLoading ||
            !isValidUrl ||
            ((customAlias ? true : false) && !isValidAlias)
          }
          loading={isLoading}
          loadingPosition="end"
          endIcon={<PlayCircleOutlineIcon />}
          type="submit"
        >
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </form>

      {/* Results and error handling */}
      {error && (
        <div className="mt-4 p-3 w-full bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="mt-4 p-3 w-full bg-green-300 border border-green-400 text-green-800 rounded">
          <p className="font-semibold">Your shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {shortUrl}
          </a>
          <Tooltip
            title={copied ? "URL Copied!" : "Copy to clipboard"}
            arrow
            placement="top"
            onClose={handleTooltipClose}
          >
            <button
              onClick={handleCopyClick}
              className="mt-2 px-3 py-1 text-gray-800 rounded-md text-sm hover:text-blue-500"
            >
              <ContentCopyIcon fontSize="small" className="mr-1" />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
