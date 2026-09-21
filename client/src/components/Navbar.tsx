import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Menu, X, ShieldAlert, LogOut, ShieldCheck, Car, Search, Shield, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser, activePersona } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Persona-specific navigation links
  let navLinks: { label: string; href: string }[] = [];
  if (activePersona === 'driver') {
    navLinks = [
      { label: 'Post a Ride', href: '/post' },
      { label: 'Driver Dashboard', href: '/dashboard' },
      { label: 'Safety & SOS', href: '/safety' },
      { label: 'Campus Corridors', href: '/colleges' },
    ];
  } else if (activePersona === 'admin') {
    navLinks = [
      { label: 'Operations Overview', href: '/admin' },
      { label: 'Fare & Pricing', href: '/admin' },
      { label: 'Campus Institutions', href: '/colleges' },
    ];
  } else {
    // passenger persona
    navLinks = [
      { label: 'Find a Ride', href: '/search' },
      { label: 'My Bookings', href: '/dashboard' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Safety & SOS', href: '/safety' },
    ];
  }

  const handlePersonaSelect = async (persona: 'aditya' | 'rahul' | 'priya' | 'admin') => {
    await switchDemoUser(persona);
    if (persona === 'aditya') {
      navigate('/post');
    } else if (persona === 'admin') {
      navigate('/admin');
    } else {
      navigate('/search');
    }
  };

  return (
    <>
      {/* Top Telemetry & Persona Switcher Bar */}
      <div className="bg-[#101F1A] text-[#D4DED9] text-[11px] font-mono py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-[#1D352D] z-50 relative">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3E8F6C] animate-pulse" />
          <span className="text-[#8A938E]">ROLE MODE:</span>
          {activePersona === 'driver' && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/60 uppercase tracking-wider text-[10px]">
              🚗 Driver (Offer Seats Only)
            </span>
          )}
          {activePersona === 'passenger' && (
            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-700/60 uppercase tracking-wider text-[10px]">
              🎒 Passenger (Search & Book Only)
            </span>
          )}
          {activePersona === 'admin' && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-700/60 uppercase tracking-wider text-[10px]">
              🏛️ Admin (Operations & Pricing)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#8A938E] text-[10px] uppercase hidden sm:inline mr-1">Switch Persona:</span>
          <button
            onClick={() => handlePersonaSelect('aditya')}
            title="Switch to Aditya (Driver) - Opens Post a Ride"
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activePersona === 'driver'
                ? 'bg-[#143D32] text-white font-bold ring-1 ring-[#3E8F6C] shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🚗 Aditya (Driver)
          </button>
          <button
            onClick={() => handlePersonaSelect('rahul')}
            title="Switch to Rahul (Passenger) - Opens Search Rides"
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activePersona === 'passenger' && !user?.gender?.includes('female')
                ? 'bg-[#143D32] text-white font-bold ring-1 ring-[#3E8F6C] shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🎒 Rahul (Passenger)
          </button>
          <button
            onClick={() => handlePersonaSelect('priya')}
            title="Switch to Priya (Women-Only Passenger) - Opens Search Rides"
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activePersona === 'passenger' && user?.gender === 'female'
                ? 'bg-[#143D32] text-white font-bold ring-1 ring-[#3E8F6C] shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🛡️ Priya (Women-Only)
          </button>
          <button
            onClick={() => handlePersonaSelect('admin')}
            title="Switch to Campus Admin - Opens Admin Dashboard"
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
              activePersona === 'admin'
                ? 'bg-[#143D32] text-white font-bold ring-1 ring-[#3E8F6C] shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🏛️ Campus Admin
          </button>
        </div>
      </div>

      {/* Main Responsive Header */}
      <motion.header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FFFDFC]/95 backdrop-blur-md border-b border-[#EAE7DF] py-3 shadow-subtle'
            : 'bg-[#F7F5F0] py-4 border-b border-[#EAE7DF]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo with Deep Campus Green dot */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#143D32] ring-4 ring-[#143D32]/20 group-hover:scale-125 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-[#18201D] font-sans">
              CampusRide
            </span>
            {activePersona === 'driver' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                DRIVER
              </span>
            )}
            {activePersona === 'passenger' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                PASSENGER
              </span>
            )}
            {activePersona === 'admin' && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                ADMIN
              </span>
            )}
          </Link>

          {/* Desktop Nav Links (Persona Filtered) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5F6964]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hover:text-[#18201D] transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {activePersona === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>Operations Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right Action Cluster (Persona Specific) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
                  title="View Dashboard"
                >
                  <img
                    src={user.avatarURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#DDD9CE]"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#18201D] leading-none">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#5F6964] leading-tight flex items-center gap-1">
                      {user.verificationStatus === 'verified' ? (
                        <span className="text-[#3E8F6C] font-medium flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5 inline" /> Verified
                        </span>
                      ) : (
                        <span className="text-[#B8892E] font-medium">Pending ID</span>
                      )}
                    </span>
                  </div>
                </Link>

                {/* Persona-specific primary button */}
                {activePersona === 'driver' && (
                  <Link
                    to="/post"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#143D32] hover:bg-[#0f2e26] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Post a Ride</span>
                  </Link>
                )}

                {activePersona === 'passenger' && (
                  <Link
                    to="/search"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#143D32] hover:bg-[#0f2e26] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find a Ride</span>
                  </Link>
                )}

                {activePersona === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-1.5 text-[#5F6964] hover:text-[#18201D] transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3 py-1.5 text-xs font-semibold text-[#18201D] hover:text-[#143D32] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#143D32] hover:bg-[#103229] text-white text-xs font-semibold shadow-subtle transition-all hover:-translate-y-0.5"
                >
                  <span>Find a ride</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#18201D] rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#FFFDFC] border-b border-[#EAE7DF] px-6 py-6 shadow-dropdown overflow-hidden"
            >
              <div className="flex flex-col gap-4 text-base font-semibold text-[#18201D]">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="hover:text-[#143D32] transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}

                {activePersona === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-emerald-800 py-1 font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    Security & Operations Dashboard
                  </Link>
                )}

                {user ? (
                  <div className="pt-4 border-t border-[#EAE7DF] flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium text-[#5F6964] hover:text-[#18201D]"
                    >
                      Dashboard ({user.name})
                    </Link>
                    {activePersona === 'driver' && (
                      <Link
                        to="/post"
                        className="w-full py-2.5 text-center text-sm font-semibold bg-[#143D32] text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <Car className="w-4 h-4" />
                        <span>Post a Ride</span>
                      </Link>
                    )}
                    {activePersona === 'passenger' && (
                      <Link
                        to="/search"
                        className="w-full py-2.5 text-center text-sm font-semibold bg-[#143D32] text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>Find a Ride</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="text-sm font-medium text-left text-[#B8473D] hover:underline pt-2"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-[#EAE7DF] flex flex-col gap-2">
                    <Link
                      to="/auth"
                      className="w-full py-2.5 text-center text-sm font-semibold border border-[#DDD9CE] rounded-lg text-[#18201D]"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/search"
                      className="w-full py-2.5 text-center text-sm font-semibold bg-[#143D32] text-white rounded-lg"
                    >
                      Find a ride
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};
