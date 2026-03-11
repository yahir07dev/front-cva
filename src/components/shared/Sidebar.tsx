"use client";

import { useState, JSX, useMemo, useEffect, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { createClient } from "@/src/lib/supabase/client";

import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  Banknote,
  Users,
  UserRound,
  UserPen,
  Building2,
  MapPin,
  Loader2,
  Settings,
  HandCoins,
  Calculator,
  History,
  Newspaper,
  Timer,
} from "lucide-react";

/* ================= COMPONENTE LOGO (TODO EL SVG - SOLO CONTORNO) ================= */
const LogoEmpresa = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 346 281" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="20"
    strokeLinecap="round" 
    strokeLinejoin="round" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(0.000000,281.000000) scale(0.100000,-0.100000)">
      {/* PATH 1 */}
      <path d="M1376 2581 c-3 -4 -55 -11 -117 -13 -61 -3 -116 -11 -122 -17 -6 -6
      -28 -11 -48 -11 -21 0 -41 -4 -44 -10 -3 -5 -21 -10 -40 -10 -19 0 -36 -4 -40
      -9 -3 -6 -26 -13 -50 -17 -25 -3 -45 -10 -45 -15 0 -5 -11 -9 -25 -9 -14 0
      -25 -4 -25 -10 0 -5 -6 -10 -14 -10 -32 0 -225 -107 -257 -142 -9 -10 -21 -18
      -27 -18 -14 0 -190 -174 -217 -214 -11 -16 -25 -35 -32 -41 -7 -7 -15 -24 -19
      -39 -3 -14 -10 -26 -15 -26 -5 0 -9 -9 -9 -20 0 -11 -4 -20 -10 -20 -5 0 -10
      -9 -10 -19 0 -11 -4 -22 -9 -26 -5 -3 -13 -30 -16 -60 -4 -30 -11 -55 -16 -55
      -12 0 -12 -347 0 -354 4 -3 11 -29 15 -57 4 -28 11 -58 16 -67 4 -10 21 -44
      36 -77 47 -102 132 -218 210 -285 16 -14 47 -39 69 -55 22 -17 46 -35 52 -42
      7 -6 26 -17 43 -25 16 -7 30 -16 30 -20 0 -5 9 -8 20 -8 11 0 20 -4 20 -10 0
      -5 5 -10 11 -10 6 0 27 -7 47 -16 21 -9 48 -21 62 -26 14 -6 32 -14 40 -18 9
      -4 35 -11 58 -15 23 -4 44 -11 48 -16 3 -5 23 -9 44 -9 21 0 42 -4 45 -10 3
      -5 26 -10 50 -10 24 0 46 -4 49 -9 19 -30 670 -31 700 -1 6 6 34 10 62 10 29
      0 56 5 59 10 3 6 24 10 45 10 21 0 41 4 44 9 4 5 29 12 56 16 28 4 50 11 50
      16 0 5 14 9 30 9 17 0 30 5 30 10 0 6 7 10 15 10 13 0 65 20 107 41 10 5 25 9
      33 9 8 0 15 5 15 10 0 6 6 10 14 10 7 0 27 7 42 15 16 8 39 15 52 15 12 0 22
      5 22 10 0 6 14 10 30 10 17 0 30 5 30 10 0 6 11 10 25 10 14 0 25 3 25 8 0 10
      112 17 295 17 207 0 325 -6 325 -17 0 -4 15 -8 34 -8 19 0 38 -5 41 -10 3 -6
      24 -10 46 -10 21 0 39 -4 39 -10 0 -5 14 -10 30 -10 17 0 30 3 30 8 0 9 -95
      52 -132 59 -16 3 -28 9 -28 14 0 5 -8 9 -18 9 -10 0 -22 3 -26 7 -11 12 -79
      32 -128 39 -27 4 -48 10 -48 15 0 5 -13 9 -30 9 -16 0 -30 5 -30 10 0 6 -20
      10 -44 10 -25 0 -46 5 -48 12 -6 16 -559 18 -579 2 -8 -6 -30 -14 -49 -18 -76
      -14 -90 -19 -90 -26 0 -4 -25 -11 -55 -15 -30 -3 -57 -11 -60 -16 -4 -5 -17
      -9 -31 -9 -13 0 -24 -4 -24 -10 0 -5 -18 -10 -40 -10 -22 0 -40 -4 -40 -9 0
      -8 -203 -23 -325 -24 -90 -1 -275 15 -281 24 -3 5 -21 9 -40 9 -19 0 -34 5
      -34 10 0 6 -11 10 -24 10 -14 0 -28 5 -31 10 -3 6 -16 10 -27 10 -23 0 -131
      49 -136 62 -2 4 -10 8 -18 8 -8 0 -14 5 -14 11 0 5 -4 7 -10 4 -5 -3 -23 8
      -40 25 -16 16 -33 30 -38 30 -8 0 -122 107 -122 114 0 2 -21 34 -46 71 -25 38
      -48 81 -51 97 -3 15 -9 28 -14 28 -5 0 -9 16 -9 35 0 19 -4 35 -9 35 -14 0
      -23 178 -12 240 19 105 23 120 32 120 5 0 9 8 9 18 0 18 32 86 65 137 35 54
      147 156 232 211 46 30 88 54 93 54 6 0 10 4 10 9 0 5 18 12 40 16 22 4 40 11
      40 16 0 5 9 9 20 9 11 0 20 5 20 10 0 6 14 10 30 10 17 0 30 4 30 9 0 4 23 11
      52 14 28 4 56 11 62 17 5 5 34 10 62 10 29 0 56 5 59 10 4 6 103 10 266 10
      166 0 259 -4 259 -10 0 -6 33 -10 78 -10 43 0 82 -4 88 -10 5 -5 46 -12 92
      -16 45 -4 85 -11 88 -15 3 -5 23 -9 45 -9 21 0 39 -4 39 -10 0 -5 9 -10 20
      -10 10 0 29 -4 42 -9 50 -20 64 -24 80 -22 9 1 19 -3 23 -9 3 -5 15 -10 26
      -10 10 0 19 -4 19 -10 0 -5 9 -10 20 -10 11 0 20 -4 20 -10 0 -5 9 -10 20 -10
      28 0 25 14 -7 31 -28 14 -43 24 -68 47 -7 6 -18 12 -24 12 -6 0 -11 4 -11 9 0
      7 -26 20 -52 25 -4 0 -15 8 -25 16 -10 9 -45 28 -78 43 -33 16 -68 32 -77 38
      -10 5 -27 9 -38 9 -11 0 -20 5 -20 10 0 6 -11 10 -24 10 -14 0 -27 4 -31 9 -3
      6 -26 13 -50 17 -25 3 -48 10 -51 15 -3 5 -21 9 -40 9 -19 0 -34 5 -34 10 0 6
      -19 10 -43 10 -24 0 -48 5 -54 11 -6 6 -63 13 -127 16 -64 3 -119 10 -122 15
      -7 11 -401 11 -408 -1z" />
      {/* PATH 2 */}
      <path d="M280 1975 c0 -5 5 -17 10 -25 5 -8 10 -10 10 -5 0 6 -5 17 -10 25 -5
      8 -10 11 -10 5z" />
      {/* PATH 3 */}
      <path d="M2528 1003 c7 -3 16 -2 19 1 4 3 -2 6 -13 5 -11 0 -14 -3 -6 -6z" />
      {/* PATH 4 */}
      <path d="M2608 993 c6 -2 18 -2 25 0 6 3 1 5 -13 5 -14 0 -19 -2 -12 -5z" />
      {/* PATH 5 */}
      <path d="M2053 2117 c-6 -12 -19 -52 -29 -89 -11 -38 -22 -68 -26 -68 -5 0 -8
      -10 -8 -23 0 -13 -4 -27 -8 -32 -4 -6 -16 -37 -27 -70 -10 -33 -22 -64 -27
      -70 -4 -5 -8 -17 -8 -26 0 -9 -7 -30 -15 -45 -8 -16 -15 -39 -15 -51 0 -12 -4
      -25 -10 -28 -5 -3 -10 -17 -10 -31 0 -13 -4 -24 -10 -24 -5 0 -10 -11 -10 -24
      0 -14 -4 -27 -9 -31 -6 -3 -13 -26 -17 -50 -3 -25 -10 -45 -15 -45 -5 0 -9
      -10 -9 -23 0 -13 -4 -27 -8 -33 -5 -5 -17 -36 -26 -69 -10 -33 -22 -68 -27
      -77 -5 -10 -9 -27 -9 -38 0 -11 -4 -20 -10 -20 -5 0 -10 -9 -10 -19 0 -11 -4
      -23 -10 -26 -5 -3 -10 -15 -10 -26 0 -10 -4 -19 -9 -19 -5 0 -7 -9 -4 -21 3
      -11 9 -16 12 -11 4 6 51 12 105 14 l99 3 4 30 c2 17 8 34 14 40 5 5 9 19 9 32
      0 13 3 23 8 23 7 0 25 58 39 123 3 15 9 27 14 27 5 0 9 9 9 20 0 19 7 20 196
      20 107 0 193 -4 190 -8 -5 -9 16 -77 27 -88 4 -4 7 -20 7 -36 0 -15 4 -28 8
      -28 5 0 12 -19 18 -41 l9 -42 135 -2 c134 -2 163 1 140 15 -6 4 -13 13 -14 21
      -4 19 -16 51 -27 71 -5 10 -9 25 -9 33 0 8 -4 15 -9 15 -5 0 -11 12 -14 28 -9
      43 -31 102 -39 102 -5 0 -8 11 -8 25 0 14 -4 25 -10 25 -5 0 -10 10 -10 23 0
      12 -7 35 -15 51 -8 15 -15 37 -15 47 0 11 -4 19 -10 19 -5 0 -10 9 -10 19 0
      11 -4 22 -9 26 -5 3 -13 20 -17 37 -3 18 -11 41 -17 53 -24 46 -27 55 -27 70
      0 8 -4 15 -9 15 -5 0 -12 18 -16 40 -4 22 -11 42 -16 46 -5 3 -9 14 -9 25 0
      10 -4 19 -10 19 -5 0 -10 11 -10 25 0 14 -4 25 -9 25 -6 0 -13 20 -17 45 -3
      25 -10 45 -15 45 -5 0 -9 11 -9 24 l0 24 -126 -4 c-77 -3 -131 -1 -139 6 -8 7
      -15 3 -22 -13z" />
      {/* PATH 6 */}
      <path d="M2136 1889 c-15 -28 -23 -48 -18 -45 4 2 2 -17 -7 -44 -8 -27 -18
      -47 -21 -45 -4 2 -6 -6 -5 -18 1 -12 -4 -31 -11 -42 -8 -11 -14 -28 -14 -37 0
      -10 -4 -26 -9 -36 -12 -21 -24 -54 -25 -67 -1 -5 -7 -20 -14 -32 -10 -19 -9
      -25 10 -45 22 -22 29 -23 148 -20 150 3 190 8 190 27 0 7 -14 51 -30 97 -34
      91 -33 90 -45 133 -4 17 -16 47 -26 67 -11 20 -20 53 -21 73 -2 19 -6 35 -9
      35 -4 0 -9 9 -12 21 -3 12 -10 18 -16 14 -6 -3 -11 -1 -11 4 0 28 -29 6 -54
      -40z m64 -9 c0 -16 4 -30 8 -30 4 0 9 -12 10 -26 1 -15 7 -33 13 -40 6 -7 8
      -18 5 -23 -4 -5 -2 -12 4 -16 5 -3 10 -17 10 -31 0 -13 5 -24 10 -24 6 0 10
      -11 10 -25 0 -14 5 -25 10 -25 6 0 10 -7 10 -16 0 -27 34 -118 48 -129 9 -7
      -35 -10 -143 -10 l-155 0 0 28 c0 15 5 27 10 27 6 0 10 8 10 19 0 10 7 32 15
      47 8 16 15 39 15 51 0 12 5 25 10 28 6 3 10 19 10 36 0 16 5 29 10 29 6 0 10
      8 10 18 0 10 5 23 10 28 6 6 13 34 17 62 5 42 9 52 24 52 14 0 19 -7 19 -30z" />
      {/* PATH 7 */}
      <path d="M967 2118 c-8 -5 -9 -11 -2 -15 16 -13 35 -51 35 -72 0 -11 5 -23 10
      -26 6 -4 8 -15 5 -26 -4 -11 -2 -19 4 -19 6 0 11 -9 11 -19 0 -11 5 -23 10
      -26 6 -3 10 -15 10 -26 0 -10 5 -19 10 -19 6 0 10 -12 10 -26 0 -14 7 -42 16
      -62 9 -21 21 -48 26 -62 6 -14 14 -33 19 -42 5 -10 9 -26 9 -35 0 -10 7 -31
      15 -47 8 -15 15 -35 15 -42 0 -8 5 -14 10 -14 6 0 10 -11 10 -24 0 -14 4 -27
      9 -30 5 -4 12 -24 16 -46 4 -22 11 -42 16 -46 5 -3 9 -16 9 -30 0 -13 5 -24
      10 -24 6 0 10 -11 10 -25 0 -14 4 -25 9 -25 6 0 13 -20 17 -45 3 -25 10 -45
      15 -45 5 0 9 -11 9 -25 0 -14 5 -25 10 -25 6 0 10 -7 10 -17 0 -9 7 -33 17
      -54 l16 -38 121 2 121 2 9 50 c6 28 13 52 16 55 4 3 13 26 21 53 7 26 17 47
      20 47 4 0 11 25 14 55 4 30 11 55 16 55 5 0 9 9 9 20 0 11 5 20 10 20 6 0 10
      9 10 20 0 11 4 28 9 38 13 28 41 118 41 136 0 9 5 16 10 16 6 0 10 11 10 25 0
      14 4 25 9 25 5 0 11 18 15 40 3 23 11 50 16 60 6 11 15 29 20 40 6 11 10 29
      10 39 0 11 4 22 9 26 6 3 13 26 17 50 3 25 10 45 15 45 5 0 9 11 9 25 0 14 5
      25 10 25 6 0 10 8 10 19 0 10 7 35 15 54 8 20 15 38 15 40 0 1 -49 3 -110 2
      -107 0 -110 -1 -110 -22 0 -13 -4 -23 -10 -23 -5 0 -10 -11 -10 -25 0 -14 -4
      -25 -8 -25 -9 0 -42 -107 -42 -138 0 -12 -4 -22 -10 -22 -5 0 -10 -10 -10 -23
      0 -13 -9 -42 -20 -65 -12 -24 -18 -47 -15 -52 3 -5 1 -11 -5 -15 -5 -3 -10
      -16 -10 -29 0 -12 -9 -41 -20 -64 -11 -22 -20 -48 -20 -56 0 -8 -5 -18 -11
      -22 -6 -3 -9 -17 -6 -30 2 -13 0 -24 -4 -24 -5 0 -9 -13 -9 -29 0 -17 -4 -33
      -10 -36 -5 -3 -10 -27 -9 -53 1 -43 1 -45 11 -19 5 15 13 27 18 27 4 0 8 6 7
      13 -1 41 4 58 16 51 8 -5 8 -2 -2 9 -9 11 -10 17 -2 17 6 0 11 8 11 18 0 23
      43 145 54 153 5 4 6 11 2 17 -6 11 24 105 37 110 4 2 5 7 2 11 -6 11 14 81 25
      81 4 0 6 9 3 20 -3 11 -1 26 5 33 5 6 15 30 22 52 7 22 17 46 23 53 5 6 7 12
      4 12 -11 0 14 58 26 62 7 2 41 2 75 0 63 -4 64 -4 57 -30 -4 -15 -11 -30 -16
      -33 -6 -3 -9 -10 -8 -15 4 -25 -2 -54 -11 -49 -6 4 -10 -5 -10 -20 0 -15 -4
      -24 -10 -20 -6 3 -7 -1 -4 -9 3 -9 3 -24 -2 -33 -9 -22 -11 -29 -13 -45 -1 -9
      -4 -8 -11 2 -8 11 -9 8 -4 -11 3 -15 1 -30 -5 -33 -6 -4 -11 -18 -11 -30 0
      -25 -34 -109 -41 -102 -2 2 -5 -10 -6 -27 -2 -18 -7 -43 -13 -57 -5 -14 -15
      -38 -21 -55 -15 -37 -16 -41 -18 -61 0 -9 -7 -14 -14 -11 -10 4 -13 -4 -11
      -31 2 -39 -7 -65 -22 -62 -5 1 -10 -4 -13 -11 -2 -7 1 -9 9 -4 8 5 11 3 7 -6
      -3 -8 -14 -38 -23 -66 -10 -29 -21 -53 -25 -53 -4 0 -5 -9 -2 -20 3 -10 -4
      -34 -16 -53 -11 -19 -18 -37 -14 -40 3 -4 0 -14 -7 -22 -10 -12 -33 -15 -107
      -14 l-93 1 -11 44 c-6 24 -16 44 -21 44 -5 0 -7 4 -3 9 3 5 1 12 -4 15 -5 3
      -7 16 -3 28 3 12 1 19 -5 15 -10 -6 -54 105 -61 153 -2 13 -7 27 -12 30 -5 3
      -12 17 -14 30 -2 14 -6 27 -7 30 -1 3 -3 10 -4 15 -1 6 -12 32 -24 58 -13 27
      -20 51 -17 55 3 3 0 12 -8 21 -7 9 -26 52 -41 95 -15 44 -33 89 -41 101 -8 13
      -14 27 -13 31 1 5 -3 22 -9 37 -7 16 -12 34 -12 41 0 7 -14 46 -30 86 -17 40
      -28 75 -26 77 2 3 50 5 106 5 101 0 102 -1 116 -28 12 -22 12 -29 2 -36 -9 -5
      -8 -8 5 -8 10 0 15 -5 12 -10 -4 -6 -2 -16 3 -23 5 -7 18 -41 27 -77 10 -36
      21 -69 26 -75 4 -5 10 -28 13 -49 4 -22 12 -46 18 -54 7 -8 13 -19 15 -26 1
      -6 8 -31 13 -56 6 -25 12 -53 13 -62 1 -10 7 -18 14 -18 7 0 10 -6 8 -12 -3
      -7 4 -38 15 -68 11 -30 20 -63 20 -72 0 -10 5 -18 10 -18 6 0 10 -6 8 -13 -3
      -12 34 -67 46 -67 3 0 6 9 6 20 0 11 -7 20 -15 20 -10 0 -15 10 -15 33 0 17
      -7 45 -15 61 -8 15 -15 39 -15 52 0 13 -4 24 -10 24 -5 0 -10 13 -10 29 0 17
      -4 32 -9 35 -5 3 -12 26 -15 51 -4 25 -11 45 -17 45 -5 0 -9 14 -9 30 0 17 -4
      30 -10 30 -5 0 -10 10 -10 23 -1 23 -33 123 -44 134 -3 3 -6 19 -6 35 0 15 -4
      28 -10 28 -5 0 -10 11 -10 24 0 14 -5 28 -10 31 -6 4 -8 11 -4 16 3 5 1 15 -4
      22 -6 7 -12 22 -14 35 -3 23 -5 24 -141 25 -77 1 -144 -1 -150 -5z" />
    </g>
  </svg>
);

/* ================= COMPONENTE SIDEBAR ================= */
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

export default function Sidebar({ permissions = [] }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useTheme();
  const supabase = createClient();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  
  // Estado para visibilidad del logo al hacer scroll
  const [headerVisible, setHeaderVisible] = useState(true);
  
  const [optimisticPath, setOptimisticPath] = useState<string>(pathname);
  const [isPending, startTransition] = useTransition();

  const isAdmin = permissions.includes('acceso_total') || permissions.includes('reportes.read_all');

  useEffect(() => {
    setMobileOpen(false);
    setOptimisticPath(pathname);
  }, [pathname]);

  const allPaths = useMemo(() => [
    "/dashboard",
    "/dashboard/personal/empleados",
    "/dashboard/personal/roles",
    "/dashboard/documentos/empleados",
    "/dashboard/organizacion/areas",
    "/dashboard/rendimiento/actividades",
    "/dashboard/rendimiento/comentarios",
    "/dashboard/rendimiento/reportes",
    "/dashboard/nomina/configuracion",
    "/dashboard/nomina/prestamos",
    "/dashboard/nomina/generar",
    "/dashboard/nomina/historial",
    "/dashboard/asistencia",
  ], []);

  useEffect(() => {
    allPaths.forEach((path) => router.prefetch(path));
  }, [allPaths, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNavigate = useCallback((path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (path === optimisticPath) return;
    setOptimisticPath(path);
    startTransition(() => {
      router.push(path);
    });
  }, [optimisticPath, router]);

  // Manejo de scroll para esconder el logo
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setHeaderVisible(e.currentTarget.scrollTop < 20);
  };

  const toggleSubmenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  /* ================= LÓGICA DE COLOR DINÁMICO ================= */
  const getActiveBaseColor = (path: string) => {
    if (path.includes("/dashboard/rendimiento")) return "text-orange-600 dark:text-orange-400";
    if (path.includes("/dashboard/organizacion")) return "text-blue-600 dark:text-blue-400";
    if (path.includes("/dashboard/nomina")) return "text-emerald-600 dark:text-emerald-400";
    if (path.includes("/dashboard/asistencia")) return "text-violet-600 dark:text-violet-400";
    if (path.includes("/dashboard/personal")) return "text-indigo-600 dark:text-indigo-400";
    if (path.includes("/dashboard/documentos")) return "text-cyan-600 dark:text-cyan-400";
    if (path === "/dashboard") return "text-neutral-900 dark:text-white";
    return "text-neutral-500";
  };

  const getActiveStyles = (id: string) => {
    if (id === "rendimiento") return "bg-orange-500/15 text-orange-600 dark:bg-orange-600/25 dark:text-orange-400";
    if (id === "organizacion") return "bg-blue-500/15 text-blue-600 dark:bg-blue-600/25 dark:text-blue-400";
    if (id === "nomina") return "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-600/25 dark:text-emerald-400";
    if (id === "asistencia") return "bg-violet-500/15 text-violet-600 dark:bg-violet-600/25 dark:text-violet-400";
    if (id === "personal") return "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-600/25 dark:text-indigo-400";
    if (id === "documentos") return "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-600/25 dark:text-cyan-400";
    return "bg-neutral-200/50 dark:bg-neutral-800/40 text-neutral-900 dark:text-neutral-100";
  };

  const rawMenuItems: MenuItem[] = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    {
      id: "personal",
      icon: <UserRound size={20} />,
      label: "Personal",
      hasSubmenu: true,
      permission: ["empleados.update", "roles.update", "acceso_total"],
      submenu: [
        { icon: <UserPen size={18} />, label: "Empleados", path: "/dashboard/personal/empleados", permission: ["empleados.update", "acceso_total"] },
      ],
    },
    {
      id: "documentos",
      icon: <Newspaper size={20} />,
      label: "Documentos",
      hasSubmenu: true,
      permission: ["documentos.update", "documentos.read", "acceso_total"],
      submenu: [
        { icon: <UserPen size={18} />, label: "Empleados", path: "/dashboard/documentos/empleados", permission: ["empleados.update", "acceso_total"] },
      ],
    },
    {
      id: "organizacion",
      icon: <Building2 size={20} />,
      label: "Organización",
      hasSubmenu: true,
      permission: ["acceso_total"],
      submenu: [
        { icon: <MapPin size={18} />, label: "Áreas", path: "/dashboard/organizacion/areas", permission: ["acceso_total"] },
      ],
    },
    {
      id: "rendimiento",
      icon: <TrendingUp size={20} />,
      label: "Rendimiento",
      hasSubmenu: true,
      permission: ["rendimiento.create", "actividades.create", "asignaciones.create", "actividades.read", "comentarios.read", "reportes.read_all", "acceso_total"],
      submenu: [
        { icon: <TrendingUp size={18} />, label: "Actividades", path: "/dashboard/rendimiento/actividades", permission: ["actividades.read", "acceso_total"] },
        { icon: <Users size={18} />, label: "Feedback", path: "/dashboard/rendimiento/comentarios", permission: ["comentarios.read", "acceso_total"] },
        { icon: <BarChart3 size={18} />, label: isAdmin ? "Analítica" : "Mi Rendimiento", path: "/dashboard/rendimiento/reportes", permission: ["reportes.read_all", "acceso_total", "actividades.read"] },
      ],
    },
    {
      id: "nomina",
      icon: <Banknote size={20} />,
      label: "Nómina",
      hasSubmenu: true,
      permission: ["nomina.read", "nomina.create", "nomina.update", "prestamos.read", "acceso_total"],
      submenu: [
        { icon: <Settings size={18} />, label: "Configuración", path: "/dashboard/nomina/configuracion", permission: ["nomina.update", "acceso_total"] },
        { icon: <HandCoins size={18} />, label: "Préstamos", path: "/dashboard/nomina/prestamos", permission: ["prestamos.read", "acceso_total"] },
        { icon: <Calculator size={18} />, label: "Generar Nómina", path: "/dashboard/nomina/generar", permission: ["nomina.create", "acceso_total"] },
        { icon: <History size={18} />, label: "Historial", path: "/dashboard/nomina/historial", permission: ["nomina.read", "acceso_total"] },
      ],
    },
    { id: "asistencia", icon: <Timer size={20} />, label: "Asistencia", path: "/dashboard/asistencia" },
  ];

  const filteredMenuItems = useMemo(() => {
    const checkAccess = (req?: string | string[]) => {
      if (!req) return true;
      if (permissions.includes("acceso_total")) return true;
      if (Array.isArray(req)) return req.some((p) => permissions.includes(p));
      return permissions.includes(req);
    };

    return rawMenuItems.reduce((acc, item) => {
      if (!checkAccess(item.permission)) return acc;
      let finalSubmenu = item.submenu;
      if (item.submenu) {
        finalSubmenu = item.submenu.filter((sub) => checkAccess(sub.permission));
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

  const inactiveClasses = "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200";
  const getItemClasses = (active: boolean, id: string) => `
    w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
    ${collapsed ? "justify-center" : ""}
    ${active ? getActiveStyles(id) : inactiveClasses}
  `;

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className={`fixed top-5 left-4 z-[60] md:hidden text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 ${mobileOpen ? "opacity-0" : "opacity-100"} transition-opacity`}
      >
        <Menu size={24} />
      </button>

      <div className={`fixed inset-0 z-[65] bg-black/50 dark:bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setMobileOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-[70] flex flex-col h-[100dvh] transition-all duration-300 ease-in-out bg-white dark:bg-neutral-950 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-64 md:translate-x-0 md:static ${collapsed ? "md:w-20" : "md:w-64"}`}>
        
        {/* HEADER: Dinámico con el Logo completo y sin texto RRHH */}
        <div className={`
          flex items-center px-5 shrink-0 transition-all duration-500 ease-in-out overflow-hidden
          ${collapsed ? "h-20 justify-center" : headerVisible ? "h-20 justify-between" : "h-0 opacity-0 pointer-events-none"}
        `}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className={`
              min-w-[40px] h-10 w-10 flex items-center justify-center transition-all duration-500
              ${collapsed ? "" : "group-hover:scale-110"}
              ${getActiveBaseColor(optimisticPath)}
            `}>
              <LogoEmpresa className="w-full h-full drop-shadow-sm" />
            </div>
          </Link>

          {!collapsed && (
            <button
              onClick={() => window.innerWidth < 768 ? setMobileOpen(false) : setCollapsed(!collapsed)}
              className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* NAVEGACIÓN */}
        <nav 
          onScroll={handleScroll}
          className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 bg-white dark:bg-neutral-950"
        >
          {filteredMenuItems.map((item) => {
            const isItemActive = !!isSectionActive(item.hasSubmenu, item.id, item.path);
            const isMenuOpen = openMenus.includes(item.id);
            return (
              <div key={item.id}>
                {item.hasSubmenu ? (
                  <button onClick={() => { if (collapsed) setCollapsed(false); toggleSubmenu(item.id); }} className={getItemClasses(isItemActive, item.id)}>
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && <ChevronRight size={16} className={`transition-transform duration-200 ${isMenuOpen ? "rotate-90" : ""}`} />}
                  </button>
                ) : (
                  <a href={item.path || "#"} onClick={(e) => item.path && handleNavigate(item.path, e)} className={getItemClasses(isItemActive, item.id)}>
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  </a>
                )}
                {item.hasSubmenu && isMenuOpen && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu?.map((sub, idx) => {
                      const isSubActive = !!isActive(sub.path);
                      const isLoadingThis = isPending && optimisticPath === sub.path;
                      return (
                        <a key={idx} href={sub.path} onClick={(e) => handleNavigate(sub.path, e)} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-colors duration-200 ${isSubActive ? getActiveStyles(item.id) : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100"}`}>
                          {isLoadingThis ? <Loader2 size={18} className="animate-spin opacity-60" /> : sub.icon}
                          <span>{sub.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 space-y-2 mt-auto">
          <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors ${collapsed ? "justify-center" : ""}`}>
            <Sun size={20} className="block dark:hidden" />
            <Moon size={20} className="hidden dark:block" />
            {!collapsed && <span>Tema</span>}
          </button>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-neutral-800/50 transition-colors ${collapsed ? "justify-center" : ""}`}>
            <LogOut size={20} />
            {!collapsed && <span>Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
}