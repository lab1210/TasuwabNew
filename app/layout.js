import { AuthProvider } from "@/Services/authService";
import "./globals.css";

export const metadata = {
  title: "Tasuwab Micro Lending",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo2.png" sizes="any" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
