import { FinancePage } from '@/components/finance/finance-page'

interface PageProps {
  params: { tenant: string }
}

export default function Finance({ params }: PageProps) {
  return <FinancePage tenant={params.tenant} />
}
