import { NavLink, useLocation } from "react-router-dom"
import {
  BarChart3,
  FolderOpen,
  Home,
  LogOut,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CreateNotebookDialog } from "@/components/dialogs/CreateNotebookDialog"
import { mockNotebooks } from "@/data/mock"
import { cn } from "@/lib/utils"

const mainNav = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/library", icon: FolderOpen, label: "Library" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
]

const notebookColors: Record<string, string> = {
  "nb-1": "bg-blue-400",
  "nb-2": "bg-emerald-400",
  "nb-3": "bg-amber-400",
  "nb-4": "bg-violet-400",
}

interface SidebarProps {
  onClose: () => void
}

function NavItem({
  to,
  icon: Icon,
  label,
  end,
}: {
  to: string
  icon: typeof Home
  label: string
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground shadow-sm before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary [&_svg]:text-sidebar-primary"
            : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )
      }
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function NotebookItem({ id, title }: { id: string; title: string }) {
  const location = useLocation()
  const isActive = location.pathname === `/notebook/${id}`

  return (
    <NavLink
      to={`/notebook/${id}`}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          notebookColors[id] ?? "bg-sidebar-primary"
        )}
      />
      <span className="truncate font-medium">{title}</span>
    </NavLink>
  )
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">
              PD
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Peter Dinis</p>
            <p className="truncate text-[11px] text-sidebar-muted">Pro plan</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-52">
        <DropdownMenuItem>
          <User className="size-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-full w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <NavLink to="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary shadow-lg shadow-sidebar-primary/25">
              <Sparkles className="size-4 text-sidebar-primary-foreground" />
            </div>
            <span className="truncate text-[15px] font-semibold tracking-tight">
              DocuNest
            </span>
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-7 shrink-0 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="shrink-0 space-y-2 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-sidebar-muted" />
            <input
              placeholder="Search…"
              className="h-9 w-full rounded-lg border border-sidebar-border bg-sidebar-accent/40 pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-muted outline-none transition-colors focus:border-sidebar-primary/50 focus:bg-sidebar-accent/60"
            />
          </div>
          <CreateNotebookDialog
            trigger={
              <Button className="h-9 w-full gap-2 bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20 hover:bg-sidebar-primary/90">
                <Plus className="size-4" />
                New notebook
              </Button>
            }
          />
        </div>

        <div className="mx-3 h-px bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              Menu
            </p>
            {mainNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          <div className="space-y-0.5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              Notebooks
            </p>
            {mockNotebooks.slice(0, 4).map((nb) => (
              <NotebookItem key={nb.id} id={nb.id} title={nb.title} />
            ))}
            <NavLink
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-muted transition-colors hover:text-sidebar-primary"
            >
              View all →
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-0.5 border-t border-sidebar-border p-3">
          <NavItem to="/settings" icon={Settings} label="Settings" />
          <div className="flex items-center gap-2 px-1">
            <ThemeToggle variant="sidebar" />
            <span className="text-xs text-sidebar-muted">Theme</span>
          </div>
          <UserMenu />
        </div>
      </aside>
    </TooltipProvider>
  )
}
