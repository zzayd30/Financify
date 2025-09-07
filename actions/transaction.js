"use server";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber()
})

export async function createTransaction(data) {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("User not authenticated");
        }

        // Create a mock request object for server actions
        const headersList = await headers();
        const req = {
            ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1',
            method: 'POST',
            url: '/api/transaction',
            headers: Object.fromEntries(headersList.entries())
        };

        try {
            const decision = await aj.protect(req, {
                userId,
                requested: 1,
            });

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    const { remaining, reset } = decision.reason;
                    console.error({
                        code: "RATE_LIMIT_EXCEEDED",
                        details: {
                            remaining,
                            resetInSeconds: reset,
                        }
                    });
                    throw new Error("Too many requests. Please try again later.");
                }
                throw new Error("Request blocked by security policy.");
            }
        } catch (arcjetError) {
            // Only continue if it's an Arcjet service error, not a rate limit
            if (arcjetError.message.includes("Too many requests")) {
                throw arcjetError; // Re-throw rate limit errors to block the transaction
            }
            console.warn("Arcjet protection failed (service error):", arcjetError.message);
            // Continue with the function only for service errors
        }

        const user = await db.user.findUnique({
            where: { clerUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            },
        });

        if (!account) {
            throw new Error("Account not found");
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                },
            });

            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: newBalance },
            });

            return newTransaction;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);
        return { success: true, data: serializeAmount(transaction) };

    } catch (error) {
        throw new Error(error.message);
    }
}

function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate);

    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1);
            break;
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    return date;
}
export async function scanReceipt(file) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const arrayBuffer = await file.arrayBuffer();

        const base64String = Buffer.from(arrayBuffer).toString('base64');

        const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type,
                },
            },
            prompt,
        ]);
        const response = await result.response;
        const text = response.text;
        const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim();

        try {
            const data = JSON.parse(cleanedText);
            return {
                amount: parseFloat(data.amount),
                date: new Date(data.date),
                description: data.description,
                category: data.category,
                merchantName: data.merchantName,
            }
        } catch (error) {
            console.error("Error parsing receipt:", error);
            throw new Error("Could not extract data from receipt. Please enter details manually.");
        }

    } catch (error) {
        console.error("Error scanning receipt:", error);

        // Handle specific API errors
        if (error.status === 429) {
            throw new Error("API rate limit exceeded. Please wait a moment and try again.");
        }

        if (error.status === 401) {
            throw new Error("API authentication failed. Please check your API key.");
        }

        if (error.status === 400) {
            throw new Error("Invalid file format. Please upload a clear image of your receipt.");
        }

        // Generic error for other cases
        throw new Error("Could not scan receipt. Please try again later or enter details manually.");
    }
}