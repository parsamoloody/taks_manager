import type { AppProps } from "next/app";
import Head from "next/head";
import { AppHeader } from "~/components/layout/AppHeader";
import type { BasePageProps } from "~/types/page";
import "~/styles/globals.css";

export default function App({ Component, pageProps }: AppProps<BasePageProps>) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020617" />
      </Head>
      <AppHeader user={pageProps.user ?? null} />
      <Component {...pageProps} />
    </>
  );
}
