"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

  const isDirty = useMemo(() => {
    const savedBio = (user.unsafeMetadata?.bio as string | undefined) ?? ""
    return (
      firstName !== (user.firstName ?? "") ||
      lastName !== (user.lastName ?? "") ||
      bio !== savedBio
    )
  }, [bio, firstName, lastName, user.firstName, user.lastName, user.unsafeMetadata?.bio])

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
      toast.success("Profile saved")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    setFirstName(user.firstName ?? "")
    setLastName(user.lastName ?? "")
    setBio((user.unsafeMetadata?.bio as string | undefined) ?? "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Your account details synced with Clerk</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-lg text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => openUserProfile()}
            >
              Manage account & security
            </Button>
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
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="last-name" className="text-sm font-medium">
              Last name
            </label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell others a little about yourself"
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileSection() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
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
