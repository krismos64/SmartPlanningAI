import { useMemo } from "react";

export const useUserName = (user) => {
  const first_name = useMemo(() => user?.first_name || "", [user]);

  const last_name = useMemo(() => user?.last_name || "", [user]);

  const fullName = useMemo(() => {
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    return user?.email || "Utilisateur inconnu";
  }, [first_name, last_name, user]);

  const initials = useMemo(() => {
    if (first_name && last_name) {
      return `${first_name[0]}${last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  }, [first_name, last_name, user]);

  return {
    first_name,
    last_name,
    fullName,
    initials,
  };
};
