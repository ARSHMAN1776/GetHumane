import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <DashboardShell user={user}>{children}</DashboardShell>
}
