"use client"

import { useState } from "react"
import { Database, User } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { AppearanceSection } from "@/components/settings/AppearanceSection"
import { DataSection } from "@/components/settings/DataSection"
import { ProfileSection } from "@/components/settings/ProfileSection"
import { cn } from "@/lib/utils"
import {
  EMPTY_SETTINGS_SUMMARY,
  type SettingsSection,
  type SettingsSummary,
} from "@/lib/user-preferences"

const sections: Array<{
  id: SettingsSection
  label: string
  icon: typeof User
  description: string
}> = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Account & appearance",
  },
  {
    id: "data",
    label: "Data",
    icon: Database,
    description: "Usage & account actions",
  },
]

interface SettingsPageProps {
  summary?: SettingsSummary
}

export function SettingsPage({
  summary = EMPTY_SETTINGS_SUMMARY,
}: SettingsPageProps) {
  const [section, setSection] = useState<SettingsSection>("profile")
  const active = sections.find((item) => item.id === section)!

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and workspace data"
      />

      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="space-y-1">
            {sections.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  section === id
                    ? "border-primary/30 bg-primary/5"
                    : "border-transparent hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    section === id ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </nav>

          <div className="min-w-0 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                {active.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                {active.description}
              </p>
            </div>

            {section === "profile" && (
              <div className="space-y-6">
                <AppearanceSection />
                <ProfileSection />
              </div>
            )}

            {section === "data" && <DataSection summary={summary} />}
          </div>
        </div>
      </div>
    </>
  )
}
