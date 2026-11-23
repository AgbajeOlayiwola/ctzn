import './globals.css';

export const metadata = {
  title: 'ctzn — Civic action, made local',
  description: 'Know who is in charge of your area, report problems, and track what changes.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B6B3A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
