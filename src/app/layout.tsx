import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pomotune - Minimalist Pomodoro Timer",
  description:
    "A distraction-free Pomodoro timer with ambient music and customizable backgrounds",
  keywords: "pomodoro, timer, productivity, focus, ambient music",
  authors: [{ name: "Pomotune" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root" className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
