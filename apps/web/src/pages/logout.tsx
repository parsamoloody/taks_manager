import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/workspaces",
    permanent: false,
  },
});

export default function LogoutPage() {
  return null;
}
