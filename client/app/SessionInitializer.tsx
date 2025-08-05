"use client";

import { useInitSession } from "@/components/shared/api/hooks/useCurrentUser";

export default function SessionInitializer() {
  useInitSession();
  return null;
}
