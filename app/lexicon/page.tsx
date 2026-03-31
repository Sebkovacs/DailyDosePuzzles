import Link from 'next/link';
import { BookOpen, Zap, ArrowLeftRight, Theater } from 'lucide-react';
import { GameLayout } from '@/components/GameLayout';

export default function LexiconMenu() {
  return (
    <GameLayout title="Lexicon Hub" subtitle="Select a Variant">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px', fontFamily: 'var(--font-official)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Link href="/lexicon/standard" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--wash-teal)', borderRadius: 'var(--radius-sm)' }}><BookOpen size={24} /></div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Standard Lexicon</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>Find the real definition among 5 convincing bluffs.</p>
            </div>
          </div>
        </Link>

        <Link href="/lexicon/blitz" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--wash-crimson)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-crimson)' }}><Zap size={24} /></div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Lexicon Blitz</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>You only have 10 seconds to guess. 1 life.</p>
            </div>
          </div>
        </Link>

        <Link href="/lexicon/reverse" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--wash-viridian)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-viridian)' }}><ArrowLeftRight size={24} /></div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Lexicon Reverse</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>We show the definition, you pick the obscure word.</p>
            </div>
          </div>
        </Link>

        <Link href="/lexicon/persona" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--ink-main)' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--wash-indigo)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-indigo)' }}><Theater size={24} /></div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Lexicon Persona</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-ui)' }}>Find the real definition among role-played bluffs.</p>
            </div>
          </div>
        </Link>
      </div>
      </div>
    </GameLayout>
  );
}
