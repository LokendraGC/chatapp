import { isAuthorized } from "@/lib/isAuthorized";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await isAuthorized();
      if (user) {
        setEmail(user.email);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { email, loading };
};

