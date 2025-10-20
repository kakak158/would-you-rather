// src/lib/votes.ts
import type { DocumentData } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";

/**
 * Ensure the votes document exists, then return counts.
 * id is a string (use question id as string).
 */
export async function getVotes(
  id: string
): Promise<{ votesA: number; votesB: number }> {
  const ref = doc(db, "votes", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // create it with initial values
    await setDoc(ref, { votesA: 0, votesB: 0 });
    return { votesA: 0, votesB: 0 };
  }

  const data = snap.data() as DocumentData;
  return {
    votesA: typeof data.votesA === "number" ? data.votesA : 0,
    votesB: typeof data.votesB === "number" ? data.votesB : 0,
  };
}

/**
 * Atomically increment the vote for option "A" or "B".
 * Uses updateDoc with increment so concurrent votes are safe.
 */
export async function castVote(id: string, option: "A" | "B"): Promise<void> {
  const ref = doc(db, "votes", id);

  // Ensure the document exists (create if necessary) in a transaction
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(ref, { votesA: 0, votesB: 0 });
    }
    tx.update(ref, { [option === "A" ? "votesA" : "votesB"]: increment(1) });
  });
}
