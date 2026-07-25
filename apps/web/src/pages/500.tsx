import Head from "next/head";
import Link from "next/link";

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>Something went wrong · Tsk Manager</title>
      </Head>
      <main
        id="main-content"
        className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 text-white"
      >
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">
            Error
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            We could not load this page
          </h1>
          <p className="mt-3 text-slate-400">
            Please try again. If the problem continues, check that the API is
            available.
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
