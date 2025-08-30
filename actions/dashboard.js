"use server";

import { db } from "@/lib/prisma";
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
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await db.user.findUnique({
            where: { clerUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const balanceFloat = parseFloat(data.balance);
        if (isNaN(balanceFloat)) {
            throw new Error("Invalid balance");
        }

        const existingAccounts = await db.account.findMany({
            where: { userId: user.id },
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        // If the new account should be the default, update existing accounts
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: {
                    isDefault: false,
                },
            });
        }

        const account = await db.account.create({
            data: {
                ...data,
                userId: user.id,
                balance: balanceFloat,
                isDefault: shouldBeDefault,
            },
        });

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
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: { clerUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
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

    return serializedAccount;
}