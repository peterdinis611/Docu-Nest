import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme, type Theme } from "@/context/ThemeProvider"
import { cn } from "@/lib/utils"

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

interface ThemeToggleProps {
  variant?: "icon" | "sidebar" | "segmented"
  className?: string
}

export function ThemeToggle({
  variant = "icon",
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const ActiveIcon =
    resolvedTheme === "dark" ? Moon : Sun

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex rounded-lg border bg-muted p-1",
          className
        )}
      >
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              theme === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    )
  }

  const trigger =
    variant === "sidebar" ? (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "size-9 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          className
        )}
      >
        <ActiveIcon className="size-[18px]" />
      </Button>
    ) : (
      <Button variant="ghost" size="icon" className={cn("size-9", className)}>
        <ActiveIcon className="size-4" />
      </Button>
    )

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "sidebar" ? "start" : "end"}>
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(theme === value && "bg-accent")}
          >
            <Icon className="size-4" />
            {label}
            {value === "system" && (
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                ({resolvedTheme})
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (variant === "sidebar") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{menu}</TooltipTrigger>
        <TooltipContent side="right" className="bg-foreground text-background">
          Theme
        </TooltipContent>
      </Tooltip>
    )
  }

  return menu
}
