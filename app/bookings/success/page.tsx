"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [countdown, setCountdown] = useState(8);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  // Call backend to verify Stripe payment and mark booking as paid
  useEffect(() => {
    if (!bookingId) {
      setVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.get(`/bookings/success?bookingId=${bookingId}`);
        if (res.data.success) {
          setVerified(true);
        }
      } catch (err) {
        console.error("Payment verification failed:", err);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [bookingId]);

  // Auto-redirect countdown
  useEffect(() => {
    if (verifying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/bookings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, verifying]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card border shadow-2xl shadow-primary/10 rounded-3xl p-8 md:p-12 text-center relative z-10"
      >
        {verifying ? (
          <div className="py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying payment...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2 
              }}
              className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            >
              Payment Successful!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg mb-2"
            >
              Thank you for choosing ProClean. Your professional cleaner is being scheduled.
            </motion.p>

            {verified && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-6"
              >
                ✓ Payment verified and booking confirmed
              </motion.p>
            )}

            {bookingId && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-block px-4 py-2 rounded-lg bg-muted text-xs font-mono mb-8"
              >
                Ref: {bookingId}
              </motion.div>
            )}

            <div className="space-y-4">
              <Button 
                onClick={() => router.push("/bookings")} 
                className="w-full h-12 text-lg rounded-xl group shadow-md shadow-primary/20"
              >
                Go to My Bookings
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push("/")} 
                className="w-full h-12 text-lg rounded-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Redirecting to dashboard in <span className="font-bold text-foreground">{countdown}s</span>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
