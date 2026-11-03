// src/app/admin/(dashboard)/reviews/page.tsx – Admin Reviews Moderation
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import ReviewsListClient, { ReviewRow } from "@/components/admin/reviews/ReviewsListClient";

export const metadata = {
  title: "Reviews Moderation – MAHIRAANI Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminReviewsPage() {
  await connection();

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      order: {
        select: {
          id: true,
          reference: true,
          customerName: true,
          customerPhone: true,
          fulfilmentStatus: true,
        },
      },
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">Reviews &amp; Ratings</h1>
        <p className="text-xs text-stone-500 mt-1">
          Moderate verified buyer feedback. Only approved reviews appear publicly on storefront product pages.
        </p>
      </div>

      <ReviewsListClient initialReviews={JSON.parse(JSON.stringify(reviews)) as ReviewRow[]} />
    </div>
  );
}

