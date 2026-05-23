// app/api/set-officier-role/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Vérifier que l'utilisateur actuel est admin (optionnel)
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { targetUserId, role } = await req.json();

    // Mettre à jour dans Clerk
    const client = await clerkClient();
    await client.users.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    // Mettre à jour dans la base de données
    await prisma.user.update({
      where: { clerkId: targetUserId },
      data: { role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
