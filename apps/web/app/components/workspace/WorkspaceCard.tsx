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
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                        {workspace.members.length} member{workspace.members.length === 1 ? "" : "s"}
                    </span>
                </div>

                <h3 className="mt-4 truncate text-base font-semibold text-white">
                    {workspace.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                    Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                </p>
            </Link>

            <fetcher.Form method="post" className="absolute right-4 top-4">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <button
                    type="submit"
                    onClick={(e) => {
                        if (!confirm(`Delete "${workspace.name}"? This can't be undone.`)) {
                            e.preventDefault();
                        }
                    }}
                    aria-label={`Delete ${workspace.name}`}
                    className="hidden rounded-full p-1.5 text-slate-400 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-300 group-hover:opacity-100 sm:block"
                >
                    🗑
                </button>
            </fetcher.Form>
        </div>
    );
}