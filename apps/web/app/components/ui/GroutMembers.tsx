import { Avatar } from "./Avatar";

type GroupUser = {
    id: string;
    avatar: string | null;
    name: string;
}

interface GroupMembersProps {
    members: GroupUser[];
}

export function GroupMembers({ members }: GroupMembersProps) {
    return <div className="flex items-center">
        {members.map((u, index) => (
            <div
                key={u.id}
                className={index > 0 ? "-ml-5" : ""}
            >
                <Avatar
                    name={u.name}
                    src={u.avatar ? u.avatar : "/assets/user/user.png"}
                    size="sm"
                    fullRound
                />
            </div>
        ))}
    </div>
}
