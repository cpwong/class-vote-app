'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginStudent } from '@/app/actions/auth';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending} style={{ width: '100%', marginTop: '1rem' }}>
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

export default function StudentLogin() {
  const [state, formAction] = useFormState(loginStudent, null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 className="title" style={{ fontSize: '2rem' }}>Student Login</h1>
      
      <form action={formAction} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
        {state?.error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9rem' }}>
            {state.error}
          </div>
        )}
        
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Username</label>
          <input type="text" id="username" name="username" className="input" required autoFocus />
        </div>
        
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Cohort Password</label>
          <input type="password" id="password" name="password" className="input" required />
        </div>
        
        <SubmitButton />
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Back to Home</Link>
        </div>
      </form>
    </div>
  );
}
