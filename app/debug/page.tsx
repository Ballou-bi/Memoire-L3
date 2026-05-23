// app/debug/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function DebugPage() {
  const { userId, sessionClaims } = await auth();

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Debug Authentification</h1>
      <pre>
        {JSON.stringify(
          {
            userId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: (sessionClaims?.publicMetadata as any)?.role,
            allMetadata: sessionClaims?.publicMetadata,
            sessionClaims,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
