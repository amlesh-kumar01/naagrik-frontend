import { Inter } from 'next/font/google';
import './globals.css';
import ClientHeader from '../components/layout/ClientHeader';
import Footer from '../components/layout/Footer';
import AuthInitializer from '../components/auth/AuthInitializer';
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
      <body className={inter.className} style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: '100vh'
      }}>
        <AuthInitializer />
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
