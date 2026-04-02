import Link from 'next/link';
import { BookOpen, Zap, ArrowLeftRight, Theater } from 'lucide-react';
import { GameLayout } from '@/components/GameLayout';
import styles from './page.module.css';

export default function LexiconMenu() {
  return (
    <GameLayout title="Lexicon Hub" subtitle="Select a Variant">
      <div className={styles.menuWrap}>
        <div className={styles.menuList}>
          <Link href="/lexicon/standard" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconStandard}`}><BookOpen size={24} /></div>
              <div className={styles.cardText}>
                <h2>Standard Lexicon</h2>
                <p>Find the real definition among 5 convincing bluffs.</p>
              </div>
            </div>
          </Link>

          <Link href="/lexicon/blitz" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconBlitz}`}><Zap size={24} /></div>
              <div className={styles.cardText}>
                <h2>Lexicon Blitz</h2>
                <p>You only have 10 seconds to guess. 1 life.</p>
              </div>
            </div>
          </Link>

          <Link href="/lexicon/reverse" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconReverse}`}><ArrowLeftRight size={24} /></div>
              <div className={styles.cardText}>
                <h2>Lexicon Reverse</h2>
                <p>We show the definition, you pick the obscure word.</p>
              </div>
            </div>
          </Link>

          <Link href="/lexicon/persona" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconPersona}`}><Theater size={24} /></div>
              <div className={styles.cardText}>
                <h2>Lexicon Persona</h2>
                <p>Find the real definition among role-played bluffs.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}