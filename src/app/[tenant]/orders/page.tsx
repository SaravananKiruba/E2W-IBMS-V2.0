import { OrdersPage } from '@/components/orders/orders-page'

interface PageProps {
  params: { tenant: string }
}

export default function Orders({ params }: PageProps) {
  return <OrdersPage tenant={params.tenant} />
}
