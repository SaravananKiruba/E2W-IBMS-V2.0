import { EmployeePage } from '@/components/employees/employee-page'

interface EmployeesPageProps {
  params: { tenant: string }
}

export default function EmployeesPageRoute({ params }: EmployeesPageProps) {
  return <EmployeePage tenant={params.tenant} />
}
