import Head from "next/head";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page not found · Tsk Manager</title>
      </Head>
      <main
        id="main-content"
        className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 text-white"
      >
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
            404
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            This page does not exist
          </h1>
          <p className="mt-3 text-slate-400">
            The link may be outdated, or the page may have moved.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Return home
          </Link>
        </div>
      </main>
    </>
  );
}
