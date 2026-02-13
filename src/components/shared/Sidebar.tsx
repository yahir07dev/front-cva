"use client";

import { useState, JSX, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { createClient } from "@/src/lib/supabase/client";

import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  Banknote,
  GraduationCap,
  Users,
  UserRound,
  UserPen,
  UserCog,
  // IMPORTAMOS LOS NUEVOS ICONOS AQUÍ
  Building2, 
  MapPin
} from "lucide-react";

/* ================= TIPOS ================= */
interface SubMenuItem {
  icon: JSX.Element;
  label: string;
  path: string;
  permission?: string | string[];
}

interface MenuItem {
  id: string;
  icon: JSX.Element;
  label: string;
  path?: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
  permission?: string | string[];
}

interface SidebarProps {
  permissions: string[];
}

/* ================= COMPONENTE ================= */
export default function Sidebar({ permissions = [] }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useTheme();
  const supabase = createClient();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSubmenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  /* ================= ESTILO ACTIVO DINÁMICO ================= */
  const getActiveStyles = (id: string) => {
    if (id === "rendimiento") {
      return "bg-orange-500/15 text-orange-600 dark:bg-orange-600/25 dark:text-orange-400";
    }
    // AGREGAMOS EL COLOR AZUL PARA ORGANIZACIÓN
    if (id === "organizacion") {
      return "bg-blue-500/15 text-blue-600 dark:bg-blue-600/25 dark:text-blue-400";
    }
    // Si quisieras agregar el morado para personal, sería aquí:
    // if (id === "personal") return "bg-purple-500/15 text-purple-600...";
    
    return "bg-neutral-200/50 dark:bg-neutral-800/40 text-neutral-900 dark:text-neutral-100";
  };

  const logoGradient = "from-neutral-700 to-neutral-950";

  /* ================= MENÚ ================= */
  const rawMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "personal",
      icon: <UserRound size={20} />,
      label: "Personal",
      hasSubmenu: true,
      permission: ["empleados.update", "roles.update", "acceso_total"],
      submenu: [
        {
          icon: <UserPen size={18} />,
          label: "Empleados",
          path: "/dashboard/personal/empleados",
          permission: ["empleados.update", "acceso_total"],
        },
        {
          icon: <UserCog size={18} />,
          label: "Roles",
          path: "/dashboard/personal/roles",
          permission: ["roles.update", "acceso_total"],
        },
      ],
    },
    // --- NUEVA SECCIÓN DE ORGANIZACIÓN ---
    {
      id: "organizacion",
      icon: <Building2 size={20} />, // Icono de Edificio/Estructura
      label: "Organización",
      hasSubmenu: true,
      // Permisos para Admin (acceso_total) y Supervisor (areas.read)
      permission: ["areas.read", "acceso_total"], 
      submenu: [
        {
          icon: <MapPin size={18} />, // Icono de ubicación/área
          label: "Áreas",
          path: "/dashboard/organizacion/areas",
          permission: ["areas.read", "acceso_total"],
        },
      ],
    },
    // -------------------------------------
    {
      id: "rendimiento",
      icon: <TrendingUp size={20} />,
      label: "Rendimiento",
      hasSubmenu: true,
      permission: [
        "actividades.read",
        "comentarios.read",
        "reportes.read_all",
        "acceso_total",
      ],
      submenu: [
        {
          icon: <TrendingUp size={18} />,
          label: "Actividades",
          path: "/dashboard/rendimiento/actividades",
          permission: ["actividades.read", "acceso_total"],
        },
        {
          icon: <Users size={18} />,
          label: "Feedback",
          path: "/dashboard/rendimiento/comentarios",
          permission: ["comentarios.read", "acceso_total"],
        },
        {
          icon: <BarChart3 size={18} />,
          label: "Analítica",
          path: "/dashboard/rendimiento/reportes",
          permission: ["reportes.read_all", "acceso_total"],
        },
      ],
    },
    {
      id: "nomina",
      icon: <Banknote size={20} />,
      label: "Nómina",
      path: "/dashboard/nomina",
    },
    {
      id: "asistencia",
      icon: <GraduationCap size={20} />,
      label: "Asistencia",
      path: "/dashboard/asistencia",
    },
  ];

  const filteredMenuItems = useMemo(() => {
    const checkAccess = (req?: string | string[]) => {
      if (!req) return true;
      if (permissions.includes("acceso_total")) return true;
      if (Array.isArray(req)) {
        return req.some((p) => permissions.includes(p));
      }
      return permissions.includes(req);
    };

    return rawMenuItems.reduce((acc, item) => {
      if (!checkAccess(item.permission)) return acc;

      let finalSubmenu = item.submenu;
      if (item.submenu) {
        finalSubmenu = item.submenu.filter((sub) =>
          checkAccess(sub.permission),
        );
        if (finalSubmenu.length === 0 && !item.path) return acc;
      }

      acc.push({ ...item, submenu: finalSubmenu });
      return acc;
    }, [] as MenuItem[]);
  }, [permissions]);

  const isActive = (path?: string) => path && pathname === path;

  const isSectionActive = (
    hasSubmenu?: boolean,
    id?: string,
    itemPath?: string,
  ) => {
    if (hasSubmenu) return pathname.includes(`/dashboard/${id}`);
    return isActive(itemPath);
  };

  /* ================= CLASES ================= */
  const inactiveClasses =
    "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200";

  const getItemClasses = (active: boolean, id: string) => `
    w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
    ${collapsed ? "justify-center" : ""}
    ${active ? getActiveStyles(id) : inactiveClasses}
  `;

  /* ================= RENDER ================= */
  return (
    <>
      {/* BOTÓN MOBILE */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`fixed top-5 left-4 z-[60] md:hidden text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 ${
          mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        } transition-opacity`}
      >
        <Menu size={24} />
      </button>

      {/* OVERLAY MOBILE */}
      <div
        className={`fixed inset-0 z-[65] bg-black/50 dark:bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* SIDEBAR PRINCIPAL - SIN BORDES VISIBLES */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[70] flex flex-col h-[100dvh]
          transition-all duration-300 ease-in-out
          bg-white dark:bg-neutral-950
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 md:translate-x-0 md:static
          ${collapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* HEADER - sin borde inferior */}
        <div
          className={`h-20 flex items-center px-5 shrink-0 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            {!collapsed && (
              <>
                <div
                  className={`min-w-[40px] h-10 rounded-xl bg-gradient-to-br ${logoGradient} flex items-center justify-center shadow-sm`}
                >
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-neutral-100">
                  RRHH
                </span>
              </>
            )}
          </Link>

          <button
            onClick={() =>
              window.innerWidth < 768
                ? setMobileOpen(false)
                : setCollapsed(!collapsed)
            }
            className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors"
          >
            {collapsed ? <Menu size={22} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* NAVEGACIÓN - sin borde */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto bg-white dark:bg-neutral-950">
          {filteredMenuItems.map((item) => {
            const isItemActive = !!isSectionActive(
              item.hasSubmenu,
              item.id,
              item.path,
            );
            const isMenuOpen = openMenus.includes(item.id);

            return (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false);
                      toggleSubmenu(item.id);
                    }}
                    className={getItemClasses(isItemActive, item.id)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${
                          isMenuOpen ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.path || "#"}
                    className={getItemClasses(isItemActive, item.id)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  </Link>
                )}

                {item.hasSubmenu && isMenuOpen && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu?.map((sub, idx) => {
                      const isSubActive = !!isActive(sub.path);
                      return (
                        <Link
                          key={idx}
                          href={sub.path}
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-colors duration-200 ${
                            isSubActive
                              ? getActiveStyles(item.id)
                              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100"
                          }`}
                        >
                          {sub.icon}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER - sin borde superior */}
        <div className="p-4 space-y-2 mt-auto">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <Sun size={20} className="block dark:hidden" />
            <Moon size={20} className="hidden dark:block" />
            {!collapsed && <span>Tema</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-neutral-800/50 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
}