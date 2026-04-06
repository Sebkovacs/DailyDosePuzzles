import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

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
        } else if (gameName === 'ChainBlitz') {
      prompt = `Generate exactly ${count} unique word chain puzzles for a high-speed Blitz mode.
      The puzzles should be of medium difficulty, suitable for solving under a time limit.
      For each puzzle, provide a startWord, an endWord, and an array "chain" of exactly 4 intermediate words.
      Every adjacent pair of words must form a common compound word or two-word phrase.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"startWord": "...", "endWord": "...", "chain": ["...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'ChainVersus') {
      prompt = `Generate exactly ${count} unique word chain puzzles for a competitive Versus mode.
      The puzzles should be of a slightly higher difficulty to challenge a player against an AI.
      For each puzzle, provide a startWord, an endWord, and an array "chain" of exactly 4 intermediate words.
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
    } else if (gameName === 'VaultBlitz') {
      prompt = `Generate exactly ${count} unique 'crack the code' logic puzzles for Vault Blitz mode.
      For each puzzle, provide a 3-digit code and 4 logical clues. The puzzles should be slightly easier than standard to be solvable under a 60-second time limit.
      Clues must follow Mastermind format (e.g., "X digits are right and in their place").
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"code": "...", "rules": ["..."]}, ...]`;
    } else if (gameName === 'VaultCorrupted') {
      prompt = `Generate exactly ${count} unique 'crack thecode' logic puzzles for Vault Corrupted mode.
      For each puzzle, provide a 4-digit code and a total of 6 logical clues.
      CRITICAL: Exactly ONE of the 6 clues must be a lie or a "red herring" that is intentionally misleading. The other 5 must be logically sound.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"code": "...", "rules": ["...", "...", "...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'VaultBlitz') {
      prompt = `Generate exactly ${count} unique 'crack the code' logic puzzles for Vault Blitz mode.
      For each puzzle, provide a 3-digit code and 4 logical clues. The puzzles should be slightly easier than standard to be solvable under a 60-second time limit.
      Clues must follow Mastermind format (e.g., "X digits are right and in their place").
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"code": "...", "rules": ["..."]}, ...]`;
    } else if (gameName === 'VaultCorrupted') {
      prompt = `Generate exactly ${count} unique 'crack thecode' logic puzzles for Vault Corrupted mode.
      For each puzzle, provide a 4-digit code and a total of 6 logical clues.
      CRITICAL: Exactly ONE of the 6 clues must be a lie or a "red herring" that is intentionally misleading. The other 5 must be logically sound.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"code": "...", "rules": ["...", "...", "...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'Lexicon') {
      prompt = `Generate exactly ${count} unique vocabulary puzzles called Lexicon.
      For each puzzle, provide an obscure, interesting "word", its "realDefinition", and an array of 5 highly plausible but "fakeDefinitions".
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"word": "...", "realDefinition": "...", "fakeDefinitions": ["...", "...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'LexiconBlitz') {
      prompt = `Generate exactly ${count} unique vocabulary puzzles for a high-speed mode called Lexicon Blitz.
      Provide an obscure, interesting "word", its "realDefinition", and 5 highly plausible "fakeDefinitions".
      Keep the definitions relatively short so they can be read quickly under a strict time limit.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"word": "...", "realDefinition": "...", "fakeDefinitions": ["...", "...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'LexiconReverse') {
      prompt = `Generate exactly ${count} unique vocabulary puzzles for Lexicon Reverse.
      Provide a highly obscure "definition", the "realWord" that matches it, and an array of 5 highly plausible but "fakeWords" that sound like they could mean that definition.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"definition": "...", "realWord": "...", "fakeWords": ["...", "...", "...", "...", "..."]}, ...]`;
    } else if (gameName === 'LexiconPersona') {
      prompt = `Generate exactly ${count} unique vocabulary puzzles called Lexicon Persona.
      Provide an obscure, interesting "word", its "realDefinition", and an array of 5 "fakeDefinitions".
      CRITICAL: Write the fake definitions in the persona of a highly dramatic 19th-century pirate, a medieval knight, or a sarcastic Gen-Z influencer.
      ${constraints ? `Additional Constraints: ${constraints}` : ''}
      Return ONLY a JSON array of objects with this structure:
      [{"word": "...", "realDefinition": "...", "fakeDefinitions": ["...", "...", "...", "...", "..."]}, ...]`;
    } else {
      return NextResponse.json({ error: 'Unsupported game type for Arena generation' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Strip markdown formatting if Gemini includes it
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '');
    }
    if (text.endsWith('```')) {
      text = text.replace(/```$/, '');
    }
    
    const variants = JSON.parse(text.trim());

    // Save the newly generated variants to the database for testers
    // Use Admin SDK to bypass security rules from server-side
    const batchId = adminDb.collection('batches').doc().id;
    const writeBatch = adminDb.batch();

    for (const variantData of variants) {
      const puzzleRef = adminDb.collection('arenaPuzzles').doc();
      writeBatch.set(puzzleRef, {
        gameName,
        batchId,
        data: variantData,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
    }
    await writeBatch.commit();

    return NextResponse.json({ success: true, batchId, variants });
  } catch (error) {
    console.error(`Arena Generation Error (${req.url}):`, error);
    return NextResponse.json({ error: 'Failed to generate arena variants' }, { status: 500 });
  }
}