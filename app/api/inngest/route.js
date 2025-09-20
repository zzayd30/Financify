import { inngest } from "@/lib/inngest/client";
import { CheckBudgetAlert, generateMonthlyReport, processRecurringTransaction, triggeringRecurringTransactions } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        CheckBudgetAlert,
        triggeringRecurringTransactions,
        processRecurringTransaction,
        generateMonthlyReport
    ],
    logLevel: "info",
});