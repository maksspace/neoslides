import type { Metadata } from "next";
import { DemoGuide } from "@/components/tour/demo-guide";
import { TourProvider } from "@/components/tour/tour-provider";
import { look } from "@/lib/look";
import { product } from "@/lib/story";
import { themeBootScript } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: `${product.name} · prototype`,
  description: product.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={product.lang} data-theme={look.theme} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(look.theme) }} />
      </head>
      <body className="min-h-full">
        <TourProvider>
          {children}
          <DemoGuide />
        </TourProvider>
      </body>
    </html>
  );
}
