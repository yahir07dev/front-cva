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
} from "lucide-react";

// Definimos interfaces
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
  empleadoNombre?: string;
  rolNombre?: string;
  isAdmin?: boolean;
}

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
      prev.includes(id)
        ? prev.filter((menuId) => menuId !== id)
        : [...prev, id],
    );
  };

  const getModuleClasses = (moduleId: string) => {
    switch (moduleId) {
      case "rendimiento":
        return {
          active:
            "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
          logoGradient: "from-orange-600 to-orange-800",
        };
      case "dashboard":
        return {
          active:
            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
          logoGradient: "from-blue-600 to-blue-800",
        };
      case "nomina":
        return {
          active:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          logoGradient: "from-emerald-600 to-emerald-800",
        };
      case "asistencia":
        return {
          active:
            "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
          logoGradient: "from-violet-600 to-violet-800",
        };
      case "personal":
        return {
          active:
            "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
          logoGradient: "from-indigo-600 to-indigo-800",
        };
      default:
        return {
          active:
            "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
          logoGradient: "from-gray-600 to-gray-800",
        };
    }
  };

  const currentActiveModule = useMemo(() => {
    if (pathname.includes("/rendimiento")) return "rendimiento";
    if (pathname.includes("/nomina")) return "nomina";
    if (pathname.includes("/asistencia")) return "asistencia";
    if (pathname.includes("/personal")) return "personal";
    return "dashboard";
  }, [pathname]);

  const activeStyles = getModuleClasses(currentActiveModule);

  // --- DEFINICIÓN DEL MENÚ ---
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
          permission: ["empleados.update", "acceso_total"],
          path: "/dashboard/personal/empleados",
        },
        {
          icon: <UserCog size={18} />,
          label: "Roles",
          permission: ["roles.update", "acceso_total"],
          path: "/dashboard/personal/roles",
        },
      ],
    },
    {
      id: "rendimiento",
      icon: <TrendingUp size={20} />,
      label: "Rendimiento",
      hasSubmenu: true,
      permission: [
        "actividades.read", 
        "comentarios.read", 
        "reportes.read_all", 
        "acceso_total"
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
          icon: <BarChart3 size={18} strokeWidth={2} />,
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
    const checkAccess = (reqPermission?: string | string[]) => {
      if (!reqPermission) return true;
      if (permissions.includes('acceso_total')) return true;
      if (Array.isArray(reqPermission)) {
        return reqPermission.some((p) => permissions.includes(p));
      }
      return permissions.includes(reqPermission);
    };

    return rawMenuItems.reduce((acc, item) => {
      if (!checkAccess(item.permission)) return acc;

      let finalSubmenu = item.submenu;
      if (item.submenu) {
        finalSubmenu = item.submenu.filter((sub) =>
          checkAccess(sub.permission),
        );
        if (finalSubmenu.length === 0 && !item.path) {
          return acc;
        }
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
    if (hasSubmenu) {
      return pathname.includes(`/dashboard/${id}`);
    }
    return isActive(itemPath);
  };

  const inactiveClasses =
    "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2d3142] dark:hover:text-white";

  // Helper para generar las clases de los botones/links
  const getItemClasses = (active: boolean) => `
    w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group relative
    ${collapsed ? "justify-center" : ""}
    ${active ? `${activeStyles.active} font-medium` : inactiveClasses}
  `;

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className={`my-4.5 ml-2.5 fixed top-5 left-4 z-[60] md:hidden transition-opacity duration-300 
        text-gray-500 hover:text-gray-900 dark:text-blue-400 dark:hover:text-white
        ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Menu size={24} />
      </button>

      <div
        className={`fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`
        fixed inset-y-0 left-0 z-[70] flex flex-col shadow-2xl md:shadow-none h-[100dvh] transition-all duration-300 ease-in-out
        bg-white dark:bg-[#1a1d29] 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        w-64 md:translate-x-0 md:static ${collapsed ? "md:w-20" : "md:w-64"}
      `}
      >
        <div
          className={`h-20 flex items-center px-5 relative shrink-0 transition-all duration-300 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className={`min-w-[40px] h-10 rounded-xl bg-gradient-to-br ${activeStyles.logoGradient} flex items-center justify-center shadow-md`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.9" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight whitespace-nowrap text-gray-900 dark:text-white">
                RRHH
              </span>
            </Link>
          </div>

          <button
            onClick={() => window.innerWidth < 768 ? setMobileOpen(false) : setCollapsed(!collapsed)}
            className={`p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-800 ${collapsed ? "absolute top-6 left-1/2 -translate-x-1/2" : ""}`}
          >
             <div className="md:hidden"><X size={24} /></div>
             <div className="hidden md:block">{collapsed ? <Menu size={24} /> : <ChevronLeft size={20} />}</div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {filteredMenuItems.map((item) => {
            // FIX: Usamos "!!" para convertir el resultado a booleano estricto
            const isItemActive = !!isSectionActive(item.hasSubmenu, item.id, item.path);
            const isMenuOpen = openMenus.includes(item.id);

            const ItemContent = () => (
                <div className="flex items-center gap-3">
                    <span className={`min-w-[24px] flex justify-center transition-transform duration-300 ${collapsed ? "scale-110" : ""}`}>
                      {item.icon}
                    </span>
                    <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
                      {item.label}
                    </span>
                 </div>
            );

            return (
              <div key={item.id} className="mb-2">
                {item.hasSubmenu ? (
                    <button
                        onClick={() => {
                            if (collapsed) setCollapsed(false);
                            toggleSubmenu(item.id);
                        }}
                        className={getItemClasses(isItemActive)}
                        title={collapsed ? item.label : ""}
                    >
                        <ItemContent />
                        {!collapsed && (
                            <ChevronRight size={16} className={`transition-transform duration-300 text-gray-400 ${isMenuOpen ? "rotate-90" : ""}`} />
                        )}
                    </button>
                ) : (
                    <Link 
                        href={item.path || '#'}
                        className={getItemClasses(isItemActive)}
                        title={collapsed ? item.label : ""}
                    >
                        <ItemContent />
                    </Link>
                )}

                {/* Submenu */}
                {item.hasSubmenu && isMenuOpen && !collapsed && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 dark:border-[#2d3142] space-y-1">
                    {item.submenu?.map((sub, idx) => {
                      const isSubActive = !!isActive(sub.path);
                      return (
                        <Link
                          key={idx}
                          href={sub.path}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                            isSubActive
                              ? `${activeStyles.active} font-medium`
                              : inactiveClasses
                          }`}
                        >
                          <span className="opacity-70 scale-90">{sub.icon}</span>
                          <span className="whitespace-nowrap">{sub.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-2 mt-auto shrink-0">
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${inactiveClasses} ${collapsed ? "justify-center" : ""}`}>
             <span className={`min-w-[24px] flex justify-center ${collapsed ? "scale-110" : ""}`}>
                 <Sun size={20} className="block dark:hidden" />
                 <Moon size={20} className="hidden dark:block" />
             </span>
             <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
                 Tema
             </span>
          </button>
          
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${inactiveClasses} ${collapsed ? "justify-center" : ""}`}>
             <span className={`min-w-[24px] flex justify-center ${collapsed ? "scale-110" : ""}`}>
                 <LogOut size={20} />
             </span>
             <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
                 Salir
             </span>
          </button>
        </div>
      </aside>
    </>
  );
}