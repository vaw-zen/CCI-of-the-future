import { DM_Sans, Roboto_Condensed } from 'next/font/google';
import "./globals.css";
import Header from '@/layout/header/header';
import Footer from '@/layout/footer/footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const roboto = Roboto_Condensed({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400']
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.className}>
      <body>
        <Header roboto={roboto} />
        {children}
        <Footer />
      </body>
    </html>
  );
}