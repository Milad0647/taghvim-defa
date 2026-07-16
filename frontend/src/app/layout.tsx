import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { AuthGate } from "@/components/auth/AuthGate";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SITE_TAGLINE, SITE_TITLE } from "@/lib/branding";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#050b18",
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_TITLE} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_TITLE,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg" }],
  },
};

const themeBootScript = `
(function(){
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme="dark"
      className={`${vazir.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--text-primary)]">
        <ThemeProvider>
          <AuthGate>{children}</AuthGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
