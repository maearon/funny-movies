'use client'

import { useInitSession } from "@/components/shared/api/hooks/useCurrentUser";

const SessionInitializer = () => {
  useInitSession();
  return null;
};

export default SessionInitializer;
