import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const AVATAR_TONES = [
  'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
]

/** "BOUILLIEZ Rita" → "BR" */
const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

/** Gives each person a stable tone so they are easy to spot across the wall and the directory. */
const avatarTone = (name: string) =>
  AVATAR_TONES[[...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % AVATAR_TONES.length]

type ContactAvatarProps = {
  name: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export const ContactAvatar = ({ name, size = 'default', className }: ContactAvatarProps) => (
  <Avatar size={size} className={className} aria-hidden>
    <AvatarFallback className={cn('font-medium', avatarTone(name))}>{initials(name)}</AvatarFallback>
  </Avatar>
)
