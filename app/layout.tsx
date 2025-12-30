import "./globals.css";

export const metadata = {
  title: "Think Like NCLEX",
  description: "Study smarter. Think like the NCLEX.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
