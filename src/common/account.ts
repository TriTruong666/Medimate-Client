import type { User } from "@/types/User";

export type SortType = "" | "by_date" | "by_status";

function getStatusRank(user: User): number { //online: 0, offline: 1, inactive: 2
  if (!user.isActive) return 2;
  return user.isOnline ? 0 : 1;
}

export function sortUsers(users: User[], sortType: SortType): User[] {
  if (!users.length || !sortType) return users;

  return [...users].sort((a, b) => {
    if (sortType === "by_date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortType === "by_status") {
      const rankDiff = getStatusRank(a) - getStatusRank(b);
      if (rankDiff !== 0) return rankDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return 0;
  });
}