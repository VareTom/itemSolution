import { redirect } from 'next/navigation'
import { getI18n } from '@/lib/i18n/get-i18n'

const LocaleHomePage = async () => {
  const { locale } = await getI18n()
  redirect(`/${locale}/finances`)
}

export default LocaleHomePage
