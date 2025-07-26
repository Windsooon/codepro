"use client"

import * as React from "react"
import Link from "next/link"
import { 
  BarChart3, 
  Code,
  Trophy,
  GitBranch,
  ArrowUpDown
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

interface NavbarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sections = [
  {
    id: "overview",
    title: "Overview",
    icon: BarChart3,
    description: "Dashboard overview with statistics and recent activity"
  },
  {
    id: "practice",
    title: "Practice",
    icon: Code,
    description: "Problem solving practice and progress tracking"
  }
]

export function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">LeetCode Dashboard</span>
        </div>

        {/* Navigation Menu - Left aligned */}
        <NavigationMenu>
          <NavigationMenuList>
            {/* Direct navigation links */}
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <NavigationMenuItem key={section.id}>
                  <NavigationMenuLink asChild>
                    <button 
                      className={`${navigationMenuTriggerStyle()} ${
                        activeSection === section.id ? "bg-accent text-accent-foreground" : ""
                      }`}
                      onClick={() => onSectionChange(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
            
            {/* Two-Pointer Decision Tree Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/two-pointer-tree" className={navigationMenuTriggerStyle()}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Two-Pointer Tree
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            {/* Dynamic Programming Decision Tree Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/dynamic-programming" className={navigationMenuTriggerStyle()}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Dynamic Programming
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            {/* Graph Problems Decision Tree Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/graph" className={navigationMenuTriggerStyle()}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Graph Problems
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
            {/* Binary Tree Decision Tree Link */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/tree" className={navigationMenuTriggerStyle()}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Binary Tree
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
                          {/* Stack Decision Tree Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/stack" className={navigationMenuTriggerStyle()}>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Stack
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {/* Sorting Decision Tree Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/sorting" className={navigationMenuTriggerStyle()}>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sorting
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  )
}

 