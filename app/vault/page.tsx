import Link from 'next/link';
import { GameLayout } from '@/components/GameLayout';
import { Lock, Zap, AlertTriangle } from 'lucide-react';

export default function VaultMenu() {
  return (
    <GameLayout title="Vault Hub" subtitle="Select a Protocol">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px', fontFamily: 'var(--font-official)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link href="/vault/standard" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--wash-teal)', borderRadius: 'var(--radius-sm)' }}><Lock size={24} /></div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Standard Protocol</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>The classic safecracking experience. Pure logic.</p>
              </div>
            </div>
          </Link>
          <Link href="/vault/blitz" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--wash-crimson)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-crimson)' }}><Zap size={24} /></div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Blitz Protocol</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>Crack a 3-digit code in 60 seconds. High pressure.</p>
              </div>
            </div>
          </Link>
          <Link href="/vault/corrupted" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--wash-ochre)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-ochre)' }}><AlertTriangle size={24} /></div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Corrupted Protocol</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>One of the six security clues is a lie. Trust nothing.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}