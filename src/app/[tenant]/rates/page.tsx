import { RatesPage } from '@/components/rates/rates-page'

interface PageProps {
  params: { tenant: string }
}

export default function Rates({ params }: PageProps) {
  return <RatesPage tenant={params.tenant} />
}
