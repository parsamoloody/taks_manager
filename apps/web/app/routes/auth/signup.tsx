import { AuthPage } from "../../components/auth/AuthPage";

export function meta() {
  return [
    { title: "Create your TaskFlow account" },
    {
      name: "description",
      content: "Create a TaskFlow account and organize your projects with ease.",
    },
  ];
}

export default function SignupRoute() {
  return <AuthPage mode="signup" />;
}
