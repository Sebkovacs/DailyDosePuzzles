import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const isTesterOrAdmin = async (uid: string, email?: string) => {
  const userSnap = await adminDb.collection('users').doc(uid).get();
  const adminSnap = email ? await adminDb.collection('admins').doc(email).get() : null;
  const playtesterSnap = email ? await adminDb.collection('playtesters').doc(email).get() : null;

  const role = userSnap.exists ? userSnap.data()?.role : null;
  return role === 'admin' || role === 'tester' || adminSnap?.exists || playtesterSnap?.exists;
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const emailLower = decoded.email?.toLowerCase();
    const canAccess = await isTesterOrAdmin(decoded.uid, emailLower);
    if (!canAccess) return NextResponse.json({ error: 'Tester or admin access required' }, { status: 403 });

    const body = await req.json();
    const gameName = String(body?.gameName || '');
    if (!gameName) return NextResponse.json({ error: 'gameName is required' }, { status: 400 });

    const queueSnap = await adminDb
      .collection('arenaPuzzles')
      .where('gameName', '==', gameName)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .limit(1)
      .get();

    if (queueSnap.empty) {
      return NextResponse.json({ error: `No pending Arena puzzle for ${gameName}` }, { status: 404 });
    }

    const puzzleDoc = queueSnap.docs[0];
    await puzzleDoc.ref.update({
      status: 'testing',
      claimedBy: decoded.uid,
      claimedAt: Timestamp.now()
    });

    return NextResponse.json({
      id: puzzleDoc.id,
      ...puzzleDoc.data(),
      status: 'testing'
    });
  } catch (error) {
    console.error('Arena next puzzle error:', error);
    return NextResponse.json({ error: 'Failed to fetch next arena puzzle' }, { status: 500 });
  }
}
