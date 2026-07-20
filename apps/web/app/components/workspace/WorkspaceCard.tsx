// app/components/workspace/WorkspaceCard.tsx
import { Link, useFetcher } from "react-router";
import { Avatar } from "~/components/ui/Avatar";
import { GroupMembers } from "~/components/ui/GroutMembers";
import type { Workspace } from "~/lib/api/workspace";
interface WorkspaceCardProps {
    workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
    const fetcher = useFetcher();
    const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("workspaceId") === workspace.id;
    const members = workspace.members.map(({ user }) => ({
        id: user.id,
        avatar: user.avatar,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "User",
    }));
    return (
        <div
            className={`group relative rounded-lg border border-white/10 bg-white/5 p-5 transition hover:border-sky-400/30 hover:bg-white/10 ${isDeleting ? "pointer-events-none opacity-40" : ""
                }`}
        >
            <Link to={`/workspaces/${workspace.id}`} className="block">
                <div className="flex items-start justify-between">
                    <Avatar name={workspace.name} src={workspace.logo} size="lg" />
                    <GroupMembers members={members} />
                </div>

                <h3 className="mt-4 truncate text-base font-semibold text-white">
                    {workspace.name}
                </h3>
            </Link>
        </div>
    );
}
