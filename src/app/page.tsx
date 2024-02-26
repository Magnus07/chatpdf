import { Button } from "@/components/ui/button";
import { UserButton, UserProfile, auth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { userId } = auth();
  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-violet-200 to-pink-200">
      <div className="flex space-y-3 flex-col max-w-md text-center">
        <h1 className="text-4xl font-bold">Chat with any PDF</h1>
        <h2 className="text-slate-500">
          Nostrum tenetur amet ea pariatur eligendi enim vero autem animi quae
          optio aspernatur provident sed cum non, corporis qui, consectetur
          quidem? Ut?
        </h2>
        {userId ? (
          <div className="flex flex-row justify-center space-x-5 items-center">
            <UserButton afterSignOutUrl="/" />

            <Link href="/chats">
              <Button>
                Go to chats <LogIn className="ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button>
              Login to get started <LogIn className="ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
