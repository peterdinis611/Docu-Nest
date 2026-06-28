export async function downloadRemoteFile(url: string, filename: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Download failed")
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = window.document.createElement("a")
  link.href = objectUrl
  link.download = filename
  link.rel = "noopener"
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
