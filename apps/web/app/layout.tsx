import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "Kyvio",
    template: "%s | Kyvio",
  },
  description:
    "Plataforma gamificada de aprendizagem — quizzes ao vivo para salas de aula brasileiras.",
  openGraph: {
    title: "Kyvio",
    description:
      "Plataforma gamificada de aprendizagem — quizzes ao vivo para salas de aula brasileiras.",
    siteName: "Kyvio",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyvio",
    description:
      "Plataforma gamificada de aprendizagem — quizzes ao vivo para salas de aula brasileiras.",
  },
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
