import React, { useState, useEffect, useRef } from 'react';
import { Menu, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayName = user?.nombre_completo || 'Usuario';
  const email = user?.email || '';
  const rol = user?.rol || 'Usuarios';

  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-2.5 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          aria-label="Abrir navegación"
        >
          <Menu size={17} />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-slate-100/80 active:bg-slate-100 transition-colors cursor-pointer text-left focus:outline-none"
            aria-label="Perfil y sesión"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-medium text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
              {userInitials}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-medium text-slate-800 leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">
                {rol}
              </span>
            </div>

            <ChevronDown
              size={12}
              className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-lg py-1.5 z-50 animate-fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-medium text-xs flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {email}
                  </span>
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                    <ShieldCheck size={10} className="text-slate-700" />
                    {rol.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
