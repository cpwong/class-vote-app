import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 className="title">Class Vote</h1>
      <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#94a3b8' }}>
        Nominate the most helpful classmate.
      </p>
      
      <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button className="btn" style={{ width: '100%' }}>Student Login</button>
        </Link>
        <Link href="/admin/login" style={{ textDecoration: 'none' }}>
          <button className="btn" style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid var(--border)' }}>Admin Login</button>
        </Link>
      </div>
    </div>
  );
}
