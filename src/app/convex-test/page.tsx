"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function ConvexTest() {
  // This will error if client isn't working
  const result = useQuery(api.payments.test);

  return (
    <div>
      <h1>Convex Test</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
