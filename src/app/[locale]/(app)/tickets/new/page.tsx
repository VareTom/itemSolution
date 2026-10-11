import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { getI18n } from '@/lib/i18n/get-i18n'
import { getTicketFormOptions } from '@/lib/services/tickets.service'
import { NewTicketForm } from './new-ticket-form'

const NewTicketPage = async () => {
  const [{ locale, t }, options] = await Promise.all([getI18n(), getTicketFormOptions()])

  return (
    <>
      <PageHeader title={t.tickets.create.title} description={t.tickets.create.description} />
      <Card>
        <CardContent>
          <NewTicketForm locale={locale} options={options} labels={t.tickets.create} />
        </CardContent>
      </Card>
    </>
  )
}

export default NewTicketPage
