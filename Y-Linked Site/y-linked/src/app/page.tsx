"use client";

import GenerateShortURL from "./components/generateShortURL";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-center">Welcome to Y-Linked!
      <hr className="w-full my-2 border-t-2 border-gray-300" />
      </h1>
      <p className="mt-4 text-lg text-center">
        Shorten your links and share them with ease.<br/>No sign up required!
      </p>
      <GenerateShortURL className="mt-16"/>
    </div>
  );
}