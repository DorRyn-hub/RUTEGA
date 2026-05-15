import {
  Wifi,
  Tv,
  Smartphone,
  Building2,
  Video,
  House,
  Zap,
  ShieldCheck,
  Headphones,
  Layers,
  Receipt,
  Server,
  Send,
  Share2,
  Play,
  Phone,
  Mail,
  MapPin,
  Clock,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Menu,
  LogIn,
  LogOut,
  User,
  CreditCard,
  Settings2,
  Network,
  Shield,
  Lock,
  Radio,
  Cable,
  Route,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  tv: Tv,
  smartphone: Smartphone,
  "building-2": Building2,
  video: Video,
  house: House,
  zap: Zap,
  "shield-check": ShieldCheck,
  headphones: Headphones,
  layers: Layers,
  receipt: Receipt,
  server: Server,
  send: Send,
  "share-2": Share2,
  play: Play,
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  clock: Clock,
  check: Check,
  x: X,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "arrow-right": ArrowRight,
  menu: Menu,
  "log-in": LogIn,
  "log-out": LogOut,
  user: User,
  "credit-card": CreditCard,
  settings: Settings2,
  network: Network,
  shield: Shield,
  lock: Lock,
  radio: Radio,
  cable: Cable,
  route: Route,
  "file-check": FileCheck,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  ariaLabel?: string;
}

export function Icon({ name, className, size, ariaLabel }: IconProps) {
  const Component = ICONS[name] ?? Wifi;
  const a11y = ariaLabel
    ? { role: "img" as const, "aria-label": ariaLabel }
    : { "aria-hidden": true as const };
  return <Component className={cn("h-5 w-5", className)} size={size} {...a11y} />;
}
