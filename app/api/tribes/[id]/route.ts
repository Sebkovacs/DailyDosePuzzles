import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const uid = decodedToken.uid;

    // 1. Fetch the Tribe
    const tribeDoc = await adminDb.collection('tribes').doc(params.id).get();
    if (!tribeDoc.exists) return NextResponse.json({ error: 'Tribe not found' }, { status: 404 });
    
    const tribeData = tribeDoc.data();
    const memberIds: string[] = tribeData?.members || [];

    // 2. Security Check: Are they in the Tribe?
    if (!memberIds.includes(uid)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 3. Fetch all members' basic profiles (up to 30 members to respect Firestore limits)
    const safeMemberIds = memberIds.slice(0, 30);
    const usersSnap = await adminDb.collection('users').where('uid', 'in', safeMemberIds).get();
    
    const userMap: Record<string, string> = {};
    usersSnap.docs.forEach(doc => {
      userMap[doc.data().uid] = doc.data().displayName || doc.data().email?.split('@')[0] || 'Player';
    });

    // 4. Fetch all game stats for these members
    const statsSnap = await adminDb.collection('gameStats').where('userId', 'in', safeMemberIds).get();
    
    // 5. Calculate the Leaderboard
    const leaderboardData: Record<string, { wins: number, plays: number }> = {};
    safeMemberIds.forEach(id => leaderboardData[id] = { wins: 0, plays: 0 });

    statsSnap.docs.forEach(doc => {
      const stat = doc.data();
      if (stat.isPlayTest) return; // Only count standard competitive games!
      
      if (leaderboardData[stat.userId]) {
        leaderboardData[stat.userId].plays += 1;
        if (stat.won) leaderboardData[stat.userId].wins += 1;
      }
    });

    // Map and Sort the final array
    const leaderboard = safeMemberIds.map(id => ({
      uid: id,
      name: userMap[id] || 'Unknown',
      wins: leaderboardData[id].wins,
      plays: leaderboardData[id].plays,
    })).sort((a, b) => b.wins - a.wins); // Rank by total competitive wins

    return NextResponse.json({ tribe: { id: tribeDoc.id, ...tribeData }, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}