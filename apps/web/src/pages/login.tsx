import type { GetServerSideProps } from "next";
import Head from "next/head";
import { AuthPage } from "~/components/auth/AuthPage";
import { loadGuestPage } from "~/server/auth/guest";

export const getServerSideProps: GetServerSideProps = loadGuestPage;

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign in · Tsk Manager</title>
      </Head>
      <AuthPage mode="login" />
    </>
  );
}
