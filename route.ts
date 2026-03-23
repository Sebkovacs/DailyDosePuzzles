import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(req: Request) {
  // 1. Security: Only allow the Vercel Cron system to trigger this
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Calculate yesterday's date (YYYY-MM-DD format)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    console.log(`[EVALUATOR] Waking up. Fetching stats for ${dateStr}...`);

    // 3. Fetch all telemetry from yesterday
    const q = query(collection(db, 'gameStats'), where('date', '==', dateStr));
    const snapshot = await getDocs(q);

    // 4. Group the stats by game (e.g., separate Chain's data from Vault's data)
    const statsByGame: Record<string, any[]> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!statsByGame[data.gameName]) statsByGame[data.gameName] = [];
      statsByGame[data.gameName].push(data);
    });

    // TODO: Step 5 - Send this grouped data to Gemini to get a thesis...

    return NextResponse.json({ 
      success: true, 
      message: `Successfully aggregated data for ${Object.keys(statsByGame).length} games.`,
      gamesFound: Object.keys(statsByGame)
    });
  } catch (error) {
    console.error("[EVALUATOR] Failed to run cron job:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
