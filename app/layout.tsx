import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";
import { FilterProvider } from "./contexts/FilterContext";
import { ModalProvider } from "./contexts/ModalContext";
import { ToastProvider } from "./contexts/ToastContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { EditingProvider } from "./contexts/EditingContext";
import { QueryProvider } from "./providers/QueryProvider";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { ToastContainer } from "./components/ToastContainer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ClientLayout } from "./components/layout/ClientLayout";
import { EditFeedbackContainer } from "./components/EditFeedbackContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: "Koetori",
  description: "Voice memo app with AI categorization",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Koetori",
  },
  applicationName: "Koetori",
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ToastProvider>
            <UserProvider>
              <FilterProvider>
                <ModalProvider>
                  <EditingProvider>
                    <FeedbackProvider>
                      <ErrorBoundary>
                        <ClientLayout>{children}</ClientLayout>
                        <ToastContainer />
                        <EditFeedbackContainer />
                        <PWAInstallPrompt />
                        <OfflineIndicator />
                      </ErrorBoundary>
                    </FeedbackProvider>
                  </EditingProvider>
                </ModalProvider>
              </FilterProvider>
            </UserProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
