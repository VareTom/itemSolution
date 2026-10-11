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
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'

type AppSidebarProps = {
  locale: Locale
  labels: Dictionary['navigation']
  residenceName: ReactNode
  localeSwitcher: ReactNode
}

export const AppSidebar = ({ locale, labels, residenceName, localeSwitcher }: AppSidebarProps) => {
  const pathname = usePathname()
  const navigation = [
    { href: `/${locale}/finances`, label: labels.finances, icon: WalletIcon },
    { href: `/${locale}/documents`, label: labels.documents, icon: FileTextIcon },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">{labels.residence}</p>
          <div className="leading-snug font-semibold text-balance break-words">{residenceName}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ href, label, icon: Icon }) => (
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
        <div className="px-2">{localeSwitcher}</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action="/logout">
              <SidebarMenuButton type="submit">
                <LogOutIcon />
                <span>{labels.logout}</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
