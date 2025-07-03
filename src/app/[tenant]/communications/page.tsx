import { CommunicationChannelsPage } from '@/components/communications/communication-channels-page'

interface PageProps {
  params: { tenant: string }
}

export default function CommunicationPage({ params }: PageProps) {
  return <CommunicationChannelsPage tenant={params.tenant} />
}
