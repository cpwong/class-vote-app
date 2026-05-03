import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const db = getFirebaseAdmin();
  
  // Fetch users
  const snapshot = await db.collection('users').get();
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

  // Fetch settings
  const settingsDoc = await db.collection('settings').doc('global').get();
  const settings = settingsDoc.exists ? settingsDoc.data() : { admin_password: '', student_password: '' };

  // Calculate votes
  const voteCounts: Record<string, number> = {};
  users.forEach(u => voteCounts[u.id] = 0);
  
  users.forEach(u => {
    if (u.has_voted && u.voted_for) {
      if (Array.isArray(u.voted_for)) {
        u.voted_for.forEach((id: string, index: number) => {
          if (voteCounts[id] !== undefined) {
            const points = index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0;
            voteCounts[id] += points;
          }
        });
      } else if (typeof u.voted_for === 'string') {
        if (voteCounts[u.voted_for] !== undefined) voteCounts[u.voted_for] += 3;
      }
    }
  });

  // Sort users by votes
  const sortedUsers = [...users].sort((a, b) => voteCounts[b.id] - voteCounts[a.id]);

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title" style={{ marginBottom: 0, fontSize: '2rem' }}>Admin Dashboard</h1>
        <form action="/actions/auth/logout" method="post" suppressHydrationWarning>
           {/* We will handle logout in a separate action or just a button */}
        </form>
      </div>
      
      <AdminDashboardClient 
        users={sortedUsers} 
        voteCounts={voteCounts} 
        settings={settings}
      />
    </div>
  );
}
