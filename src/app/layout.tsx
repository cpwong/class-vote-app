import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Class Vote App",
  description: "Nominate the most helpful classmate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main style={{ flex: 1, padding: "2rem", display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
