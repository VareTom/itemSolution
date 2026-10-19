'use client'

import { Suspense, type ComponentType, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookUserIcon, FileTextIcon, HouseIcon, LandmarkIcon, LayoutGridIcon, LogOutIcon, MessagesSquareIcon, WalletIcon } from 'lucide-react'
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

type NavigationItem = {
  href: string
  label: string
  icon: ComponentType
  exact?: boolean
}

type NavigationMenuProps = {
  items: NavigationItem[]
  pathname: string | null
}

const NavigationMenu = ({ items, pathname }: NavigationMenuProps) => (
  <SidebarMenu>
    {items.map(({ href, label, icon: Icon, exact = false }) => (
      <SidebarMenuItem key={href}>
        <SidebarMenuButton
          isActive={(exact ? pathname === href : pathname?.startsWith(href)) ?? false}
          render={<Link href={href} />}
        >
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
)

/** Reads the current path, which is only known at request time on dynamic routes. */
const ActiveNavigationMenu = ({ items }: { items: NavigationItem[] }) => (
  <NavigationMenu items={items} pathname={usePathname()} />
)

export const AppSidebar = ({ locale, labels, residenceName, localeSwitcher }: AppSidebarProps) => {
  const navigation = [
    { href: `/${locale}`, label: labels.home, icon: HouseIcon, exact: true },
    { href: `/${locale}/finances`, label: labels.finances, icon: WalletIcon },
    { href: `/${locale}/documents`, label: labels.documents, icon: FileTextIcon },
    { href: `/${locale}/tickets`, label: labels.tickets, icon: MessagesSquareIcon },
    { href: `/${locale}/assemblies`, label: labels.assemblies, icon: LandmarkIcon },
    { href: `/${locale}/directory`, label: labels.directory, icon: BookUserIcon },
    { href: `/${locale}/registry`, label: labels.registry, icon: LayoutGridIcon },
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
            <Suspense fallback={<NavigationMenu items={navigation} pathname={null} />}>
              <ActiveNavigationMenu items={navigation} />
            </Suspense>
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
