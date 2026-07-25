import type { GetServerSideProps } from "next";
import Head from "next/head";
import { AuthPage } from "~/components/auth/AuthPage";
import { loadGuestPage } from "~/server/auth/guest";

export const getServerSideProps: GetServerSideProps = loadGuestPage;

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Create account · Tsk Manager</title>
      </Head>
      <AuthPage mode="signup" />
    </>
  );
}
