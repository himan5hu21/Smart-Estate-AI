'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Building2, 
  Users, 
  UserCircle, 
  Bookmark, 
  Bell, 
  CheckCircle2, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/Button'
import { logout } from '@/lib/auth'
import { useState } from 'react'

interface SidebarProps {
  role: string
  userName: string
}

const roleTheme: Record<string, { activeItem: string, activeParent: string }> = {
  admin: {
    activeItem: "bg-admin-primary text-white hover:bg-admin-accent",
    activeParent: "bg-admin-primary/10 text-admin-primary hover:bg-admin-primary/20"
  },
  agent: {
    activeItem: "bg-agent-primary text-white hover:bg-agent-accent",
    activeParent: "bg-agent-primary/10 text-agent-primary hover:bg-agent-primary/20"
  },
  buyer: {
    activeItem: "bg-user-primary text-white hover:bg-user-secondary",
    activeParent: "bg-user-primary/10 text-user-primary hover:bg-user-primary/20"
  },
  seller: {
    activeItem: "bg-user-primary text-white hover:bg-user-secondary",
    activeParent: "bg-user-primary/10 text-user-primary hover:bg-user-primary/20"
  },
  // Fallback
  user: {
     activeItem: "bg-user-primary text-white hover:bg-user-secondary",
    activeParent: "bg-user-primary/10 text-user-primary hover:bg-user-primary/20"
  }
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('Approvals')

  const navItems = {
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { 
        label: 'Approvals', 
        href: '/admin/approvals', 
        icon: CheckCircle2,
        subItems: [
          { label: 'Agents', href: '/admin/approvals/agents' },
          { label: 'Properties', href: '/admin/approvals/properties' }
        ]
      },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'All Properties', href: '/admin/search', icon: Search },
      { label: 'Inquiries', href: '/admin/inquiries', icon: Mail },
      { label: 'My Listings', href: '/agent/my-listings', icon: Building2 },
    ],
    agent: [
      { label: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
      { label: 'Add Property', href: '/agent/add-property', icon: PlusCircle },
      { label: 'My Listings', href: '/agent/my-listings', icon: Building2 },
      { label: 'Inquiries', href: '/agent/inquiries', icon: Mail },
      { label: 'User Messages', href: '/agent/messages', icon: Mail },
      { label: 'Verification', href: '/agent/onboarding', icon: ShieldCheck },
      { label: 'Profile', href: '/agent/profile', icon: UserCircle },
    ],
    seller: [
      { label: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { label: 'Add Property', href: '/seller/add-property', icon: PlusCircle },
      { label: 'My Listings', href: '/seller/my-listings', icon: Building2 },
      { label: 'Inquiries', href: '/seller/inquiries', icon: Mail },
    ],
    buyer: [
      { label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
      { label: 'Search Properties', href: '/user/search', icon: Search },
      { label: 'Find Agents', href: '/user/agents', icon: Users },
      { label: 'My Inquiries', href: '/user/my-inquiries', icon: Mail },
      { label: 'Agent Messages', href: '/user/agent-messages', icon: Mail },
      { label: 'Saved', href: '/user/saved', icon: Bookmark },
      { label: 'Alerts', href: '/user/alerts', icon: Bell },
      { label: 'Profile', href: '/user/profile', icon: UserCircle },
    ],
  }

  const items = navItems[role as keyof typeof navItems] || []
  const theme = roleTheme[role] || roleTheme['user']


  const toggleSubmenu = (label: string) => {
    if (collapsed) {
      setCollapsed(false)
      setOpenSubmenu(label)
    } else {
      setOpenSubmenu(openSubmenu === label ? null : label)
    }
  }

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white border-r h-full transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link href="#" className="font-bold text-xl text-primary">
            SmartEstate
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 px-4 space-y-2 py-4">
        {items.map((item: any) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const hasSubItems = 'subItems' in item && item.subItems
          const isSubmenuOpen = openSubmenu === item.label
          if (hasSubItems) {
            return (
              <div key={item.label}>
                 <div
                  onClick={() => toggleSubmenu(item.label)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? theme.activeParent
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronRight 
                      size={16} 
                      className={cn("transition-transform", isSubmenuOpen && "rotate-90")} 
                    />
                  )}
                </div>
                
                {/* Submenu Items */}
                {!collapsed && isSubmenuOpen && (
                  <div className="mt-1 ml-9 space-y-1">
                    {item.subItems?.map((subItem: any) => {
                      const isSubActive = pathname === subItem.href || pathname?.startsWith(`${subItem.href}/`)
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            isSubActive
                              ? theme.activeItem
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Regular Item
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? theme.activeItem
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t">
        {!collapsed && (
          <div className="mb-4 px-3">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10", collapsed && "justify-center px-0")}
          onClick={() => logout()}
        >
          <LogOut size={20} className={collapsed ? "" : "mr-2"} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}


