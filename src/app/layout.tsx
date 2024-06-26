import "~/styles/globals.scss";

import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Beatbuster",
  description: "Beatbuster!!!!",
  icons: [{ rel: "icon", url: "/../assets/favicon.png" }],
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
        </head>
        <body className={inter.className}>
          <Toaster />
          <div className="logo-container container">
            <div className="logo">
              <a href="/game">
                <img src="/../assets/logo-beatbuster.png"/>
              </a>              
            </div>
          </div>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          {/* <Footer></Footer> */}
        </body>
      </html>
    </ClerkProvider>
  )
}