import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'How it Works', href: '/how-it-works' },
        { name: 'Report Issue', href: '/report' },
        { name: 'Browse Issues', href: '/issues' },
        { name: 'Emergency Reporting', href: '/emergency' },
      ],
    },
    {
      title: 'Community',
      links: [
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Stewards', href: '/stewards' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Community Guidelines', href: '/guidelines' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="text-white" style={{ background: 'linear-gradient(135deg, #1A2A80 0%, #3B38A0 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#3B38A0] font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">CivicConnect</span>
            </div>
            <p className="text-white/80 mb-6">
              Empowering communities through civic engagement. Report issues, track progress, and make your voice heard.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#B2B0E8]" />
                <span>support@civicconnect.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#B2B0E8]" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#B2B0E8]" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media and Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-white/80">Follow us:</span>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-white/70">
              <span>© {currentYear} CivicConnect. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-white transition-colors duration-200 hover:underline">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors duration-200 hover:underline">
                  Terms
                </Link>
                <Link href="/cookies" className="hover:text-white transition-colors duration-200 hover:underline">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-white">Get the App</h3>
            <p className="text-white/80 mb-6">
              Download our mobile app to report issues on the go and stay connected with your community.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="#"
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 shadow-lg"
              >
                <div className="text-left">
                  <div className="text-xs text-white/80">Download on the</div>
                  <div className="text-sm font-semibold text-white">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 shadow-lg"
              >
                <div className="text-left">
                  <div className="text-xs text-white/80">Get it on</div>
                  <div className="text-sm font-semibold text-white">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
