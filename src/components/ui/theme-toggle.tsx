import { Moon, Sun, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const root = window.document.documentElement
    const initialTheme = root.classList.contains("dark") ? "dark" : "light"
    setTheme(initialTheme)
  }, [])

  const toggleTheme = (newTheme: "dark" | "light") => {
    const root = window.document.documentElement
    
    // Add smooth transition
    root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease')
    
    root.classList.remove("dark", "light")
    root.classList.add(newTheme)
    setTheme(newTheme)
    
    // Remove transition after animation completes
    setTimeout(() => {
      root.style.removeProperty('transition')
    }, 300)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 relative overflow-hidden group hover:shadow-md transition-all"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Choose Your Theme</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Light Mode Preview */}
            <button
              onClick={() => toggleTheme("light")}
              className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                theme === "light" 
                  ? "border-primary shadow-lg" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold">Light</span>
                  </div>
                  {theme === "light" && (
                    <Badge variant="default" className="h-5 px-2 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                
                {/* Light Theme Preview Card */}
                <Card className="bg-white border border-gray-200 p-2 space-y-1.5">
                  <div className="h-2 w-full bg-blue-500 rounded-sm"></div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 bg-gray-800 rounded-sm"></div>
                    <div className="h-1.5 w-1/2 bg-gray-400 rounded-sm"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-4 w-8 bg-blue-100 rounded border border-blue-200"></div>
                    <div className="h-4 w-8 bg-gray-100 rounded border border-gray-200"></div>
                  </div>
                </Card>
              </div>
            </button>

            {/* Dark Mode Preview */}
            <button
              onClick={() => toggleTheme("dark")}
              className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                theme === "dark" 
                  ? "border-primary shadow-lg" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold">Dark</span>
                  </div>
                  {theme === "dark" && (
                    <Badge variant="default" className="h-5 px-2 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                
                {/* Dark Theme Preview Card */}
                <Card className="bg-gray-900 border border-gray-700 p-2 space-y-1.5">
                  <div className="h-2 w-full bg-blue-600 rounded-sm"></div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-3/4 bg-gray-100 rounded-sm"></div>
                    <div className="h-1.5 w-1/2 bg-gray-500 rounded-sm"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-4 w-8 bg-blue-900 rounded border border-blue-700"></div>
                    <div className="h-4 w-8 bg-gray-800 rounded border border-gray-700"></div>
                  </div>
                </Card>
              </div>
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Switch between themes for better visibility
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}