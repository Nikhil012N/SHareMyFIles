import { Button } from "../ui/button"
import { FiSun, FiMoon } from "react-icons/fi"
import type { ThemeToggleProps } from "../constants/types"


export function ThemeToggle({ isDarkMode, setIsDarkMode }: ThemeToggleProps) {
  return (
   <Button
             onClick={() => setIsDarkMode(!isDarkMode)}
             variant="outline"
             size="sm"
             className="rounded-sm bg-transparent"
           >
             {isDarkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
           </Button>
  )
}