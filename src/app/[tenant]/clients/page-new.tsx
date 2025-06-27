import { ClientsPage } from '@/components/clients/clients-page'

interface ClientsPageProps {
  params: { tenant: string }
}

export default function ClientsPageRoute({ params }: ClientsPageProps) {
  return <ClientsPage tenant={params.tenant} />
}
