'use client';

import { useEffect, useState } from 'react';

export default function LeaderboardClient({ topUsers }: { topUsers: any[] }) {
  const [mounted, setMounted] = useState(false);
  const maxVotes = Math.max(...topUsers.map(u => u.votes), 1); // Avoid division by zero

  useEffect(() => {
    // Small delay to trigger CSS transition on mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 1) 100%)'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
        Leaderboard
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '4rem', textAlign: 'center' }}>
        Top 5 Most Helpful Classmates
      </p>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '1000px',
        padding: '0 2rem'
      }}>
        {topUsers.map((user, index) => {
          const widthPercent = mounted ? (user.votes / maxVotes) * 100 : 0;
          
          return (
            <div key={user.id} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: '100%'
            }}>
              {/* Labels & Vote Count */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.75rem', color: '#f8fafc' }}>
                    {user.fullname || user.username}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                    @{user.username}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: '1',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'all 0.5s ease-out 1s'
                }}>
                  {user.votes}
                </div>
              </div>

              {/* Bar Track */}
              <div style={{
                width: '100%',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Filled Bar */}
                <div style={{
                  width: `${widthPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, rgba(59, 130, 246, 0.8), rgba(167, 139, 250, 0.9))',
                  borderRadius: '8px',
                  transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
                  position: 'relative'
                }}>
                   {/* Glass reflection effect */}
                   <div style={{
                     position: 'absolute',
                     top: 0, left: 0, right: 0, bottom: 0,
                     background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)'
                   }} />
                </div>
              </div>
            </div>
          );
        })}
        {topUsers.length === 0 && (
          <div style={{ alignSelf: 'center', color: '#94a3b8', fontSize: '1.5rem', paddingTop: '2rem' }}>No votes cast yet.</div>
        )}
      </div>
    </div>
  );
}
