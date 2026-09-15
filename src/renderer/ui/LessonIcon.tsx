import type { LucideIcon } from 'lucide-react'
import * as Lucide from 'lucide-react'
import type { LessonIconName } from '@shared/lessonCards'

const icons = Lucide as unknown as Record<string, LucideIcon>

export function LessonIcon({
  name,
  color,
  size = 20
}: {
  name: LessonIconName
  color: string
  size?: number
}) {
  const Icon = icons[name] ?? Lucide.BookOpen
  return (
    <span className="lib-lesson-icon" aria-hidden="true">
      <Icon size={size} color={color} strokeWidth={2} />
    </span>
  )
}
