import "../styles/globals.css";
import localFont from "next/font/local";
import ReactQueryProvider from './ReactQueryProvider';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
import Header from "./layouts/header";
import Footer from "./layouts/footer";
import { Providers } from "@/components/providers";
import { useInitSession } from "@/components/shared/api/hooks/useCurrentUser";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Funny Movies",
  description: "Share and enjoy funny movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useInitSession()
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <ReactQueryProvider>
            <div className="App">
              <Header />
              <div className="container">
                {children}
                <Footer />
              </div>
              <ToastContainer
                autoClose={8000}
                draggable={false}
                position="top-center"
              />
              <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js"></Script>
              <Script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></Script>
              <Script
                src="https://kit.fontawesome.com/fbadad80a0.js"
                crossOrigin="anonymous"
              ></Script>
            </div>
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
