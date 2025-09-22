"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };
    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    return serialized
};

export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        // Get request data for ArcJet
        const req = await request();

        // Check rate limit
        const decision = await aj.protect(req, {
            userId,
            requested: 1, // Specify how many tokens to consume
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                throw new Error("Too many requests. Please try again later.");
            }

            throw new Error("Request blocked");
        }

        const user = await db.user.findUnique({
            where: { clerUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if (isNaN(balanceFloat)) {
            throw new Error("Invalid balance amount");
        }

        // Check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where: { userId: user.id },
        });

        // If it's the first account, make it default regardless of user input
        // If not, use the user's preference
        const shouldBeDefault =
            existingAccounts.length === 0 ? true : data.isDefault;

        // If this account should be default, unset other default accounts
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        // Create new account
        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault, // Override the isDefault based on our logic
            },
        });

        // Serialize the account before returning
        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return { success: true, data: serializedAccount };
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getUserAccounts() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "User not authenticated", redirect: "/sign-in" };
    }
    const user = await db.user.findUnique({
        where: { clerUserId: userId },
    });

    if (!user) {
        return { success: false, error: "User not found", redirect: "/sign-in" };
    }

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { transactions: true }
            }
        }
    });

    const serializedAccount = accounts.map(serializeTransaction);

    return { success: true, data: serializedAccount };
}

export async function getDashboardData() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "User not authenticated", redirect: "/sign-in" };
    }

    const user = await db.user.findUnique({
        where: { clerUserId: userId },
    });

    if (!user) {
        return { success: false, error: "User not found", redirect: "/sign-in" };
    }

    const transactions = await db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
    });

    return { success: true, data: transactions.map(serializeTransaction) };
}