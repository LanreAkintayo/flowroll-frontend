import type { Metadata } from "next";
import { Roboto, Roboto_Mono, Raleway, Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flowroll",
  description:
    "DeFi payroll protocol on Initia. Employer-deposited funds earn yield between deposit and payday — so payroll becomes self-funding.",
  icons: {
    icon: "/ui_foc_logo.png",
    apple: "/ui_foc_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable} ${raleway.variable} ${montserrat.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              className: "font-sans text-base md:text-lg",
              style: {
                borderRadius: "1rem",
                padding: "16px",
              },
              descriptionClassName: "text-slate-500",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}