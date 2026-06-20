import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { GlobalSearchDialog } from "@/components/dialogs/GlobalSearchDialog"
import { useSearchShortcut } from "@/hooks/useSearch"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { HomePage } from "@/pages/HomePage"
import { LandingPage } from "@/pages/LandingPage"
import { LibraryPage } from "@/pages/LibraryPage"
import { NotebookPage } from "@/pages/NotebookPage"
import { SettingsPage } from "@/pages/SettingsPage"

function GlobalSearchMount() {
  useSearchShortcut()
  return <GlobalSearchDialog />
}

function App() {
  return (
    <BrowserRouter>
      <GlobalSearchMount />
      <Routes>
        {/* public */}
        <Route path="/" element={<LandingPage />} />

        {/* app shell */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* notebook workspace */}
        <Route path="/notebook/:notebookId" element={<NotebookPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
