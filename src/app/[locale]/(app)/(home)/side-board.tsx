import type { ComponentType } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type SideBoardProps = {
  title: string
  description: string
  emptyLabel: string
  items: string[]
  icon: ComponentType<{ className?: string }>
}

export const SideBoard = ({ title, description, emptyLabel, items, icon: Icon }: SideBoardProps) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item} className="border-l-2 border-primary/40 pl-3">
              {item}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
)
