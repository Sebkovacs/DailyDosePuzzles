import { db } from './firebase'; // Adjust this import based on your Firebase init file
import { collection, addDoc, getDocs, query, where, updateDoc, doc, limit, arrayUnion } from 'firebase/firestore';

export interface ArenaPuzzle {
  id?: string;
  batchId: string;
  gameName: string;
  data: any;
  status: 'testing' | 'graduated' | 'rejected';
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

export async function getNextArenaPuzzle(gameName: string): Promise<ArenaPuzzle | null> {
  const q = query(
    collection(db, 'arenaPuzzles'), 
    where('gameName', '==', gameName), 
    where('status', '==', 'testing'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ArenaPuzzle;
}

export async function submitArenaFeedback(puzzleId: string, feedbackStats: any) {
  await updateDoc(doc(db, 'arenaPuzzles', puzzleId), {
    feedback: arrayUnion(feedbackStats)
  });
}

export async function updateArenaPuzzleStatus(puzzleId: string, status: 'graduated' | 'rejected') {
  await updateDoc(doc(db, 'arenaPuzzles', puzzleId), { status });
}