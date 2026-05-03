'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { castVote } from '@/app/actions/vote';
import { useState } from 'react';

function SubmitButton({ selectedCount }: { selectedCount: number }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      className="btn" 
      disabled={pending || selectedCount === 0} 
      style={{ 
        width: '100%', 
        marginTop: '2rem',
        padding: '1rem',
        fontSize: '1.1rem',
        opacity: (selectedCount === 0 || pending) ? 0.5 : 1,
        transform: selectedCount > 0 && !pending ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {pending ? 'Saving Votes...' : 'Save Votes'}
    </button>
  );
}

export default function VoteClient({ classmates, currentUserId, initialVotes = [] }: { classmates: any[], currentUserId: string, initialVotes?: string[] }) {
  const [state, formAction] = useFormState(castVote, null);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialVotes);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id);
      }
      if (prev.length < 3) {
        return [...prev, id];
      }
      return prev;
    });
  };

  return (
    <form action={formAction}>
      {state?.error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5' }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', borderRadius: '8px', color: '#6ee7b7' }}>
          Your votes have been successfully saved!
        </div>
      )}

      <div style={{ marginBottom: '1rem', textAlign: 'right', color: '#94a3b8', fontSize: '0.9rem' }}>
        {selectedIds.length} / 3 selected
      </div>

      <input type="hidden" name="nomineeIds" value={JSON.stringify(selectedIds)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        {classmates.map(user => {
          const isSelected = selectedIds.includes(user.id);
          const isDisabled = !isSelected && selectedIds.length >= 3;
          return (
            <div 
              key={user.id}
              onClick={() => toggleSelection(user.id)}
              className="glass"
              style={{
                padding: '1.5rem 1rem',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'var(--card-bg)',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                boxShadow: isSelected ? '0 10px 25px rgba(59, 130, 246, 0.3)' : '0 4px 30px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: '12px',
                userSelect: 'none'
              }}
            >
              <span style={{ fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? 'white' : '#f8fafc', fontSize: '1.1rem' }}>
                {user.fullname}
              </span>
              <span style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8', marginTop: '0.25rem' }}>
                @{user.username}
              </span>
            </div>
          );
        })}
      </div>

      {classmates.length === 0 && (
        <div style={{ color: '#94a3b8', padding: '2rem' }}>
          No other classmates found in the cohort.
        </div>
      )}

      <SubmitButton selectedCount={selectedIds.length} />
    </form>
  );
}
