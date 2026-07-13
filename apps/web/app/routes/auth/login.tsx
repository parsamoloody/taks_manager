import { AuthPage } from "../../components/auth/AuthPage";

export function meta() {
  return [
    { title: "Sign in to TaskFlow" },
    {
      name: "description",
      content: "Sign in to TaskFlow and continue organizing your work.",
    },
  ];
}

export default function LoginRoute() {
  return <AuthPage mode="login" />;
}
