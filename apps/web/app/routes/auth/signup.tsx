import { AuthPage } from "../../components/auth/AuthPage";

export function meta() {
  return [
    { title: "Create your Task Manager account" },
    {
      name: "description",
      content: "Create a Task Manager account and organize your projects with ease.",
    },
  ];
}

export default function SignupRoute() {
  return <AuthPage mode="signup" />;
}
