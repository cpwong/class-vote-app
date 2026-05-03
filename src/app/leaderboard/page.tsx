import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LeaderboardClient from './LeaderboardClient';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const db = getFirebaseAdmin();
  
  const snapshot = await db.collection('users').get();
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

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

  const topUsers = users
    .map(u => ({ ...u, votes: voteCounts[u.id] }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  return (
    <LeaderboardClient topUsers={topUsers} />
  );
}
