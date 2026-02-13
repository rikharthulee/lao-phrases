import "./globals.css";

export const metadata = {
  title: "Lao Phrases",
  description: "Offline Lao phrasebook with optional voice playback",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Lao Phrases",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icon-192.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
