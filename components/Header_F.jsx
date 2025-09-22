export const runtime = 'nodejs';

import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";

const Header_F = async () => {
  const { userId } = await auth();
  if (userId) {
    console.log("User ID from auth():", userId);
    await checkUser();
  }

  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl pl-4 font-bold flex items-center gap-2">
          <Image
            src={"/logo.png"}
            alt="Financify Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <span>Financify</span>
        </Link>

        <div className="flex items-center pr-4 space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant={"outline"}>
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link
              href="/transaction/create"
              className="flex items-center gap-2"
            >
              <Button>
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant={"outline"}>Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header_F;