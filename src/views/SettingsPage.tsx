"use client"

import { useState } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import {
  Bell,
  Bot,
  Cloud,
  Key,
  Loader2,
  Palette,
  Shield,
  User,
} from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheme } from "@/hooks/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function ToggleRow({
  label,
  description,
  defaultOn = false,
}: {
  label: string
  description: string
  defaultOn?: boolean
}) {
  const [on, setOn] = useState(defaultOn)

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          on ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block size-5 rounded-full bg-white shadow transition-transform",
            on ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  )
}

function ProfileForm({
  user,
}: {
  user: NonNullable<ReturnType<typeof useUser>["user"]>
}) {
  const { openUserProfile } = useClerk()
  const [firstName, setFirstName] = useState(user.firstName ?? "")
  const [lastName, setLastName] = useState(user.lastName ?? "")
  const [bio, setBio] = useState(
    (user.unsafeMetadata?.bio as string | undefined) ?? ""
  )
  const [isSaving, setIsSaving] = useState(false)

  const displayName =
    user.fullName ?? user.firstName ?? user.username ?? "Account"
  const email = user.primaryEmailAddress?.emailAddress ?? ""
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleSave() {
    setIsSaving(true)

    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bio: bio.trim(),
        },
      })
      toast.success("Profile saved", {
        description: "Your changes have been updated.",
      })
    } catch {
      toast.error("Failed to save profile", {
        description: "Please try again in a moment.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Your public profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-lg text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => openUserProfile()}
            >
              Manage account
            </Button>
            <p className="text-xs text-muted-foreground">
              Avatar, email, and security are managed in Clerk.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="first-name" className="text-sm font-medium">
              First name
            </label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="last-name" className="text-sm font-medium">
              Last name
            </label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            value={email}
            type="email"
            readOnly
            disabled
            className="bg-muted/50"
          />
          <p className="text-xs text-muted-foreground">
            Change your email in{" "}
            <button
              type="button"
              onClick={() => openUserProfile()}
              className="font-medium text-primary hover:underline"
            >
              account settings
            </button>
            .
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others a little about yourself"
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function ProfileSettingsCard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Sign in to manage your profile</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return <ProfileForm key={user.id} user={user} />
}

export function SettingsPage() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, AI preferences, and integrations"
      />

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 lg:px-8">
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <User className="size-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 text-xs">
            <Bot className="size-3.5" />
            AI
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="size-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5 text-xs">
            <Cloud className="size-3.5" />
            Connect
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="size-4" />
                Appearance
              </CardTitle>
              <CardDescription>
                Choose how DocuNest looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ThemeToggle variant="segmented" className="w-full sm:w-auto" />
              <p className="text-xs text-muted-foreground">
                Current:{" "}
                {theme === "system"
                  ? `System (${resolvedTheme})`
                  : theme.charAt(0).toUpperCase() + theme.slice(1)}
              </p>
            </CardContent>
          </Card>

          <ProfileSettingsCard />
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI behavior</CardTitle>
              <CardDescription>
                Control how DocuNest answers questions
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <ToggleRow
                label="Strict source grounding"
                description="Only use uploaded documents — never outside knowledge"
                defaultOn
              />
              <ToggleRow
                label="Inline citations"
                description="Include [Source: doc, section] in every answer"
                defaultOn
              />
              <ToggleRow
                label="Suggest follow-up questions"
                description="Show related questions after each response"
                defaultOn
              />
              <ToggleRow
                label="Long-form responses"
                description="Prefer detailed answers over brief summaries"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="size-4" />
                API key
              </CardTitle>
              <CardDescription>
                Bring your own model provider (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="password" defaultValue="sk-••••••••••••••••" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Test connection
                </Button>
                <Badge variant="secondary" className="self-center">
                  OpenAI
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>
                Choose what you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <ToggleRow
                label="Studio output ready"
                description="When audio overviews or study guides finish generating"
                defaultOn
              />
              <ToggleRow
                label="Weekly digest"
                description="Summary of notebook activity every Monday"
                defaultOn
              />
              <ToggleRow
                label="New feature announcements"
                description="Product updates and beta invites"
              />
              <ToggleRow
                label="Collaboration invites"
                description="When someone shares a notebook with you"
                defaultOn
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-4">
          {[
            {
              name: "Google Drive",
              description: "Import PDFs and docs directly",
              connected: true,
            },
            {
              name: "Notion",
              description: "Sync pages as notebook sources",
              connected: false,
            },
            {
              name: "Slack",
              description: "Share studio outputs to channels",
              connected: false,
            },
          ].map((integration) => (
            <Card key={integration.name}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Cloud className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {integration.connected ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                    Connected
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          <Separator />

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <Shield className="size-4" />
                Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete all notebooks</p>
                <p className="text-xs text-muted-foreground">
                  Permanently remove all data. This cannot be undone.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Palette className="size-3.5" />
        DocuNest v0.1.0 ·{" "}
        {theme === "system"
          ? `System theme (${resolvedTheme})`
          : `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`}
      </div>
      </div>
    </>
  )
}
