"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Trophy,
  GitBranch,
  ArrowUpDown,
  Brain,
  Binary,
  Layers,
  Home,
  ChevronDown
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

// Data structure definitions
const algorithmPages = [
  { href: "/dynamic-programming", title: "Dynamic Programming", icon: Brain },
  { href: "/graph", title: "Graph Problems", icon: GitBranch },
  { href: "/sorting", title: "Sorting", icon: ArrowUpDown },
]

const dataStructurePages = [
  { href: "/tree", title: "Binary Tree", icon: Binary },
  { href: "/stack", title: "Stack", icon: Layers },
]

interface NavbarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function Navbar({ activeSection, onSectionChange }: NavbarProps = {}) {
  const pathname = usePathname()
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">LeetCode Dashboard</span>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            {/* Overview Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link 
                  href="/" 
                  className={`${navigationMenuTriggerStyle()} ${
                    pathname === "/" ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Overview
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Data Structures Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-1">
                <Binary className="h-4 w-4" />
                Data Structures
                <ChevronDown className="h-3 w-3" />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex flex-col gap-1 p-4 w-64">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Data Structure Problems
                  </div>
                  {dataStructurePages.map((page) => {
                    const Icon = page.icon
                    const isActive = pathname === page.href
                    return (
                      <NavigationMenuLink key={page.href} asChild>
                        <Link
                          href={page.href}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                            isActive ? "bg-accent text-accent-foreground font-medium" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {page.title}
                        </Link>
                      </NavigationMenuLink>
                    )
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Algorithms Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                Algorithms
                <ChevronDown className="h-3 w-3" />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex flex-col gap-1 p-4 w-64">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Algorithm Problems
                  </div>
                  {algorithmPages.map((page) => {
                    const Icon = page.icon
                    const isActive = pathname === page.href
                    return (
                      <NavigationMenuLink key={page.href} asChild>
                        <Link
                          href={page.href}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                            isActive ? "bg-accent text-accent-foreground font-medium" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {page.title}
                        </Link>
                      </NavigationMenuLink>
                    )
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  )
}

 