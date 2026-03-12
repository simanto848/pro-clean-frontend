"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border shadow-xl rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          The payment process was interrupted. No charges were made to your account.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push("/services")} 
            className="w-full h-11"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")} 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Homepage
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
