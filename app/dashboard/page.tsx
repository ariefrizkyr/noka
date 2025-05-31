import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }
  return <div className="p-8">Welcome, {user.email}!</div>;
} 