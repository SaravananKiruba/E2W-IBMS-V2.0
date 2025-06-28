import { ConsultantManagerPage } from '@/components/consultants/consultant-manager-page'

interface ConsultantsPageProps {
  params: { tenant: string }
}

export default function ConsultantsPageRoute({ params }: ConsultantsPageProps) {
  return <ConsultantManagerPage tenant={params.tenant} />
}
