import { getResidence } from '@/lib/services/residence.service'

export const ResidenceName = async () => {
  const residence = await getResidence()
  return residence.name
}
