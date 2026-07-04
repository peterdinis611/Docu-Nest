import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { SettingsPageSkeleton } from "@/components/feedback/SettingsPageSkeleton"
import { SettingsPage } from "@/views/SettingsPage"
import { getCachedSettingsSummaryForUser } from "@/lib/cached-data"
import { EMPTY_SETTINGS_SUMMARY } from "@/lib/user-preferences"

export default function Page() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  )
}

async function SettingsPageContent() {
  const { userId } = await auth()
  const summary = userId
    ? await getCachedSettingsSummaryForUser(userId)
    : EMPTY_SETTINGS_SUMMARY

  return <SettingsPage summary={summary} />
}
