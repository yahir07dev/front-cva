"use client";

import { useState, JSX, useMemo, useEffect, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/src/context/ThemeContext";
import { createClient } from "@/src/lib/supabase/client";

import {
  Menu, ChevronLeft, ChevronRight, Sun, Moon, LogOut,
  BarChart3, LayoutDashboard, TrendingUp, Banknote, Users,
  UserRound, UserPen, Building2, MapPin, Loader2, Settings,
  HandCoins, Calculator, History, Newspaper, Timer, GraduationCap, X, ShieldAlert, LineChart
} from "lucide-react";

/* ──────────────────────────────────────────────────────── LOGO (REEMPLAZADO) */
const LogoEmpresa = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <Image 
      src="/icon2.png" 
      alt="Comercial V.A. Logo" 
      fill
      className="object-contain"
    />
  </div>
);

/* ──────────────────────────────────────────────────────── TYPES */
interface SubMenuItem { icon: JSX.Element; label: string; path: string; permission?: string | string[]; strict?: boolean; }
interface MenuItem {
  id: string; icon: JSX.Element; label: string; path?: string;
  hasSubmenu?: boolean; submenu?: SubMenuItem[];
  permission?: string | string[];
  strict?: boolean;
}

interface SidebarProps { 
  permissions: string[];
}

/* ──────────────────────────────────────────────────────── ACCENT TOKENS */
interface AccentSet {
  activePill:   { light: string; dark: string };
  activeIcon:   { light: string; dark: string };
  subActive:    { light: string; dark: string };
  subHover:     { light: string; dark: string };
  itemHover:    { light: string; dark: string };
}

const ACCENT: Record<string, AccentSet> = {
  dashboard: {
    activePill:  { light: "bg-neutral-200 text-neutral-900",        dark: "dark:bg-neutral-800 dark:text-neutral-100" },
    activeIcon:  { light: "text-neutral-900",                       dark: "dark:text-neutral-100" },
    subActive:   { light: "bg-neutral-200 text-neutral-900",        dark: "dark:bg-neutral-800 dark:text-neutral-100" },
    subHover:    { light: "hover:bg-neutral-100 hover:text-neutral-800", dark: "dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200" },
    itemHover:   { light: "hover:bg-neutral-100 hover:text-neutral-800", dark: "dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200" },
  },
  personal: {
    activePill:  { light: "bg-indigo-50 text-indigo-700",            dark: "dark:bg-indigo-500/20 dark:text-indigo-400" },
    activeIcon:  { light: "text-indigo-600",                          dark: "dark:text-indigo-400" },
    subActive:   { light: "bg-indigo-50 text-indigo-700",            dark: "dark:bg-indigo-500/20 dark:text-indigo-400" },
    subHover:    { light: "hover:bg-indigo-50 hover:text-indigo-700", dark: "dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400" },
    itemHover:   { light: "hover:bg-indigo-50/70 hover:text-indigo-700", dark: "dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400" },
  },
  documentos: {
    activePill:  { light: "bg-cyan-50 text-cyan-700",                dark: "dark:bg-cyan-500/20 dark:text-cyan-400" },
    activeIcon:  { light: "text-cyan-600",                            dark: "dark:text-cyan-400" },
    subActive:   { light: "bg-cyan-50 text-cyan-700",                dark: "dark:bg-cyan-500/20 dark:text-cyan-400" },
    subHover:    { light: "hover:bg-cyan-50 hover:text-cyan-700",    dark: "dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400" },
    itemHover:   { light: "hover:bg-cyan-50/70 hover:text-cyan-700", dark: "dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400" },
  },
  organizacion: {
    activePill:  { light: "bg-blue-50 text-blue-700",               dark: "dark:bg-blue-500/20 dark:text-blue-400" },
    activeIcon:  { light: "text-blue-600",                            dark: "dark:text-blue-400" },
    subActive:   { light: "bg-blue-50 text-blue-700",               dark: "dark:bg-blue-500/20 dark:text-blue-400" },
    subHover:    { light: "hover:bg-blue-50 hover:text-blue-700",   dark: "dark:hover:bg-blue-500/10 dark:hover:text-blue-400" },
    itemHover:   { light: "hover:bg-blue-50/70 hover:text-blue-700", dark: "dark:hover:bg-blue-500/10 dark:hover:text-blue-400" },
  },
  rendimiento: {
    activePill:  { light: "bg-amber-50 text-amber-700",             dark: "dark:bg-amber-500/20 dark:text-amber-400" },
    activeIcon:  { light: "text-amber-600",                          dark: "dark:text-amber-400" },
    subActive:   { light: "bg-amber-50 text-amber-700",             dark: "dark:bg-amber-500/20 dark:text-amber-400" },
    subHover:    { light: "hover:bg-amber-50 hover:text-amber-700", dark: "dark:hover:bg-amber-500/10 dark:hover:text-amber-400" },
    itemHover:   { light: "hover:bg-amber-50/70 hover:text-amber-700", dark: "dark:hover:bg-amber-500/10 dark:hover:text-amber-400" },
  },
  capacitacion: {
    activePill:  { light: "bg-rose-50 text-rose-700",               dark: "dark:bg-rose-500/20 dark:text-rose-400" },
    activeIcon:  { light: "text-rose-600",                            dark: "dark:text-rose-400" },
    subActive:   { light: "bg-rose-50 text-rose-700",               dark: "dark:bg-rose-500/20 dark:text-rose-400" },
    subHover:    { light: "hover:bg-rose-50 hover:text-rose-700",   dark: "dark:hover:bg-rose-500/10 dark:hover:text-rose-400" },
    itemHover:   { light: "hover:bg-rose-50/70 hover:text-rose-700", dark: "dark:hover:bg-rose-500/10 dark:hover:text-rose-400" },
  },
  nomina: {
    activePill:  { light: "bg-emerald-50 text-emerald-700",         dark: "dark:bg-emerald-500/20 dark:text-emerald-400" },
    activeIcon:  { light: "text-emerald-600",                         dark: "dark:text-emerald-400" },
    subActive:   { light: "bg-emerald-50 text-emerald-700",         dark: "dark:bg-emerald-500/20 dark:text-emerald-400" },
    subHover:    { light: "hover:bg-emerald-50 hover:text-emerald-700", dark: "dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400" },
    itemHover:   { light: "hover:bg-emerald-50/70 hover:text-emerald-700", dark: "dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400" },
  },
  notas: {
    activePill:  { light: "bg-sky-50 text-sky-700",             dark: "dark:bg-sky-500/20 dark:text-sky-400" },
    activeIcon:  { light: "text-sky-600",                           dark: "dark:text-sky-400" },
    subActive:   { light: "bg-sky-50 text-sky-700",             dark: "dark:bg-sky-500/20 dark:text-sky-400" },
    subHover:    { light: "hover:bg-sky-50 hover:text-sky-700",     dark: "dark:hover:bg-sky-500/10 dark:hover:text-sky-400" },
    itemHover:   { light: "hover:bg-sky-50/70 hover:text-sky-700",  dark: "dark:hover:bg-sky-500/10 dark:hover:text-sky-400" },
  },
  // 🚀 NUEVO MÓDULO: Asistencia (Color Fuchsia)
  asistencia: {
    activePill:  { light: "bg-fuchsia-50 text-fuchsia-700",         dark: "dark:bg-fuchsia-500/20 dark:text-fuchsia-400" },
    activeIcon:  { light: "text-fuchsia-600",                       dark: "dark:text-fuchsia-400" },
    subActive:   { light: "bg-fuchsia-50 text-fuchsia-700",         dark: "dark:bg-fuchsia-500/20 dark:text-fuchsia-400" },
    subHover:    { light: "hover:bg-fuchsia-50 hover:text-fuchsia-700", dark: "dark:hover:bg-fuchsia-500/10 dark:hover:text-fuchsia-400" },
    itemHover:   { light: "hover:bg-fuchsia-50/70 hover:text-fuchsia-700", dark: "dark:hover:bg-fuchsia-500/10 dark:hover:text-fuchsia-400" },
  },
};

const fallbackAccent = ACCENT.dashboard;

const SECTION_LABELS: Record<string, string> = {
  personal: "Gestión", rendimiento: "Análisis",
  capacitacion: "Formación", nomina: "Finanzas", asistencia: "Tiempo", notas: "Gestión",
};

/* ──────────────────────────────────────────────────────── COMPONENT */
export default function SidebarClient({ permissions = [] }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useTheme();
  
  // Mantenemos Supabase solo para el SignOut, ya no para consultar permisos.
  const supabase = createClient();

  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [openMenus, setOpenMenus]       = useState<string[]>([]);
  const [optimisticPath, setOptimisticPath] = useState<string>(pathname);
  const [isPending, startTransition]    = useTransition();

  useEffect(() => { setMobileOpen(false); setOptimisticPath(pathname); }, [pathname]);

  const allPaths = useMemo(() => [
    "/dashboard", "/dashboard/personal/empleados", "/dashboard/personal/roles",
    "/dashboard/documentos/empleados", "/dashboard/organizacion/areas",
    "/dashboard/rendimiento/actividades", "/dashboard/rendimiento/comentarios",
    "/dashboard/rendimiento/reportes", "/dashboard/capacitacion",
    "/dashboard/nomina/configuracion", "/dashboard/nomina/prestamos",
    "/dashboard/nomina/generar", "/dashboard/nomina/historial", 
    "/dashboard/asistencia/reportes", "/dashboard/asistencia/analitica", // 🚀 Actualizados paths de Asistencia
    "/dashboard/notas",
  ], []);

  useEffect(() => { allPaths.forEach(p => router.prefetch(p)); }, [allPaths, router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  const handleNavigate = useCallback((path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (path === optimisticPath) return;
    setOptimisticPath(path);
    startTransition(() => { router.push(path); });
  }, [optimisticPath, router]);

  const toggleSubmenu = (id: string) =>
    setOpenMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  /* ── menu data ── */
  const rawMenuItems: MenuItem[] = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
    {
      id: "personal", icon: <UserRound size={18} />, label: "Personal",
      hasSubmenu: true, permission: ["empleados.update", "roles.update", "acceso_total", "superadmin"],
      submenu: [
        { icon: <UserPen size={16} />, label: "Empleados", path: "/dashboard/personal/empleados", permission: ["empleados.update", "acceso_total"] },
        { icon: <ShieldAlert size={16} />, label: "Roles", path: "/dashboard/personal/roles", permission: "superadmin", strict: true }
      ],
    },
    { 
      id: "notas", icon: <History size={18} />, label: "Notas", path: "/dashboard/notas",
      permission: ["notas.read", "acceso_total"] 
    },
    {
      id: "documentos", icon: <Newspaper size={18} />, label: "Documentos",
      hasSubmenu: true, permission: ["documentos.update", "documentos.read", "acceso_total"],
      submenu: [{ icon: <UserPen size={16} />, label: "Empleados", path: "/dashboard/documentos/empleados", permission: ["empleados.update", "acceso_total"] }],
    },
    {
      id: "organizacion", icon: <Building2 size={18} />, label: "Organización",
      hasSubmenu: true, permission: ["acceso_total"],
      submenu: [{ icon: <MapPin size={16} />, label: "Áreas", path: "/dashboard/organizacion/areas", permission: ["acceso_total"] }],
    },
    {
      id: "rendimiento", icon: <TrendingUp size={18} />, label: "Rendimiento",
      hasSubmenu: true, permission: ["rendimiento.create","actividades.create","asignaciones.create","actividades.read","comentarios.read","reportes.read_all","acceso_total"],
      submenu: [
        { icon: <TrendingUp size={16} />, label: "Actividades", path: "/dashboard/rendimiento/actividades", permission: ["actividades.read","acceso_total"] },
        { icon: <Users size={16} />, label: "Feedback", path: "/dashboard/rendimiento/comentarios", permission: ["comentarios.read","acceso_total"] },
        { icon: <BarChart3 size={16} />, label: "Reportes", path: "/dashboard/rendimiento/reportes", permission: ["reportes.read_all","acceso_total","actividades.read"] },
      ],
    },
    { id: "capacitacion", icon: <GraduationCap size={18} />, label: "Capacitación", path: "/dashboard/capacitacion" },
    {
      id: "nomina", icon: <Banknote size={18} />, label: "Nómina",
      hasSubmenu: true, permission: ["nomina.read","nomina.create","nomina.update","prestamos.read","acceso_total"],
      submenu: [
        { icon: <Settings size={16} />, label: "Configuración", path: "/dashboard/nomina/configuracion", permission: ["nomina.update","acceso_total"] },
        { icon: <HandCoins size={16} />, label: "Préstamos", path: "/dashboard/nomina/prestamos", permission: ["prestamos.read","acceso_total"] },
        { icon: <Calculator size={16} />, label: "Generar Nómina", path: "/dashboard/nomina/generar", permission: ["nomina.create","acceso_total"] },
        { icon: <History size={16} />, label: "Historial", path: "/dashboard/nomina/historial", permission: ["nomina.read","acceso_total"] },
      ],
    },
    // 🚀 NUEVO: Menú de Asistencia con Submenús
    { 
      id: "asistencia", icon: <Timer size={18} />, label: "Asistencia", 
      hasSubmenu: true, permission: ["asistencia.read", "acceso_total"],
      submenu: [
        { icon: <History size={16} />, label: "Reportes", path: "/dashboard/asistencia/reportes", permission: ["asistencia.read", "acceso_total"] },
        { icon: <LineChart size={16} />, label: "Analítica", path: "/dashboard/asistencia/analitica", permission: ["asistencia.read", "acceso_total"] },
      ]
    },
  ];

  const filteredMenuItems = useMemo(() => {
    const checkAccess = (req?: string | string[], strict?: boolean) => {
      if (!req) return true;
      if (!strict && permissions.includes("acceso_total")) return true;
      if (Array.isArray(req)) return req.some(p => permissions.includes(p));
      return permissions.includes(req);
    };

    return rawMenuItems.reduce((acc, item) => {
      if (!checkAccess(item.permission, item.strict)) return acc;

      let finalSubmenu = item.submenu;
      if (item.submenu) {
        finalSubmenu = item.submenu.filter(sub => checkAccess(sub.permission, sub.strict));
        if (finalSubmenu.length === 0 && !item.path) return acc;
      }
      acc.push({ ...item, submenu: finalSubmenu });
      return acc;
    }, [] as MenuItem[]);
  }, [permissions]);

  const isActive = (path?: string) => path && optimisticPath === path;
  const isSectionActive = (hasSubmenu?: boolean, id?: string, itemPath?: string) => {
    if (hasSubmenu) return optimisticPath.includes(`/dashboard/${id}`);
    return isActive(itemPath);
  };

  /* ── shared inactive state ── */
  const inactiveBase = "text-neutral-500 dark:text-neutral-500";

  /* ──────────────────────────── INNER CONTENT */
  const renderContent = () => {
    let lastSection = "";
    return (
      <>
        {/* HEADER */}
        <div className={`flex items-center shrink-0 transition-all duration-300 ${collapsed ? "h-16 justify-center px-0" : "h-16 justify-between px-5"}`}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* 🚀 LOGO PNG APLICADO */}
            <div className="w-8 h-8 flex items-center justify-center text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform duration-200">
              <LogoEmpresa className="w-full h-full" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="text-[13px] font-semibold tracking-wide text-neutral-800 dark:text-neutral-100">Comercial V.A.</span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1.5 rounded-lg transition-colors duration-200 text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60">
              <ChevronLeft size={15} />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="hidden md:flex mx-auto mb-2 w-8 h-8 items-center justify-center rounded-lg transition-colors duration-200 text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60">
            <ChevronRight size={15} />
          </button>
        )}

        {/* TOP RULE */}
        <div className="shrink-0 h-px mx-4 bg-neutral-200 dark:bg-neutral-800/80" />

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-none">
          {filteredMenuItems.map(item => {
            const ac = ACCENT[item.id] ?? fallbackAccent;
            const active = !!isSectionActive(item.hasSubmenu, item.id, item.path);
            const menuOpen = openMenus.includes(item.id);

            const section = SECTION_LABELS[item.id];
            const showSection = !collapsed && section && section !== lastSection;
            if (section) lastSection = section;

            const pillCls   = active ? `${ac.activePill.light} ${ac.activePill.dark}` : `${inactiveBase} ${ac.itemHover.light} ${ac.itemHover.dark}`;
            const iconCls   = active ? `${ac.activeIcon.light} ${ac.activeIcon.dark}` : "";
            const subActCls = `${ac.subActive.light} ${ac.subActive.dark}`;
            const subHovCls = `${inactiveBase} ${ac.subHover.light} ${ac.subHover.dark}`;

            return (
              <div key={item.id}>
                {showSection && (
                  <div className="px-3 pt-4 pb-1.5">
                    <span className="text-[9px] font-bold tracking-[0.18em] uppercase select-none text-neutral-400 dark:text-neutral-600">
                      {section}
                    </span>
                  </div>
                )}

                {item.hasSubmenu ? (
                  <button onClick={() => { if (collapsed) setCollapsed(false); toggleSubmenu(item.id); }} className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${collapsed ? "justify-center" : "justify-between"} ${pillCls}`}>
                    <div className="flex items-center gap-3">
                      <span className={`transition-colors duration-200 ${iconCls}`}>{item.icon}</span>
                      {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight size={13} className={`transition-transform duration-200 opacity-40 ${menuOpen ? "rotate-90" : ""}`} />
                    )}
                  </button>
                ) : (
                  <a href={item.path || "#"} onClick={e => item.path && handleNavigate(item.path, e)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${collapsed ? "justify-center" : ""} ${pillCls}`}>
                    <span className={`transition-colors duration-200 ${iconCls}`}>{item.icon}</span>
                    {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
                  </a>
                )}

                {item.hasSubmenu && menuOpen && !collapsed && (
                  <div className="ml-3 mt-0.5 mb-1 pl-3 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800">
                    {item.submenu?.map((sub, idx) => {
                      const subActive = !!isActive(sub.path);
                      const loading   = isPending && optimisticPath === sub.path;
                      return (
                        <a key={idx} href={sub.path} onClick={e => handleNavigate(sub.path, e)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${subActive ? subActCls : subHovCls}`}>
                          {loading ? <Loader2 size={14} className="animate-spin opacity-50" /> : <span className={`transition-colors ${subActive ? `${ac.activeIcon.light} ${ac.activeIcon.dark}` : "opacity-60"}`}>{sub.icon}</span>}
                          {sub.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* BOTTOM RULE */}
        <div className="shrink-0 h-px mx-4 bg-neutral-200 dark:bg-neutral-800/80" />

        {/* FOOTER */}
        <div className={`p-3 space-y-0.5 ${collapsed ? "flex flex-col items-center" : ""}`}>
          <button onClick={toggleTheme} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 ${collapsed ? "w-10 justify-center" : "w-full"}`}>
            <Sun size={17} className="block dark:hidden" />
            <Moon size={17} className="hidden dark:block" />
            {!collapsed && <span className="text-[13px] font-medium">Tema</span>}
          </button>
          <button onClick={handleLogout} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-neutral-500 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 ${collapsed ? "w-10 justify-center" : "w-full"}`}>
            <LogOut size={17} />
            {!collapsed && <span className="text-[13px] font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </>
    );
  };

  /* ──────────────────────────────────────────────────────── SHELL */
  return (
    <>
      {/* MOBILE TRIGGER */}
      <button onClick={() => setMobileOpen(true)} className={`fixed top-4 left-4 z-[60] md:hidden p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 shadow-sm transition-all duration-200 ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <Menu size={18} />
      </button>

      {/* BACKDROP */}
      <div onClick={() => setMobileOpen(false)} className={`fixed inset-0 z-[65] backdrop-blur-sm md:hidden transition-opacity duration-300 bg-black/40 dark:bg-black/60 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[70] flex flex-col h-[100dvh] transition-all duration-300 ease-in-out bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800/60 shadow-[2px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_20px_rgba(0,0,0,0.45)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-60 md:translate-x-0 md:static md:shadow-none ${collapsed ? "md:w-[60px]" : "md:w-60"}`}>
        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 md:hidden p-1.5 rounded-lg z-10 transition-colors duration-200 text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60">
          <X size={16} />
        </button>

        {renderContent()}
      </aside>
    </>
  );
}