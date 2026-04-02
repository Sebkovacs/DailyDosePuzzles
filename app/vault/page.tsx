import Link from 'next/link';
import { GameLayout } from '@/components/GameLayout';
import { Lock, Zap, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

export default function VaultMenu() {
  return (
    <GameLayout title="Vault Hub" subtitle="Select a Protocol">
      <div className={styles.menuWrap}>
        <div className={styles.menuList}>
          <Link href="/vault/standard" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconStandard}`}><Lock size={24} /></div>
              <div className={styles.cardText}>
                <h2>Standard Protocol</h2>
                <p>The classic safecracking experience. Pure logic.</p>
              </div>
            </div>
          </Link>

          <Link href="/vault/blitz" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconBlitz}`}><Zap size={24} /></div>
              <div className={styles.cardText}>
                <h2>Blitz Protocol</h2>
                <p>Crack a 3-digit code in 60 seconds. High pressure.</p>
              </div>
            </div>
          </Link>

          <Link href="/vault/corrupted" className={styles.menuLink}>
            <div className={styles.menuCard}>
              <div className={`${styles.iconWrap} ${styles.iconCorrupted}`}><AlertTriangle size={24} /></div>
              <div className={styles.cardText}>
                <h2>Corrupted Protocol</h2>
                <p>One of the six security clues is a lie. Trust nothing.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}