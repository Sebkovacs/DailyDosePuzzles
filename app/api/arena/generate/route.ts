import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveArenaVariants } from '@/lib/arena';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameName, count = 5, constraints = '' } = body;

    if (!gameName) {
      return NextResponse.json({ error: 'gameName is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    let prompt = '';
    if (gameName === 'Chain') {
      prompt = `Generate exactly ${count} unique word chain puzzles.
      For each puzzle, provide a startWord, an endWord, and an array "chain" of exactly 4 intermediate words.
      Every adjacent pair of words must form a common compound word or two-word phrase.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"startWord": "...", "endWord": "...", "chain": ["...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'Vault') {
      prompt = `Generate exactly ${count} unique 'crack the code' logic puzzles called Vault.
      For each puzzle, provide a 4-digit code and 5 logical clues.
      Clues must follow Mastermind format (e.g., "X digits are right and in their place").
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"code": "...", "rules": ["..."]}, ...]`;
    } else {
      return NextResponse.json({ error: 'Unsupported game type for Arena generation' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const variants = JSON.parse(text);

    // Save the newly generated variants to the database for testers
    const batchId = await saveArenaVariants(gameName, variants);

    return NextResponse.json({ success: true, batchId, variants });
  } catch (error) {
    console.error(`Arena Generation Error (${req.url}):`, error);
    return NextResponse.json({ error: 'Failed to generate arena variants' }, { status: 500 });
  }
}