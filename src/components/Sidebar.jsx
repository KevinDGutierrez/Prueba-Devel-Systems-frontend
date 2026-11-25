import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  BarChart3, 
  ChevronLeft, 
  Layers,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/encuestas',
      label: 'Encuestas',
      icon: FileText
    },
    ...(isAdmin ? [{
      to: '/encuestas/nueva',
      label: 'Nueva encuesta',
      icon: Plus
    }] : []),
    {
      to: '/resultados',
      label: 'Resultados',
      icon: BarChart3
    },
    ...(isAdmin ? [{
      to: '/usuarios',
      label: 'Usuarios y roles',
      icon: Users
    }] : [])
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-label="Cerrar navegación"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white/85 backdrop-blur-md border-r border-slate-200/80 transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-16' : 'w-56'}`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 shadow-xs transition-colors cursor-pointer"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <ChevronLeft size={13} className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Layers size={16} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-slate-900 tracking-tight leading-none">
                ACME
              </span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                Plataforma Web
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            ACME • 2026
          </div>
        )}
      </aside>
    </>
  );
}
