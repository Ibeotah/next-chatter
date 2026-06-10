import {
  LayoutDashboard,
  SquarePen,
  Compass,
} from "lucide-react";
import { getRoute } from "@/lib/routes";

export interface NavLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: getRoute("dashboard"), icon: LayoutDashboard },
  { label: "Discovery", href: getRoute("discovery"), icon: Compass },
  { label: "Create Post", href: getRoute("new_post"), icon: SquarePen },
];