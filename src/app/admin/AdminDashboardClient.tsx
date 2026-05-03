'use client';

import { useFormState } from 'react-dom';
import { addUser, removeUser, updatePasswords, bulkAddUsers, editUser, removeAllUsers, resetAllVotes, simulateRandomVotes } from '@/app/actions/admin';
import { logout } from '@/app/actions/auth';
import { useRef, useState } from 'react';

export default function AdminDashboardClient({ users, voteCounts, settings }: any) {
  const [addUserState, addUserAction] = useFormState(addUser, null);
  const [bulkAddState, bulkAddAction] = useFormState(bulkAddUsers, null);
  const [removeUserState, removeUserAction] = useFormState(removeUser, null);
  const [updatePwState, updatePwAction] = useFormState(updatePasswords, null);
  const [editUserState, editUserAction] = useFormState(editUser, null);
  const [removeAllUserState, removeAllUserAction] = useFormState(removeAllUsers, null);
  const [resetAllVotesState, resetAllVotesAction] = useFormState(resetAllVotes, null);
  const [simulateVotesState, simulateVotesAction] = useFormState(simulateRandomVotes, null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'votes' | 'username' | 'fullname'>('votes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'votes' | 'username' | 'fullname') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'votes' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: '0.25rem' }}>↕</span>;
    return <span style={{ marginLeft: '0.25rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortField === 'votes') {
      const diff = voteCounts[a.id] - voteCounts[b.id];
      return sortDirection === 'asc' ? diff : -diff;
    } else if (sortField === 'username') {
      const diff = a.username.localeCompare(b.username);
      return sortDirection === 'asc' ? diff : -diff;
    } else if (sortField === 'fullname') {
      const diff = (a.fullname || a.username).localeCompare(b.fullname || b.username);
      return sortDirection === 'asc' ? diff : -diff;
    }
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <a href="/leaderboard" target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
          Open Leaderboard ↗
        </a>
        <form action={logout}>
          <button type="submit" className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)' }}>Logout</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Passwords Panel */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Global Settings</h2>
          <form action={updatePwAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {updatePwState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{updatePwState.error}</div>}
             {updatePwState?.success && <div style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>Settings updated successfully.</div>}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Student Cohort Password</label>
              <input type="text" name="studentPassword" defaultValue={settings.student_password} className="input" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Admin Password</label>
              <input type="text" name="adminPassword" defaultValue={settings.admin_password} className="input" required />
            </div>
            <button type="submit" className="btn">Save Settings</button>
          </form>
        </div>

        {/* Add User Panel */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          {users.length === 0 ? (
            <>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Bulk Add Students</h2>
              <form 
                ref={formRef}
                action={(formData) => {
                  bulkAddAction(formData);
                  formRef.current?.reset();
                }} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {bulkAddState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{bulkAddState.error}</div>}
                {bulkAddState?.success && <div style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>Users added.</div>}
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Paste a list (format: username, fullname per line)</label>
                  <textarea name="usernames" className="input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="alice, Alice Smith&#10;bob, Bob Builder..." required />
                </div>
                <button type="submit" className="btn">Assign List</button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add Student</h2>
              <form 
                ref={formRef}
                action={(formData) => {
                  addUserAction(formData);
                  formRef.current?.reset();
                }} 
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {addUserState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{addUserState.error}</div>}
                {addUserState?.success && <div style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>User added.</div>}
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
                  <input type="text" name="username" className="input" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name (Optional)</label>
                  <input type="text" name="fullname" className="input" />
                </div>
                <button type="submit" className="btn">Add User</button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Leaderboard / Cohort List */}
      <div className="glass" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Cohort List & Votes</h2>
          {users.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <form action={simulateVotesAction} onSubmit={(e) => {
                if (!confirm('Are you sure you want to simulate random votes? This will overwrite existing votes.')) {
                  e.preventDefault();
                }
              }}>
                <button type="submit" className="btn" style={{ backgroundColor: 'transparent', color: '#10b981', border: '1px solid #10b981', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  Simulate Votes
                </button>
              </form>
              <form action={resetAllVotesAction} onSubmit={(e) => {
                if (!confirm('Are you sure you want to reset ALL votes to zero? This will clear all current votes but keep the students.')) {
                  e.preventDefault();
                }
              }}>
                <button type="submit" className="btn" style={{ backgroundColor: 'transparent', color: '#fbbf24', border: '1px solid #fbbf24', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  Reset All Votes
                </button>
              </form>
              <form action={removeAllUserAction} onSubmit={(e) => {
                if (!confirm('Are you sure you want to remove ALL students and their votes? This action cannot be undone.')) {
                  e.preventDefault();
                }
              }}>
                <button type="submit" className="btn" style={{ backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  Remove All Students
                </button>
              </form>
            </div>
          )}
        </div>
        {editUserState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>{editUserState.error}</div>}
        {removeAllUserState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>{removeAllUserState.error}</div>}
        {resetAllVotesState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>{resetAllVotesState.error}</div>}
        {simulateVotesState?.error && <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>{simulateVotesState.error}</div>}
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th onClick={() => handleSort('username')} style={{ padding: '0.75rem', color: '#94a3b8', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>Username {getSortIcon('username')}</th>
              <th onClick={() => handleSort('fullname')} style={{ padding: '0.75rem', color: '#94a3b8', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>Full Name {getSortIcon('fullname')}</th>
              <th style={{ padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Status</th>
              <th onClick={() => handleSort('votes')} style={{ padding: '0.75rem', color: '#94a3b8', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>Votes Received {getSortIcon('votes')}</th>
              <th style={{ padding: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No students in cohort.</td>
              </tr>
            )}
            {sortedUsers.map((user: any) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td colSpan={2} style={{ padding: '0.75rem' }}>
                  {editingId === user.id ? (
                    <form 
                      action={(formData) => {
                        editUserAction(formData);
                        setEditingId(null);
                      }}
                      style={{ display: 'flex', gap: '0.5rem', width: '100%' }}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="text" name="newUsername" defaultValue={user.username} className="input" style={{ padding: '0.25rem 0.5rem', flex: 1 }} placeholder="Username" required autoFocus />
                      <input type="text" name="newFullname" defaultValue={user.fullname || user.username} className="input" style={{ padding: '0.25rem 0.5rem', flex: 2 }} placeholder="Full Name" required />
                      <button type="submit" className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Cancel</button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', width: '100%' }}>
                      <div style={{ flex: 1 }}>{user.username}</div>
                      <div style={{ flex: 2, color: '#e2e8f0' }}>{user.fullname || user.username}</div>
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {user.has_voted ? (
                    <span style={{ color: 'var(--success)', fontSize: '0.875rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>Voted</span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Pending</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{voteCounts[user.id]}</td>
                <td style={{ padding: '0.75rem' }}>
                  {editingId !== user.id && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => setEditingId(user.id)} className="btn" style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                        Edit
                      </button>
                      <form action={removeUserAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="btn" style={{ backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                          Remove
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
