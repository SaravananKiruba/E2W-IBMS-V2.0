import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  return (
    <DashboardLayout tenant={params.tenant}>
      {children}
    </DashboardLayout>
  )
}
