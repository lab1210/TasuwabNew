import { AuthProvider } from "@/Services/authService";
import "nprogress/nprogress.css";
import "./globals.css";
import RouteProgressBar from "./RouteProgressBar";
import { AccessDeniedProvider } from "./components/AccessDeniedContext";
import GlobalForbiddenHandler from "./components/GlobalForbiddenHandler";

// export const metadata = {
//   title: "Tasuwab Micro Lending",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Tasuwab Micro Lending</title>
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
      <body>
        <AuthProvider>
          <AccessDeniedProvider>
            <RouteProgressBar />
            <GlobalForbiddenHandler />
            {children}
          </AccessDeniedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
