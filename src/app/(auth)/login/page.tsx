import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "./AuthForm";

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/"); 
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-background">
      {/* Ambient background blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="z-10 w-full max-w-md glass p-10 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            WatchEX.tech
          </h1>
          <p className="text-gray-400 mt-2 font-subheading uppercase tracking-wider">
            Secure Authentication
          </p>
        </div>
        
        <AuthForm />
      </div>
    </main>
  );
}
