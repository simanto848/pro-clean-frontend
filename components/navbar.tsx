"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles, UserCircle } from "lucide-react";
import api from "@/lib/api";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            <span className="text-primary">Pro</span>
            <span className="text-foreground">Clean</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/services">
              <Button variant="ghost" className="text-sm font-medium">Services</Button>
            </Link>
          {isAuthenticated && user ? (
            <>
              {user.role === 'admin' ? (
                <Link href="/admin">
                  <Button variant="ghost" className="text-sm font-medium">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/bookings">
                  <Button variant="ghost" className="text-sm font-medium">My Bookings</Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" size="icon" title="Profile" className="rounded-full">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full px-5">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
