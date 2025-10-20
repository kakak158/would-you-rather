"use client";
import { useRouter } from "next/navigation";
import React from "react";

const EndScreen = () => {
  const router = useRouter();
  return (
    <>
      <div
        className="min-h-screen bg-cover bg-center text-center text-white p-10"
        style={{ backgroundImage: "url('/images/would-you-rather.png')" }}
      >
        <h1 className="text-9xl font-extrabold">
          You finished all the questions?!
        </h1>
        <h2 className="text-4xl italic">
          Well done! Go back to the home page, or relax!
        </h2>

        <div className="animate-teeter absolute top-80/100 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <button
            className="bg-white text-black text-6xl italic font-bold rounded-4xl py-15 px-30 hover:bg-gray-100 active:bg-gray-200"
            onClick={() => router.push("/")}
          >
            Bye!
          </button>
        </div>
      </div>
    </>
  );
};

export default EndScreen;
