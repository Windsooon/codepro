"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Trophy,
  GitBranch,
  ArrowUpDown,
  Brain,
  Binary,
  Layers,
  Home
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

// Algorithm pages with descriptions
const algorithmPages = [
  { 
    href: "/dynamic-programming", 
    title: "Dynamic Programming", 
    icon: Brain,
    description: "Master overlapping subproblems and optimal substructure with interactive decision trees and comprehensive problem patterns."
  },
  { 
    href: "/graph", 
    title: "Graph Problems", 
    icon: GitBranch,
    description: "Navigate graph algorithms from basic traversals to advanced techniques like shortest paths, MST, and network flows."
  },
  { 
    href: "/sorting", 
    title: "Sorting Algorithms", 
    icon: ArrowUpDown,
    description: "Learn sorting techniques from simple O(n²) algorithms to advanced O(n log n) methods with complexity analysis."
  },
]

const dataStructurePages = [
  { 
    href: "/tree", 
    title: "Binary Tree", 
    icon: Binary,
    description: "Explore tree traversals, construction, validation, and advanced algorithms with visual decision trees."
  },
  { 
    href: "/stack", 
    title: "Stack", 
    icon: Layers,
    description: "Master stack-based algorithms from basic operations to advanced techniques like monotonic stacks."
  },
]

interface NavbarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link 
          href={href}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
            isActive ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
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
              <NavigationMenuTrigger>
                <Binary className="h-4 w-4 mr-1" />
                Data Structures
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {dataStructurePages.map((page) => (
                    <ListItem
                      key={page.href}
                      title={page.title}
                      href={page.href}
                    >
                      {page.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Algorithms Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Brain className="h-4 w-4 mr-1" />
                Algorithms
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {algorithmPages.map((page) => (
                    <ListItem
                      key={page.href}
                      title={page.title}
                      href={page.href}
                    >
                      {page.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  )
}

 