import { SecurityPage } from '@/components/security/security-page'

interface PageProps {
  params: {
    tenant: string
  }
}

export default function Security({ params }: PageProps) {
  return <SecurityPage tenant={params.tenant} />
}
