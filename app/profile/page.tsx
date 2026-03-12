"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Mail, Lock, Shield, Loader2, Save, KeyRound, Eye, EyeOff, AlertTriangle, ShieldCheck } from "lucide-react";

import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, setUser } = useAuthStore();

  // Profile name
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Email change OTP flow
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailChangeStep, setEmailChangeStep] = useState<"idle" | "otp-sent" | "verifying">("idle");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a name");
      return;
    }
    try {
      setProfileLoading(true);
      const res = await api.patch("/auth/update-me", { name: name.trim() });
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success("Name updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Please enter the new email address");
      return;
    }
    try {
      setEmailLoading(true);
      const res = await api.post("/auth/request-email-change", { newEmail: newEmail.trim() });
      if (res.data.success) {
        toast.success(`OTP sent to ${newEmail}`);
        setEmailChangeStep("otp-sent");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request email change");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      setEmailLoading(true);
      setEmailChangeStep("verifying");
      const res = await api.post("/auth/verify-email-change", { otp: emailOtp.trim() });
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success("Email changed successfully!");
        setNewEmail("");
        setEmailOtp("");
        setEmailChangeStep("idle");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
      setEmailChangeStep("otp-sent");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    try {
      setPasswordLoading(true);
      const res = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.data.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isInitialized || !isAuthenticated || !user) return null;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            My <span className="text-primary">Profile</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your account details and security settings.
          </p>
        </div>

        {/* Account Banner */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border bg-primary/5">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-lg truncate">{user.name}</p>
            <p className="text-muted-foreground text-sm truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.isVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <button
                onClick={() => router.push("/verify-email")}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3 w-3" />
                Unverified — Click to verify
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
              <Shield className="h-3 w-3" />
              {user.role}
            </span>
          </div>
        </div>

        {/* Profile Details Card */}
        <Card className="shadow-lg shadow-primary/5 border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />
              Profile Details
            </CardTitle>
            <CardDescription>Update your name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-5 w-5" /> Save Name</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Email Card */}
        <Card className="shadow-lg shadow-primary/5 border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-primary" />
              Change Email
            </CardTitle>
            <CardDescription>
              Current email: <span className="font-medium text-foreground">{user.email}</span>. 
              An OTP will be sent to the new email for verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailChangeStep === "idle" ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="text-foreground/80">New Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="pl-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                      placeholder="new@email.com"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-12 rounded-xl text-base font-medium border-primary/20 hover:bg-primary/5 transition-all"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending OTP...</>
                  ) : (
                    <><Mail className="mr-2 h-5 w-5" /> Send Verification OTP</>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-5">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                  OTP sent to <span className="font-medium text-primary">{newEmail}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailOtp" className="text-foreground/80">Enter OTP</Label>
                  <Input
                    id="emailOtp"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12 text-center text-xl tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={() => {
                      setEmailChangeStep("idle");
                      setEmailOtp("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl shadow-md shadow-primary/20"
                    disabled={emailLoading || emailOtp.length !== 6}
                  >
                    {emailLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                    ) : (
                      <><ShieldCheck className="mr-2 h-5 w-5" /> Verify & Update</>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-lg shadow-primary/5 border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <KeyRound className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-foreground/80">Current Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 pr-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground/80">New Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm New Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showNew ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors rounded-xl h-12"
                    placeholder="••••••••"
                  />
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-destructive mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full h-12 rounded-xl text-base font-medium border-primary/20 hover:bg-primary/5 transition-all"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Changing...</>
                ) : (
                  <><KeyRound className="mr-2 h-5 w-5" /> Change Password</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
