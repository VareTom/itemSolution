'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileTextIcon, LogOutIcon, WalletIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAVIGATION = [
  { href: '/finances', label: 'Finances', icon: WalletIcon },
  { href: '/documents', label: 'Documents', icon: FileTextIcon },
] as const

type AppSidebarProps = {
  residenceName: ReactNode
}

export const AppSidebar = ({ residenceName }: AppSidebarProps) => {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Ma copropriété</p>
          <div className="leading-snug font-semibold text-balance break-words">{residenceName}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAVIGATION.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton isActive={pathname.startsWith(href)} render={<Link href={href} />}>
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/logout" />}>
              <LogOutIcon />
              <span>Se déconnecter</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
