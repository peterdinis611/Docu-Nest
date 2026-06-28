"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, useUser } from "@clerk/nextjs"
import {
  BarChart3,
  FolderOpen,
  Home,
  LogOut,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useSearch } from "@/hooks/useSearch"
import type { SidebarNotebook } from "@/components/layout/AppLayout"
import { getNotebookDotClass } from "@/lib/notebook-colors"
import { cn } from "@/lib/utils"

const mainNav = [
  { href: "/app",          icon: Home,       label: "Home",      end: true },
  { href: "/app/library",  icon: FolderOpen, label: "Library" },
  { href: "/app/analytics",icon: BarChart3,  label: "Analytics" },
]

interface SidebarProps {
  onClose: () => void
  notebooks: SidebarNotebook[]
}

function NavItem({ href, icon: Icon, label, end }: {
  href: string; icon: typeof Home; label: string; end?: boolean
}) {
  const pathname = usePathname()
  const isActive = end ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
          : "text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

function NotebookItem({
  id,
  title,
  color,
}: {
  id: string
  title: string
  color: string
}) {
  const pathname = usePathname()
  const isActive = pathname === `/notebook/${id}`

  return (
    <Link
      href={`/notebook/${id}`}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          getNotebookDotClass(color)
        )}
      />
      <span className="truncate">{title}</span>
    </Link>
  )
}

function UserMenu() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <div className="size-7 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-sidebar-accent" />
          <div className="h-2.5 w-32 animate-pulse rounded bg-sidebar-accent" />
        </div>
      </div>
    )
  }

  const name =
    user?.fullName ??
    user?.firstName ??
    user?.username ??
    "Account"
  const email = user?.primaryEmailAddress?.emailAddress ?? ""
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary"
        >
          <Avatar className="size-7">
            <AvatarImage src={user?.imageUrl} alt={name} />
            <AvatarFallback className="bg-sidebar-primary/25 text-[11px] font-semibold text-sidebar-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-sidebar-foreground">
              {name}
            </p>
            {email ? (
              <p className="truncate text-[11px] text-sidebar-muted">{email}</p>
            ) : (
              <p className="truncate text-[11px] text-sidebar-muted">Manage profile</p>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-52">
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton redirectUrl="/">
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Sidebar({ onClose, notebooks }: SidebarProps) {
  const { openSearch } = useSearch()

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-colors duration-200">

        {/* ── Logo / header ── */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/app" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-sidebar-accent">
              <Sparkles className="size-3.5 text-sidebar-foreground" />
            </div>
            <span className="truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
              DocuNest
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-7 shrink-0 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-3.5" />
          </Button>
        </div>

        {/* ── Search ── */}
        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={openSearch}
            className="flex h-8 w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 text-sm text-sidebar-muted transition-colors hover:border-sidebar-primary/40 hover:text-sidebar-foreground"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 text-left text-[13px]">Search…</span>
            <kbd className="rounded border border-sidebar-border/70 bg-sidebar/60 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="mx-3 h-px bg-sidebar-border" />

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted/70">
              Menu
            </p>
            {mainNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>

          <div className="space-y-0.5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted/70">
              Notebooks
            </p>
            {notebooks.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-sidebar-muted/70">
                No notebooks yet
              </p>
            ) : (
              notebooks.map((nb) => (
                <NotebookItem
                  key={nb.id}
                  id={nb.id}
                  title={nb.title}
                  color={nb.color}
                />
              ))
            )}
            <Link
              href="/app/library"
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-sidebar-muted/70 transition-colors hover:text-sidebar-primary"
            >
              View all →
            </Link>
          </div>
        </nav>

        {/* ── Footer ── */}
        <div className="shrink-0 space-y-1 border-t border-sidebar-border p-3">
          <NavItem href="/app/settings" icon={Settings} label="Settings" />

          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[12px] text-sidebar-muted">Theme</span>
            <ThemeToggle variant="sidebar" />
          </div>

          <div className="pt-1">
            <UserMenu />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
