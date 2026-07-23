import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { accommodationApi } from "@/lib/api/accommodation";

export const metadata: Metadata = {
  title: "Student Accommodation in Hungary",
  description: "Dorms, studios, and shared apartments for international students across Hungary.",
};

export const revalidate = 120;

interface Props {
  searchParams: Promise<{ page?: string; search?: string; type?: string; city?: string }>;
}

const types = ["dormitory", "studio", "shared-apartment", "private-apartment", "homestay"];

export default async function AccommodationPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  let listings: Awaited<ReturnType<typeof accommodationApi.list>>["data"] = [];
  let meta: Awaited<ReturnType<typeof accommodationApi.list>>["meta"] = undefined;
  let loadFailed = false;

  try {
    const res = await accommodationApi.list({
      page,
      limit: 12,
      search: params.search,
      type: params.type,
      "location.city": params.city,
      sort: "-createdAt",
    });
    listings = res.data;
    meta = res.meta;
  } catch {
    loadFailed = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Student Accommodation</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Dorms, studios, and shared apartments across Hungary — filtered for international students.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/accommodation">
        <input type="search" name="search" defaultValue={params.search} placeholder="Search listings..." className="input max-w-xs" />
        <select name="type" defaultValue={params.type || ""} className="input max-w-[180px]">
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.replace("-", " ")}
            </option>
          ))}
        </select>
        <input type="text" name="city" defaultValue={params.city} placeholder="City" className="input max-w-[160px]" />
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {loadFailed && (
        <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          We couldn't load listings right now. Please try again shortly.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link key={listing._id} href={`/accommodation/${listing.slug}`}>
            <Card hoverable className="h-full overflow-hidden !p-0">
              <div className="relative aspect-video">
                {listing.images[0] ? (
                  <Image
                    src={listing.images[0].url}
                    alt={listing.images[0].alt || listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-snug">{listing.title}</p>
                  <Badge variant="blue">{listing.type.replace("-", " ")}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{listing.location.city}</p>
                <p className="mt-3 text-sm font-medium text-brand-orange">
                  {listing.price.amount.toLocaleString()} {listing.price.currency}/{listing.price.period}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!loadFailed && listings.length === 0 && (
        <p className="mt-12 text-center text-slate-500">No listings match your filters.</p>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/accommodation", query: { ...params, page: p } }}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                p === meta!.page ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
