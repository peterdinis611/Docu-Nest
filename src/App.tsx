import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { HomePage } from "@/pages/HomePage"
import { LibraryPage } from "@/pages/LibraryPage"
import { NotebookPage } from "@/pages/NotebookPage"
import { SettingsPage } from "@/pages/SettingsPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="notebook/:notebookId" element={<NotebookPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
