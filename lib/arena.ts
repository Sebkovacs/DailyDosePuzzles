import { db, auth } from './firebase'; // Adjust this import based on your Firebase init file
import { collection, addDoc, getDocs, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';

export interface ArenaPuzzle {
  id?: string;
  batchId: string;
  gameName: string;
  data: any;
  status: 'pending' | 'testing' | 'graduated' | 'rejected';
  createdAt: string;
}

export async function saveArenaVariants(gameName: string, puzzles: any[]): Promise<string> {
  const batchId = `batch-${Date.now()}`;
  const timestamp = new Date().toISOString();

  for (const puzzleData of puzzles) {
    await addDoc(collection(db, 'arenaPuzzles'), {
      batchId,
      gameName,
      data: puzzleData,
      status: 'testing',
      createdAt: timestamp
    });
  }
  return batchId;
}

export async function getArenaQueue(gameName: string): Promise<ArenaPuzzle[]> {
  const q = query(
    collection(db, 'arenaPuzzles'), 
    where('gameName', '==', gameName), 
    where('status', '==', 'testing')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ArenaPuzzle));
}

export async function getNextArenaPuzzle(gameName: string): Promise<{ id: string; data: any } | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated to fetch arena puzzle.");
      return null;
    }

    const token = await user.getIdToken();

    const res = await fetch('/api/arena/next', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ gameName }),
    });

    if (res.status === 404) {
      return null; // No puzzles available
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch next puzzle');
    }

    const puzzle = await res.json();
    // The API returns the full document, the puzzle content is in the `data` property
    return { id: puzzle.id, data: puzzle.data };
  } catch (error) {
    console.error(`Error in getNextArenaPuzzle for ${gameName}:`, error);
    return null;
  }
}

export async function submitArenaFeedback(puzzleId: string, feedbackStats: any) {
  await updateDoc(doc(db, 'arenaPuzzles', puzzleId), {
    feedback: arrayUnion(feedbackStats)
  });
}

export async function updateArenaPuzzleStatus(puzzleId: string, status: 'graduated' | 'rejected') {
  await updateDoc(doc(db, 'arenaPuzzles', puzzleId), { status });
}
