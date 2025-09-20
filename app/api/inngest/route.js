import { inngest } from "@/lib/inngest/client";
import { CheckBudgetAlert, processRecurringTransaction, triggeringRecurringTransactions } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        CheckBudgetAlert,
        triggeringRecurringTransactions,
        processRecurringTransaction,
    ],
    logLevel: "info", // Add logging for debugging
});