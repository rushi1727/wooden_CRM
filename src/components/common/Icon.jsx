import {
  LayoutDashboard, Users, Target, Ruler, FileText, ClipboardList, FolderKanban,
  DoorOpen, Boxes, Factory, ShieldCheck, Truck, Hammer, ClipboardCheck, Wallet,
  Wrench, BarChart3, Settings, History, Search, Bell, ChevronDown, ChevronUp,
  ChevronRight, ChevronLeft, LogOut, User, Menu, X, Plus, Download, Filter,
  ArrowUpDown, ArrowUp, ArrowDown, Check, CheckCircle2, AlertTriangle, AlertCircle,
  Info, Pencil, Trash2, Eye, MoreHorizontal, Calendar, CalendarClock, Phone, Mail,
  MapPin, Building2, IndianRupee, TrendingUp, Clock, Printer, RefreshCw, Play,
  Pause, Package, PackageCheck, ScanLine, Send, Ban, Undo2, ArrowRight,
  PanelLeftClose, PanelLeftOpen, Receipt, HardHat, Gauge, ListChecks, Paperclip,
  Camera, SlidersHorizontal, ExternalLink, Loader2, ShoppingCart, Circle,
  CheckCheck, FileCheck2, RotateCcw, Layers, CircleDollarSign, FolderOpen, Save,
  BadgeCheck, Timer, Link2, Copy, Briefcase, ShieldAlert, CalendarCheck,
  CircleAlert, CircleCheck, MinusCircle, Sparkles,
} from 'lucide-react';

const ICONS = {
  LayoutDashboard, Users, Target, Ruler, FileText, ClipboardList, FolderKanban,
  DoorOpen, Boxes, Factory, ShieldCheck, Truck, Hammer, ClipboardCheck, Wallet,
  Wrench, BarChart3, Settings, History, Search, Bell, ChevronDown, ChevronUp,
  ChevronRight, ChevronLeft, LogOut, User, Menu, X, Plus, Download, Filter,
  ArrowUpDown, ArrowUp, ArrowDown, Check, CheckCircle2, AlertTriangle, AlertCircle,
  Info, Pencil, Trash2, Eye, MoreHorizontal, Calendar, CalendarClock, Phone, Mail,
  MapPin, Building2, IndianRupee, TrendingUp, Clock, Printer, RefreshCw, Play,
  Pause, Package, PackageCheck, ScanLine, Send, Ban, Undo2, ArrowRight,
  PanelLeftClose, PanelLeftOpen, Receipt, HardHat, Gauge, ListChecks, Paperclip,
  Camera, SlidersHorizontal, ExternalLink, Loader2, ShoppingCart, Circle,
  CheckCheck, FileCheck2, RotateCcw, Layers, CircleDollarSign, FolderOpen, Save,
  BadgeCheck, Timer, Link2, Copy, Briefcase, ShieldAlert, CalendarCheck,
  CircleAlert, CircleCheck, MinusCircle, Sparkles,
};

export default function Icon({ name, className = 'w-4 h-4', strokeWidth = 1.9, ...rest }) {
  const Cmp = ICONS[name] || Circle;
  return <Cmp className={className} strokeWidth={strokeWidth} {...rest} />;
}
