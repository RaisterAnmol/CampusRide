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
    ];
  } else if (activePersona === 'admin') {
    navLinks = [
      { label: 'Operations Dashboard', href: '/admin' },
    ];
  } else {
    // passenger persona
    navLinks = [
      { label: 'Find a Ride', href: '/search' },
    ];
  }

  const isPriya = activePersona === 'passenger' && (user?.preferences?.womenOnlyDriver || user?.gender === 'female');
  const isRahul = activePersona === 'passenger' && !isPriya;
  const isAditya = activePersona === 'driver';
  const isAdmin = activePersona === 'admin';

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
      {/* Top Telemetry & Persona Switcher Bar - Modern Refined UI */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-sm z-50 relative">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isPriya ? 'bg-pink-400' : isRahul ? 'bg-sky-400' : isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isPriya ? 'bg-pink-500' : isRahul ? 'bg-sky-500' : isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
          </span>
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px]">Role Mode:</span>
          {isAditya && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white border border-emerald-400 shadow-sm ring-2 ring-emerald-500/30">
              <span>🚗</span>
              <span>DRIVER (POST RIDE ONLY)</span>
            </span>
          )}
          {isPriya && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-600 text-white border border-pink-400 shadow-sm ring-2 ring-pink-500/30">
              <span>🛡️</span>
              <span>WOMEN-ONLY (SEARCH & BOOK ONLY)</span>
            </span>
          )}
          {isRahul && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-600 text-white border border-sky-400 shadow-sm ring-2 ring-sky-500/30">
              <span>🎒</span>
              <span>PASSENGER (SEARCH & BOOK ONLY)</span>
            </span>
          )}
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white border border-amber-400 shadow-sm ring-2 ring-amber-500/30">
              <span>🏛️</span>
              <span>ADMIN (OPERATIONS DASHBOARD)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px] hidden sm:inline mr-1">Switch Persona:</span>
          <button
            onClick={() => handlePersonaSelect('aditya')}
            title="Switch to Aditya (Driver) - Only Post a Ride"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              isAditya
                ? 'bg-emerald-600 text-white font-semibold shadow-sm ring-1 ring-emerald-400 border border-emerald-500'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <span>🚗</span>
            <span>Aditya (Driver)</span>
          </button>
          <button
            onClick={() => handlePersonaSelect('rahul')}
            title="Switch to Rahul (Passenger) - Only Search Rides"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              isRahul
                ? 'bg-sky-600 text-white font-semibold shadow-sm ring-1 ring-sky-400 border border-sky-500'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <span>🎒</span>
            <span>Rahul (Passenger)</span>
          </button>
          <button
            onClick={() => handlePersonaSelect('priya')}
            title="Switch to Priya (Women-Only Passenger) - Only Search Rides"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              isPriya
                ? 'bg-pink-600 text-white font-semibold shadow-sm ring-1 ring-pink-400 border border-pink-500'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <span>🛡️</span>
            <span>Priya (Women-Only)</span>
          </button>
          <button
            onClick={() => handlePersonaSelect('admin')}
            title="Switch to Campus Admin - Opens Operations Dashboard"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-amber-600 text-white font-semibold shadow-sm ring-1 ring-amber-400 border border-amber-500'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/70'
            }`}
          >
            <span>🏛️</span>
            <span>Campus Admin</span>
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
          </nav>

          {/* Right Action Cluster (Persona Specific) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={activePersona === 'driver' ? '/post' : activePersona === 'admin' ? '/admin' : '/search'}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
                  title="View Profile"
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
                      to={activePersona === 'driver' ? '/post' : activePersona === 'admin' ? '/admin' : '/search'}
                      className="text-sm font-medium text-[#5F6964] hover:text-[#18201D]"
                    >
                      {user.name} ({activePersona.toUpperCase()})
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
                    {activePersona === 'admin' && (
                      <Link
                        to="/admin"
                        className="w-full py-2.5 text-center text-sm font-semibold bg-emerald-800 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Operations Dashboard</span>
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
