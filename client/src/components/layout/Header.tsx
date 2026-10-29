import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { NAV_ITEMS, SOLUTIONS_MEGA_MENU } from '@/constants';
import { cn } from '@/lib/utils';

// ── Mega‑menu for "Solutions" ─────────────────────────────────────────────────
const SolutionsMegaMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[700px] bg-white rounded-2xl shadow-xl border border-border z-50 p-6"
    role="menu"
  >
    <div className="grid grid-cols-2 gap-6">
      {/* Left column – categories */}
      <div className="flex flex-col gap-1">
        {(['Capabilities', 'Features', 'Integration', 'Document Types'] as const).map((cat) => (
          <a
            key={cat}
            href="#"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-primary font-medium
                       hover:bg-surface transition-colors group"
            role="menuitem"
          >
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">✓</span>
            {cat}
          </a>
        ))}
      </div>
      {/* Right column – links for Capabilities */}
      <div className="border-l border-border pl-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Data Processing</p>
        {SOLUTIONS_MEGA_MENU.capabilities.map((item) => (
          <a
            key={item}
            href="#"
            onClick={onClose}
            className="block py-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
            role="menuitem"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  </motion.div>
);

// ── Simple dropdown for other nav items ──────────────────────────────────────
const DropdownMenu: React.FC<{ items: { label: string; href: string }[]; onClose: () => void }> = ({
  items,
  onClose,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15 }}
    className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-border z-50 py-2"
    role="menu"
  >
    {items.map((item) => (
      <a
        key={item.label}
        href={item.href}
        onClick={onClose}
        className="block px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-surface transition-colors"
        role="menuitem"
      >
        {item.label}
      </a>
    ))}
  </motion.div>
);

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
const MobileDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  // Trap scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            aria-hidden
          />
          {/* Drawer */}
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <span className="font-bold text-primary text-lg">KlearStack</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-text-primary font-medium hover:bg-surface transition-colors"
                        aria-expanded={expanded === item.label}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn('w-4 h-4 transition-transform duration-200', expanded === item.label && 'rotate-180')}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === item.label && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-surface/50"
                          >
                            {item.children.map((child) => (
                              <a
                                key={child.label}
                                href={child.href}
                                onClick={onClose}
                                className="block px-8 py-3 text-sm text-text-secondary hover:text-primary transition-colors"
                              >
                                {child.label}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="block px-5 py-3.5 text-text-primary font-medium hover:bg-surface transition-colors"
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-border flex flex-col gap-3">
              <a href="#" className="btn-outline w-full justify-center text-center">Try it for Free</a>
              <a href="#lead-form" onClick={onClose} className="btn-primary w-full justify-center text-center">
                Get Free Demo <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Main Header ───────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sticky shadow on scroll + close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setActiveMenu(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = useCallback((label: string) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const handleKeyboardToggle = useCallback((label: string) => {
    setActiveMenu((prev) => (prev === label ? null : label));
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-30 bg-white transition-shadow duration-200',
          scrolled ? 'shadow-md' : 'border-b border-border/50',
        )}
        role="banner"
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="KlearStack home">
              <span className="text-2xl font-black">
                <span className="text-accent">✦</span>
                <span className="text-primary">Klear</span>
                <span className="text-text-primary">Stack</span>
              </span>
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.children ? (
                    <button
                      onClick={() => handleKeyboardToggle(item.label)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleKeyboardToggle(item.label); }}
                      aria-expanded={activeMenu === item.label}
                      aria-haspopup="true"
                      className={cn(
                        'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeMenu === item.label
                          ? 'text-primary bg-surface'
                          : 'text-text-secondary hover:text-primary hover:bg-surface/70',
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn('w-3.5 h-3.5 transition-transform duration-200', activeMenu === item.label && 'rotate-180')}
                      />
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="px-3.5 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface/70 transition-colors"
                    >
                      {item.label}
                    </a>
                  )}

                  <AnimatePresence>
                    {activeMenu === item.label && item.children && (
                      item.label === 'Solutions' ? (
                        <SolutionsMegaMenu onClose={() => setActiveMenu(null)} />
                      ) : (
                        <DropdownMenu items={item.children} onClose={() => setActiveMenu(null)} />
                      )
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <a href="#" className="btn-outline text-sm px-5 py-2.5">
                Try it for Free <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#lead-form" className="btn-primary text-sm px-5 py-2.5">
                Get Free Demo <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-6 h-6 text-text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;
