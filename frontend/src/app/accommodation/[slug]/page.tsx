import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Home, MapPin, Users, Calendar } from "lucide-react";
import { accommodationApi } from "@/lib/api/accommodation";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BookmarkButton } from "@/components/shared/BookmarkButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: listing } = await accommodationApi.getBySlug(slug);
    const title = `${listing.title} — ${listing.location.city}`;
    const description = listing.description.slice(0, 155);
    return {
      title,
      description,
      alternates: { canonical: `/accommodation/${listing.slug}` },
      openGraph: { title, description, images: listing.images[0] ? [{ url: listing.images[0].url }] : [] },
    };
  } catch {
    return { title: "Listing not found" };
  }
}

export default async function AccommodationDetailPage({ params }: Props) {
  const { slug } = await params;
  let listing;
  try {
    ({ data: listing } = await accommodationApi.getBySlug(slug));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Housing", url: "/accommodation" }, { name: listing.title, url: `/accommodation/${listing.slug}` }]} />

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{listing.title}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="blue">{listing.type.replace("-", " ")}</Badge>
          <BookmarkButton targetType="Accommodation" targetId={listing._id} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin size={16} /> {listing.location.address}, {listing.location.city}
        </span>
        <span className="flex items-center gap-1.5">
          <Home size={16} /> {listing.capacity.availableRooms} room(s) available
        </span>
        {listing.capacity.roommates > 0 && (
          <span className="flex items-center gap-1.5">
            <Users size={16} /> {listing.capacity.roommates} roommate(s)
          </span>
        )}
        {listing.availableFrom && (
          <span className="flex items-center gap-1.5">
            <Calendar size={16} /> Available from {new Date(listing.availableFrom).toLocaleDateString()}
          </span>
        )}
      </div>

      {listing.images.length > 0 && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={listing.images[0].url} alt={listing.images[0].alt || listing.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="mt-8 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-brand-orange">
          {listing.price.amount.toLocaleString()} {listing.price.currency}
        </p>
        <span className="text-slate-500">/{listing.price.period}</span>
        {listing.price.utilitiesIncluded && <Badge variant="success">Utilities included</Badge>}
      </div>

      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>{listing.description}</p>
      </div>

      {listing.amenities.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {listing.amenities.map((a) => (
            <Badge key={a}>{a}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
