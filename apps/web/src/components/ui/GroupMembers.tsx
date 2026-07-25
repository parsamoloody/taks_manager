import { Avatar } from "./Avatar";

type GroupUser = {
  id: string;
  avatar: string | null;
  name: string;
};

interface GroupMembersProps {
  members: GroupUser[];
  max?: number;
  size?: "xs" | "sm";
  label?: string;
}

export function GroupMembers({
  members,
  max = 4,
  size = "sm",
  label = `${members.length} member${members.length === 1 ? "" : "s"}`,
}: GroupMembersProps) {
  const visibleMembers = members.slice(0, max);
  const remaining = members.length - visibleMembers.length;
  const overlap = size === "xs" ? "-ml-2" : "-ml-2.5";

  if (members.length === 0) return null;

  return (
    <div className="flex items-center" aria-label={label}>
      {visibleMembers.map((member, index) => (
        <div
          key={member.id}
          title={member.name}
          className={index > 0 ? overlap : ""}
        >
          <Avatar
            name={member.name}
            src={member.avatar}
            size={size}
            fullRound
          />
        </div>
      ))}
      {remaining > 0 ? (
        <span
          title={`${remaining} more member${remaining === 1 ? "" : "s"}`}
          className={`${size === "xs" ? "h-6 min-w-6 text-[9px]" : "h-8 min-w-8 text-[10px]"} ${overlap} flex items-center justify-center rounded-full border border-slate-800 bg-slate-700 px-1 font-semibold text-slate-200 ring-1 ring-white/10`}
        >
          +{remaining}
        </span>
      ) : null}
    </div>
  );
}
