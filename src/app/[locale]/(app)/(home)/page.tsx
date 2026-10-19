import { CalendarDaysIcon, MegaphoneIcon } from 'lucide-react'
import { getI18n } from '@/lib/i18n/get-i18n'
import { getHome } from '@/lib/services/home.service'
import { ResidenceHero } from './residence-hero'
import { SideBoard } from './side-board'
import { WallFeed } from './wall-feed'

const HomePage = async () => {
  const [{ t }, home] = await Promise.all([getI18n(), getHome()])
  const labels = t.home

  return (
    <div className="flex flex-col gap-6">
      <ResidenceHero residence={home.residence} contact={home.contact} bankDetails={home.bankDetails} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <aside className="grid content-start gap-4 sm:grid-cols-2 lg:order-last lg:grid-cols-1">
          <SideBoard
            title={labels.noticeBoard.title}
            description={labels.noticeBoard.description}
            emptyLabel={labels.noticeBoard.empty}
            items={home.notices}
            icon={MegaphoneIcon}
          />
          <SideBoard
            title={labels.calendar.title}
            description={labels.calendar.description}
            emptyLabel={labels.calendar.empty}
            items={home.events}
            icon={CalendarDaysIcon}
          />
        </aside>
        <WallFeed posts={home.wall} />
      </div>
    </div>
  )
}

export default HomePage
