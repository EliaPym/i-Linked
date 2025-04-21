import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "i-Linked | URL Shortener",
  description: "Shorten your URLs with i-Linked",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased spin_gradient`}
      >
        <div>{children}</div>
      </body>
      <footer className="w-full">
        <div className="flex justify-center mb-4">
          Contact:{" "}
          <a href="mailto:support@i-Linked.org" className="ml-2 underline">
            support@i-Linked.org
          </a>
        </div>
      </footer>
    </html>
  );
}
