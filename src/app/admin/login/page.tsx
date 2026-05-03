'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAdmin } from '@/app/actions/auth';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn" disabled={pending} style={{ width: '100%', marginTop: '1rem' }}>
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useFormState(loginAdmin, null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 className="title" style={{ fontSize: '2rem', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text' }}>Admin Login</h1>
      
      <form action={formAction} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
        {state?.error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9rem' }}>
            {state.error}
          </div>
        )}
        
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Initial password for first setup is <strong>admin123</strong>.
        </p>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Admin Password</label>
          <input type="password" id="password" name="password" className="input" required autoFocus />
        </div>
        
        <SubmitButton />
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Back to Home</Link>
        </div>
      </form>
    </div>
  );
}
