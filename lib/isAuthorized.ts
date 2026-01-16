"use server";

import { cookies } from "next/headers";

export async function isAuthorized() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session");

  if (!userSession) {
    return null;
  }

  try {
    const user = JSON.parse(userSession.value);
    return user;
  } catch (error) {
    return null;
  }
}
  