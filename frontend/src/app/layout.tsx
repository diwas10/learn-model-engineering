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
