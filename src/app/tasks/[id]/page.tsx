"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TaskDetailRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tasks");
  }, [router]);

  return null;
}
