# Financify - Your Personal Finance Companion

Financify is a modern, open-source personal finance application built with Next.js, designed to help you track your income, expenses, and overall financial health. With a user-friendly interface and powerful features, Financify empowers you to make informed decisions about your money.

## Features

*   **Transaction Tracking:** Easily record and categorize your income and expenses.
*   **Account Management:** Manage multiple accounts (e.g., checking, savings, credit cards) in one place.
*   **Budgeting:** Set budgets and track your progress towards your financial goals.
*   **Recurring Transactions:** Automate the recording of recurring income and expenses.
*   **Data Visualization:** Gain insights into your spending habits with charts and graphs.
*   **User Authentication:** Securely access your financial data with Clerk authentication.
*   **Receipt Scanning:** Use AI to automatically extract data from your receipts.
*   **Email Notifications:** Receive email alerts for budget overruns and other important events.
*   **Database Persistence:** Store your data securely using PostgreSQL and Prisma.
*   **Rate Limiting:** Protect the application from abuse with Arcjet rate limiting.
*   **Background Tasks:** Schedule and manage background tasks with Inngest.

## Technologies Used

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) - React framework for building performant web applications
    *   [React](https://reactjs.org/) - JavaScript library for building user interfaces
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
    *   [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI primitives
    *   [lucide-react](https://lucide.dev/) - Beautifully simple vector icons
    *   [react-hook-form](https://react-hook-form.com/) - Performant, flexible and extensible forms with easy-to-use validation
    *   [zod](https://zod.dev/) - TypeScript-first schema validation with static type inference
    *   [swr](https://swr.vercel.app/) - React Hooks for Data Fetching
    *   [clsx](https://github.com/lukeed/clsx) - A tiny (239B) utility for constructing `className` strings conditionally
    *   [tailwind-merge](https://github.com/dcastil/tailwind-merge) - Utility to merge Tailwind CSS classes
    *   [react-spinners](https://www.npmjs.com/package/react-spinners) - Loading spinners for React
    *   [sonner](https://sonner.emilkowalski.com/) - An opinionated toast component for React.

*   **Backend:**
    *   [Node.js](https://nodejs.org/) - JavaScript runtime environment
    *   [Prisma](https://www.prisma.io/) - Next-generation ORM
    *   [PostgreSQL](https://www.postgresql.org/) - Open-source relational database
    *   [Clerk](https://clerk.com/) - Authentication and user management
    *   [Resend](https://resend.com/) - Email API for developers
    *   [react-email](https://react.email/) - Build and send emails using React components
    *   [Inngest](https://www.inngest.com/) - Queue system for background tasks
    *   [Arcjet](https://arcjet.com/) - Rate limiting and bot detection

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/zzayd30/Financify.git
    cd Financify
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add the following environment variables:

    ```
    DATABASE_URL="your_postgresql_connection_string"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
    CLERK_SECRET_KEY="your_clerk_secret_key"
    RESEND_API_KEY="your_resend_api_key"
    ARCJET_API_KEY="your_arcjet_api_key"
    NEXT_PUBLIC_ARCJET_BROWSER_KEY="your_arcjet_browser_key"
    ```

    Replace the placeholder values with your actual credentials. You'll need to create accounts on Clerk, Resend, and Arcjet to obtain these keys. You also need to have a PostgreSQL database running and provide the connection string.

4.  **Run Prisma migrations:**

    ```bash
    npx prisma migrate dev
    ```

    This will create the database schema based on the Prisma schema definition.

5.  **Seed the database (optional):**

    ```bash
    npm run seed
    # or
    yarn seed
    # or
    pnpm seed
    ```

    This will populate the database with initial data (e.g., default categories).

6.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

    This will start the Next.js development server, and you can access the application in your browser at `http://localhost:3000`.

## Usage

1.  **Sign up or sign in:**

    Navigate to the sign-up or sign-in page using the links in the header.

2.  **Add accounts:**

    Create new accounts to represent your bank accounts, credit cards, and other financial assets.

3.  **Record transactions:**

    Add income and expense transactions to track your cash flow. Categorize your transactions to gain insights into your spending habits.

4.  **View your dashboard:**

    The dashboard provides an overview of your financial health, including your account balances, recent transactions, and budget progress.

**Example: Adding a transaction**

```javascript
// In app/(main)/transaction/create/page.jsx

import AddTransactionForm from './_components/add-transaction-form';
import { getUserAccounts } from '@/actions/get-user-accounts';
import { getTransaction } from '@/actions/get-transaction';
import { auth } from '@clerk/nextjs';

export default async function AddTransactionPage({ searchParams }) {
  const { userId } = auth();
  const editId = searchParams?.editId;
  const accounts = await getUserAccounts(userId);
  const transaction = editId ? await getTransaction(editId) : null;

  const defaultCategories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Rent",
    "Salary",
    "Investments",
    "Other",
  ];

  return (
    <AddTransactionForm
      accounts={accounts}
      defaultCategories={defaultCategories}
      edit={!!editId}
      initialValues={transaction}
    />
  );
}
```

## Project Structure

```
Financify/
├── app/                # Next.js application directory
│   ├── (auth)/         # Authentication routes (sign-in, sign-up)
│   ├── (main)/         # Main application routes (dashboard, transactions, accounts)
│   ├── api/            # API routes (seed, inngest)
│   ├── lib/            # Utility functions and database connection
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   ├── layout.js       # Root layout component
│   ├── middleware.js   # Middleware for authentication
│   └── not-found.jsx   # Custom 404 page
├── actions/            # Server actions
├── prisma/             # Prisma database schema and migrations
├── public/             # Static assets
├── styles/             # Global styles
├── components.json     # shadcn-ui configuration
├── jsconfig.json       # JavaScript configuration
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```

## Contributing

We welcome contributions to Financify! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Write clear and concise code with appropriate comments.
4.  Test your changes thoroughly.
5.  Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the [MIT License](LICENSE).
