"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";
import { getVotes, castVote } from "@/lib/votes";

type VoteCounts = { votesA: number; votesB: number };
type Option = "A" | "B" | null;

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get or create randomized question order (stored in memory for session)
let randomizedQuestions: typeof questions | null = null;

const getRandomizedQuestions = () => {
  if (!randomizedQuestions) {
    randomizedQuestions = shuffleArray(questions);
  }
  return randomizedQuestions;
};

const QuestionPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();

  // States
  const [id, setId] = useState<string>("");
  const [counts, setCounts] = useState<VoteCounts>({ votesA: 0, votesB: 0 });
  const [userVote, setUserVote] = useState<Option>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Unwrap params Promise
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Use randomized questions
  const allQuestions = getRandomizedQuestions();
  const questionIndex = id ? parseInt(id) - 1 : -1; // Convert to 0-based index
  const question = questionIndex >= 0 ? allQuestions[questionIndex] : null;

  // Question not found or past the end - redirect appropriately
  useEffect(() => {
    if (!id) return; // Wait for id to be set

    if (isNaN(questionIndex) || questionIndex < 0) {
      // Invalid question number - go home
      router.push("/");
    } else if (questionIndex >= allQuestions.length) {
      // Past the last question - go to end page
      router.push("/end");
    } else if (!question) {
      // Other error - go home
      router.push("/");
    }
  }, [question, questionIndex, router, allQuestions.length, id]);

  // Determine winner
  const getWinner = (): Option => {
    if (counts.votesA > counts.votesB) return "A";
    if (counts.votesB > counts.votesA) return "B";
    return null; // tie
  };

  const winner = getWinner();

  // Button color logic - highlight the winner in green
  const getButtonColor = (option: "A" | "B"): string => {
    // Haven't voted yet - show default colors
    if (userVote === null) {
      return option === "A"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-blue-600 hover:bg-blue-700";
    }

    // After voting - highlight the option with most votes in green
    if (winner === option && winner !== null) {
      return "bg-green-600";
    }

    // Not the winner (or it's a tie)
    return "bg-gray-600";
  };

  // Fetch votes on mount and when id changes
  useEffect(() => {
    if (!question) return; // Don't fetch if no question

    let mounted = true;

    const fetchVotes = async () => {
      setLoading(true);
      try {
        // Use the actual question id from the data, not the URL index
        const votes = await getVotes(String(question.id));
        if (mounted) {
          setCounts(votes);
        }
      } catch (err) {
        console.error("Failed to fetch votes:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchVotes();

    return () => {
      mounted = false;
    };
  }, [question]);

  // Check if user has already voted in Firebase (using localStorage as vote lock)
  // Note: We don't set userVote here, so buttons remain clickable
  const hasVotedBefore = () => {
    if (!question) return false;
    const voteKey = `voted_${question.id}`;
    const previousVote = localStorage.getItem(voteKey);
    return previousVote === "A" || previousVote === "B";
  };

  // Handle voting
  const handleVote = async (option: "A" | "B") => {
    if (!question) return;

    // Prevent voting while loading or submitting
    if (submitting || loading) return;

    // Check if already voted before
    if (hasVotedBefore()) {
      // Already voted - just show the results without casting a new vote
      setUserVote(option);
      return;
    }

    // First time voting - submit to Firebase
    setSubmitting(true);

    try {
      // Cast vote to Firebase using actual question id
      await castVote(String(question.id), option);

      // Refetch to get updated counts
      const newCounts = await getVotes(String(question.id));
      setCounts(newCounts);

      // Store vote locally to prevent re-voting in Firebase
      localStorage.setItem(`voted_${question.id}`, option);
      setUserVote(option);
    } catch (err) {
      console.error("Failed to cast vote:", err);
      alert("Something went wrong while voting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate to next question
  const goToNext = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex < allQuestions.length) {
      router.push(`/questions/${nextIndex + 1}`); // Convert back to 1-based
    } else {
      // Finished all questions - go to end page
      router.push("/end");
    }
  };

  // Don't render if no question (will redirect)
  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <h1 className="font-extrabold text-4xl py-3 w-full bg-gradient-to-t from-gray-900 to-black text-white text-center">
        Would you rather...
      </h1>

      {/* Two option buttons */}
      <div className="flex h-screen">
        {/* Option A */}
        <button
          className={`flex-1 ${getButtonColor(
            "A"
          )} text-white text-4xl font-bold flex items-center justify-center p-20 transition-colors`}
          onClick={() => handleVote("A")}
          disabled={submitting || loading}
        >
          {userVote === null ? (
            // Before voting - show option text
            <div className="px-4">{question.optionA}</div>
          ) : userVote === "A" ? (
            // User voted for this option
            <div className="text-center">
              <div className="text-7xl font-bold mb-2">{counts.votesA}</div>
              <div className="text-2xl font-light mb-1">people voted for</div>
              <div className="text-xl font-bold">
                &quot;{question.optionA}&quot;
              </div>
            </div>
          ) : (
            // User voted for the other option
            <div className="text-center">
              <div className="text-lg font-light mb-2">
                You didn&apos;t pick this, but
              </div>
              <div className="text-7xl font-bold mb-2">{counts.votesA}</div>
              <div className="text-lg font-light">voted for</div>
              <div className="text-xl font-bold mt-1">
                &quot;{question.optionA}&quot;
              </div>
            </div>
          )}
        </button>

        {/* Option B */}
        <button
          className={`flex-1 ${getButtonColor(
            "B"
          )} text-white text-4xl font-bold flex items-center justify-center p-20 transition-colors`}
          onClick={() => handleVote("B")}
          disabled={submitting || loading}
        >
          {userVote === null ? (
            // Before voting - show option text
            <div className="px-4">{question.optionB}</div>
          ) : userVote === "B" ? (
            // User voted for this option
            <div className="text-center">
              <div className="text-7xl font-bold mb-2">{counts.votesB}</div>
              <div className="text-2xl font-light mb-1">people voted for</div>
              <div className="text-xl font-bold">
                &quot;{question.optionB}&quot;
              </div>
            </div>
          ) : (
            // User voted for the other option
            <div className="text-center">
              <div className="text-lg font-light mb-2">
                You didn&apos;t pick this, but
              </div>
              <div className="text-7xl font-bold mb-2">{counts.votesB}</div>
              <div className="text-lg font-light">voted for</div>
              <div className="text-xl font-bold mt-1">
                &quot;{question.optionB}&quot;
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Center "OR" circle */}
      <div className="flex w-60 h-60 rounded-full bg-black text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 justify-center items-center pointer-events-none shadow-2xl z-10">
        <h1 className="font-extrabold text-8xl">OR</h1>
      </div>

      {/* Next button - only show after voting */}
      {userVote !== null && (
        <button
          className="bg-white text-black text-6xl font-bold rounded-full py-6 px-12 hover:bg-gray-100 active:bg-gray-200 absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg transition-colors z-20"
          onClick={goToNext}
        >
          Next →
        </button>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded">
          Loading votes...
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
