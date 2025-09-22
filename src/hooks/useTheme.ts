import { useEffect, useState } from "react"

export function useTheme(initialDark: boolean = true) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(initialDark)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  return { isDarkMode, setIsDarkMode }
}


