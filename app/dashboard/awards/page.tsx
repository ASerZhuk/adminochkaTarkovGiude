import Link from "next/link";

export default function AwardsIndexPage() {
  return (
    <div className="grid gap-4">
      <Link href="/dashboard/awards/raw" className="underline text-blue-600">Награды (Raw)</Link>
      <Link href="/dashboard/awards/items" className="underline text-blue-600">Награды (Items)</Link>
      <Link href="/dashboard/awards/unlocks" className="underline text-blue-600">Награды (Unlocks)</Link>
    </div>
  );
}
