import { Inter } from "next/font/google";
import "./globals.css";
import Header_F from "@/components/Header_F";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Financify",
  description: "Financify - Your Personal Finance Tracker",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head />
        <body className={inter.className}>
          <Header_F />
          <div className="min-h-screen">{children}</div>
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Developed with ❤️ by <a href="https://www.github.com/zzayd30" target="_blank">_zzayd_</a></p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}