import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Feeding Brennen',
  description: 'Track restaurants, visits, and spending.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-2xl px-5 py-4">
            <h1 className="text-lg font-semibold tracking-tight">Feeding Brennen</h1>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
