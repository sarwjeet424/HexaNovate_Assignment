import React, { useState } from 'react';
import { Camera, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { FOOTER_LINK_GROUPS } from '@/constants';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#dde8f8] pt-16 pb-6" role="contentinfo">
      <div className="section-container">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row gap-12 pb-10 border-b border-blue-200">
          {/* Brand */}
          <div className="lg:w-64 flex-shrink-0">
            <a href="/" className="flex items-center gap-2 mb-4" aria-label="KlearStack home">
              <span className="text-2xl font-black">
                <span className="text-accent">✦</span>
                <span className="text-primary">Klear</span>
                <span className="text-text-primary">Stack</span>
              </span>
            </a>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              Shift supply chain and loan compliance from bottleneck to AI-enabled confidence and operational excellence.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Camera, label: 'Instagram', href: '#' },
                { Icon: Mail, label: 'Email', href: 'mailto:sales@klearstack.com' },
                { Icon: MessageCircle, label: 'WhatsApp', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white
                             hover:bg-primary-dark hover:scale-110 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Quick links column */}
            <div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'How it works?', href: '#' },
                  { label: 'Check All Document Types', href: '#' },
                  { label: 'Pricing', href: '#' },
                  { label: 'Integrations', href: '#' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    {label}
                    <span className="text-accent font-bold">|</span>
                  </a>
                ))}
                <div className="mt-4">
                  <p className="text-xs font-bold text-text-primary mb-2 uppercase tracking-wider">Solutions</p>
                  <div className="w-8 h-0.5 bg-accent mb-3" />
                  {['Accounts Payable', 'Supply Chain', 'Consumer Loans', 'ID Card'].map((l) => (
                    <a key={l} href="#" className="block text-sm text-text-secondary hover:text-primary transition-colors mb-1.5">
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic link groups */}
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-bold text-text-primary mb-2 uppercase tracking-wider">{group.title}</p>
                <div className="w-8 h-0.5 bg-accent mb-3" />
                <div className="flex flex-col gap-1.5">
                  {group.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className={`text-sm hover:text-primary transition-colors ${
                        link === 'BFSI'
                          ? 'inline-flex bg-primary text-white px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit'
                          : 'text-text-secondary'
                      }`}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-blue-200">
          <p className="text-base font-semibold text-text-primary whitespace-nowrap">
            Our Newsletter on Latest Trends
          </p>
          {subscribed ? (
            <p className="text-sm text-green-600 font-medium">✓ Subscribed! Thank you.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your E-mail address"
                  className="input-field rounded-full"
                  aria-label="Email for newsletter"
                />
                {emailError && <p className="text-xs text-red-500 mt-1 pl-4">{emailError}</p>}
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap text-sm">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Contact & addresses */}
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-blue-200">
          {[
            {
              country: 'India',
              company: 'KlearStack AI',
              address: 'City Tower, Sixth Floor, 17, Boat Club Road, Pune, India',
              phone: '+91 94220 84589',
              email: 'sales@klearstack.com',
            },
            {
              country: 'USA',
              company: 'KlearStack AI, Inc.',
              address: '371 Hoes Lane, Suite 200, Piscataway, NJ 08854, USA',
              phone: '+1 (973) 791-8875',
              email: 'sales@klearstack.com',
            },
          ].map(({ country, company, address, phone, email: contactEmail }) => (
            <div key={country} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">{country}</span>
                <span className="text-text-muted">|</span>
                <span className="text-text-secondary text-sm">{company}</span>
              </div>
              <p className="text-sm text-text-secondary">{address}</p>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors">
                  <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">📞</span>
                  {phone}
                </a>
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                  <span className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-xs">✉</span>
                  {contactEmail}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-text-secondary">
          <div className="flex flex-wrap items-center gap-4">
            {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'DPA'].map((link, i, arr) => (
              <React.Fragment key={link}>
                <a href="#" className="hover:text-primary transition-colors text-primary">
                  {link}
                </a>
                {i < arr.length - 1 && <span className="text-border">|</span>}
              </React.Fragment>
            ))}
          </div>
          <p>© KlearStack {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
