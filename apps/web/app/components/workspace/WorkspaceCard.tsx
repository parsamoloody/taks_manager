// app/components/workspace/WorkspaceCard.tsx
import { Link, useFetcher } from "react-router";
import { Avatar } from "~/components/ui/Avatar";
import type { Workspace } from "~/lib/api/workspace";
interface WorkspaceCardProps {
    workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
    const fetcher = useFetcher();
    const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("workspaceId") === workspace.id;
    return (
        <div
            className={`group relative rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-sky-400/30 hover:bg-white/10 ${isDeleting ? "pointer-events-none opacity-40" : ""
                }`}
        >
            <Link to={`/workspaces/${workspace.id}`} className="block">
                <div className="flex items-start justify-between">
                    <Avatar name={workspace.name} src={workspace.logo} size="lg" />
                    {
                        <div className="flex items-center">
                            {workspace.members.map((u, index) => (
                                <div
                                    key={u.userId}
                                    className={index > 0 ? "-ml-4" : ""}
                                >
                                    <Avatar
                                        name={workspace.name}
                                        src={"/assets/user/user.png"}
                                        size="sm"
                                        fullRound
                                    />
                                </div>
                            ))}
                        </div>
                    }
                </div>

                <h3 className="mt-4 truncate text-base font-semibold text-white">
                    {workspace.name}
                </h3>
            </Link>
        </div>
    );
}