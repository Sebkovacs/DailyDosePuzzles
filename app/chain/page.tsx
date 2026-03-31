"use client";

import Link from 'next/link';
import { GameLayout } from '@/components/GameLayout';
import { Link2, Zap, Bot } from 'lucide-react';

export default function ChainMenu() {
  return (
    <GameLayout title="Chain Hub" subtitle="Select a Mode">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px', fontFamily: 'var(--font-official)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link href="/chain/standard" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--wash-sanguine)', borderRadius: 'var(--radius-sm)' }}><Link2 size={24} /></div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Standard Chain</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>The classic word-linking challenge.</p>
              </div>
            </div>
          </Link>
          <Link href="/chain/blitz" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--wash-crimson)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-crimson)' }}><Zap size={24} /></div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Chain Blitz</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>Complete the chain before the timer runs out.</p>
              </div>
            </div>
          </Link>
          <Link href="/chain/versus" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--wash-indigo)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-indigo)' }}><Bot size={24} /></div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Chain Versus</h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>Race against an AI opponent to the finish.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}