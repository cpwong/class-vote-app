import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

export default async function ThankYouPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'student') {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div 
        className="glass" 
        style={{ 
          padding: '4rem 2rem', 
          maxWidth: '500px', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeUp 0.6s ease-out'
        }}
      >
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(16, 185, 129, 0.2)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '2rem',
          border: '2px solid var(--success)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #34d399, #10b981)', WebkitBackgroundClip: 'text' }}>
          Thank You!
        </h1>
        
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
          Your vote for the most helpful classmate has been recorded. We appreciate your participation!
        </p>

        <form action={logout}>
          <button type="submit" className="btn" style={{ padding: '0.75rem 2rem' }}>
            Logout
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
