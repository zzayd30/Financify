import { Inngest } from "inngest";

export const inngest = new Inngest({
    id: "financify", name: "Financify", retryFunction: async (attempt) => ({
        delay: Math.pow(2, attempt) * 1000,
        maxAttempts: 2,
    }),
});