import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Model Engineering Mastery | Foundations to Multimodal Systems",
  description: "Interactive, research-grade learning laboratory for deep learning, Transformer architectures, model surgery, multimodal systems, and distributed inference.",
  icons: {
    icon: [
      { url: "/learn-model-engineering/icon.svg", type: "image/svg+xml" },
      { url: "/learn-model-engineering/favicon.ico", sizes: "any" },
      { url: "/learn-model-engineering/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/learn-model-engineering/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/learn-model-engineering/favicon.ico",
    other: [
      {
        rel: "mask-icon",
        url: "/learn-model-engineering/safari-pinned-tab.svg",
        color: "#00F0FF"
      }
    ]
  },
  manifest: "/learn-model-engineering/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased bg-slate-950 text-slate-100`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/learn-model-engineering/icon.svg" />
        <link rel="icon" type="image/x-icon" href="/learn-model-engineering/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/learn-model-engineering/apple-touch-icon.png" />
        <link rel="mask-icon" href="/learn-model-engineering/safari-pinned-tab.svg" color="#00F0FF" />
        <link rel="manifest" href="/learn-model-engineering/manifest.json" />
        <meta name="theme-color" content="#06B6D4" />
        <meta name="apple-mobile-web-app-title" content="AI Model Eng" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-400">AI Model Engineering Mastery Platform</span>
              <p className="text-[11px] mt-0.5 text-slate-500">
                28 Modules • 253 Lessons • 6 Capstone Projects • 6 Flagship Laboratories • PyTorch Execution Sandbox
              </p>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Execution Sandbox Ready
              </span>
              <span>Schema v1.0.0</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
