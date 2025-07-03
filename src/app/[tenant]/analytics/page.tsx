import { AnalyticsPage } from '@/components/analytics/analytics-page'

interface PageProps {
  params: { tenant: string }
}

export default function AnalyticsRoute({ params }: PageProps) {
  return <AnalyticsPage tenant={params.tenant} />
}
