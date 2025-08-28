import { Inter } from 'next/font/google';
import './globals.css';
import ClientHeader from '../components/layout/ClientHeader';
import Footer from '../components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Naagrik - Building Better Communities',
  description: 'A platform for civic engagement and community issue resolution',
  keywords: 'civic engagement, community, issues, reporting, local government',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <ClientHeader />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
