import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '');

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
    const snapshot = await adminDb.collection('gameStats').where('date', '==', dateStr).get();

    // 4. Group the stats by game (e.g., separate Chain's data from Vault's data)
    const statsByGame: Record<string, any[]> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!statsByGame[data.gameName]) statsByGame[data.gameName] = [];
      statsByGame[data.gameName].push(data);
    });

    // 5. Send this grouped data to Gemini to get a thesis
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const evaluations: Record<string, any> = {};

    for (const [gameName, stats] of Object.entries(statsByGame)) {
      // Summarize data to focus the AI and save tokens
      const totalPlays = stats.length;
      const wins = stats.filter(s => s.won).length;
      const winRate = totalPlays > 0 ? (wins / totalPlays) * 100 : 0;

      // Extract top 5 traps
      const trapCounts: Record<string, number> = {};
      stats.forEach(s => {
        if (s.wrongGuesses && Array.isArray(s.wrongGuesses)) {
          s.wrongGuesses.forEach((guess: any) => {
            let guessStr = typeof guess === 'string' ? guess : JSON.stringify(guess);
            trapCounts[guessStr] = (trapCounts[guessStr] || 0) + 1;
          });
        }
      });
      const topTraps = Object.entries(trapCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([trap, count]) => `${trap} (${count} times)`);

      const prompt = `You are a master puzzle editor (like those at the New York Times) responsible for balancing difficulty and fun.
      Analyze yesterday's telemetry for the daily puzzle game "${gameName}".
      
      Yesterday's Stats:
      - Total Plays: ${totalPlays}
      - Win Rate: ${winRate.toFixed(1)}%
      - Top Traps (common wrong guesses): ${topTraps.length > 0 ? topTraps.join(' | ') : 'None'}
      
      Your goal is to keep the win rate between 60% and 80%. 
      If the win rate is >80%, make your constraints slightly trickier. If <60%, make them more accessible. Look at the top traps to understand what distracted players.
      
      Provide a brief "thesis" on why players performed the way they did, and output strict "constraints" to pass to the puzzle generator for tomorrow's puzzle to improve the balance.
      
      Return ONLY a JSON object with this exact structure:
      {"thesis": "Your analysis of the data...", "constraints": "Specific instructions for the generator to follow tomorrow..."}`;

      try {
        const result = await model.generateContent(prompt);
        evaluations[gameName] = JSON.parse(result.response.text());
      } catch (e) {
        console.error(`[EVALUATOR] Failed to evaluate ${gameName}:`, e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully aggregated data for ${Object.keys(statsByGame).length} games.`,
      evaluations
    });
  } catch (error) {
    console.error("[EVALUATOR] Failed to run cron job:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}