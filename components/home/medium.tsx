"use client";

import { useEffect, useState } from "react";
import { getMediumPosts } from "@/lib/medium";
import { useTestimonials } from "@/hooks/use-testimonials";
import { MediumCard } from "./medium-card";

export const MediumSection = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getMediumPosts().then(setPosts);
  }, []);

  const {
    currentIndex,
    nextTestimonial,
    prevTestimonial,
  } = useTestimonials(posts);

  if (!posts.length) return null;

  return (
    <section className="py-20">
      <h2 className="text-center text-3xl font-bold mb-10">
        Latest Articles
      </h2>

      <div className="flex items-center justify-center gap-6">
        <button onClick={prevTestimonial}>←</button>

        <MediumCard post={posts[currentIndex]} />

        <button onClick={nextTestimonial}>→</button>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        {posts.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? "bg-blue-500" : "bg-gray-400"
            }`}
          />
        ))}
      </div>

      <div className="text-center mt-6">
        <a
          href="https://medium.com/@sashwatkjain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-500 underline"
        >
          <button className="
              px-6 py-3 rounded-full
              bg-gradient-to-r from-purple-600 to-blue-500
              text-white text-sm font-medium
              shadow-lg shadow-purple-500/20
              hover:shadow-purple-500/40
              hover:scale-105
              transition-all duration-300
              border border-white/10
              backdrop-blur-md
            ">
              View All Articles →
            </button>
        </a>
      </div>
    </section>
  );
};