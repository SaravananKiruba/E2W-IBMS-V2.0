import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to default tenant (test environment)
  redirect('/test/dashboard')
}
