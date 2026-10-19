import Link from "next/link";
export default function NotFound() {
  return (
    <main className="bg-wash flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-teal-700">404</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">That page is not part of your twin</h1>
        <Link href="/dashboard" className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Back to overview</Link>
      </div>
    </main>
  );
}
