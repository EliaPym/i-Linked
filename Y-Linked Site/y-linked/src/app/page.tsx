"use client";

import GenerateShortURL from "./components/generateShortURL";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold text-center">
          Welcome to i-Linked!
          <hr className="w-full my-2 border-t-2 border-gray-300" />
        </h1>
        <p className="mt-4 text-lg text-center">
          The quick and easy URL Shortener
          <br />
          No sign up required!
        </p>
        <GenerateShortURL className="mt-16" />
      </div>
    </ThemeProvider>
  );
}
