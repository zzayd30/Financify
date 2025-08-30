import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
    try {
        const user = await currentUser();
        if (!user) return null;

        const existingUser = await db.user.findUnique({
            where: { clerUserId: user.id },
        });

        if (existingUser) return existingUser;

        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

        const newUser = await db.user.create({
            data: {
                clerUserId: user.id,
                name: fullName,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0]?.emailAddress || "",
            },
        });

        return newUser;

    } catch (error) {
        console.error("❌ Error in checkUser:", error);
        return null;
    }
};
