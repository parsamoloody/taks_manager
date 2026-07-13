import { AuthPage } from "../../components/auth/AuthPage";

export function meta() {
  return [
    { title: "Sign in to Task Manager" },
    {
      name: "description",
      content: "Sign in to Task Manager and continue organizing your work.",
    },
  ];
}

export default function LoginRoute() {
  return <AuthPage mode="login" />;
}
