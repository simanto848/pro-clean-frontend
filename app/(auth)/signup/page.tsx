"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, ShieldCheck, Sparkles } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/services");
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/signup", values);
      
      if (res.data.success) {
        toast.success("Account created! Please verify your email.");
        setUser(res.data.data.user);
        
        if (res.data.data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/verify-email");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
               <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 mb-4 text-sm font-medium text-primary">
                <Sparkles className="mr-1 h-4 w-4" /> Get Started
              </span>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Create an account</h2>
              <p className="text-sm text-muted-foreground">
                Join ProClean to book and manage premium home care services.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <Input 
                    id="name" 
                    className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="John Doe" 
                    {...form.register("name")} 
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email address</Label>
                 <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input 
                    id="email" 
                    className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="name@example.com" 
                    {...form.register("email")} 
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="••••••••" 
                    {...form.register("password")} 
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>



              <Button className="w-full mt-2 rounded-xl h-12 text-base font-medium shadow-md transition-all hover:scale-[1.02]" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

       {/* Image Side */}
       <div className="hidden lg:block relative w-0 flex-1 bg-muted">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/auth-side.png"
          alt="Premium luxury interior"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium drop-shadow-lg text-white">
              “ProClean is the gold standard. Reliable, trustworthy, and the exact luxury service we needed.”
            </p>
            <footer className="text-sm font-medium text-white/80 drop-shadow">
              — Mark Anderson
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
