"use client";

import { Heart, MessageCircle } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const posts = [
  {
    id: 1,
    author: "@priya_sharma",
    tag: "Festive Edit",
    likes: "1.4k",
    comments: "84",
    caption: "Wore the Mahiraani heirloom set for Diwali festivities. Pure poetry! ✨",
    bgColor: "from-rose-900/80 to-stone-900",
  },
  {
    id: 2,
    author: "@ananya_roy",
    tag: "Modern Art Earrings",
    likes: "2.1k",
    comments: "132",
    caption: "The detail and finish is unbelievable in person. Received countless compliments 👑",
    bgColor: "from-amber-900/80 to-stone-900",
  },
  {
    id: 3,
    author: "@meera.deshmukh",
    tag: "Jaipur Polki",
    likes: "980",
    comments: "45",
    caption: "Obsessed with my bridal chokers from @mahiraani. Pure Jaipur artistry.",
    bgColor: "from-purple-900/80 to-stone-900",
  },
  {
    id: 4,
    author: "@simran_kaur",
    tag: "Everyday Heirlooms",
    likes: "1.8k",
    comments: "98",
    caption: "Elevates even a simple white linen shirt effortlessly. Love it! ❤️",
    bgColor: "from-stone-900 to-rose-950",
  },
];

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-[#FAF8F4] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#6B2737] font-semibold mb-2">
            <InstagramIcon className="w-4 h-4 text-[#B8922A]" />
            <span>@mahiraani on Instagram</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
            As Seen On Our Queens
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            Tag @mahiraani on your special day to be featured in our royal gallery.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${post.bgColor} opacity-90 group-hover:scale-105 transition-transform duration-500`} />
              
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-medium">
                    {post.tag}
                  </span>
                  <InstagramIcon className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
                </div>

                <div>
                  <p className="text-xs italic line-clamp-2 text-stone-200 font-light mb-2">
                    &ldquo;{post.caption}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] border-t border-white/20 pt-2 text-stone-300">
                    <span className="font-semibold text-white">{post.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-stone-300 rounded-full text-xs uppercase tracking-widest text-stone-700 hover:text-stone-900 hover:border-stone-500 transition-colors bg-white shadow-xs"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#6B2737]" />
            <span>Follow Our Journey on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
