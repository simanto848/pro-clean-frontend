"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock, Sparkles, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "Spotless Results",
    description: "Our professional cleaners leave your home gleaming and fresh.",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Secure Booking",
    description: "Payments are processed securely via Stripe. No hidden fees.",
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Instant Confirmation",
    description: "Book and receive email confirmation immediately.",
  },
];

const trustPoints = [
  "100% Satisfaction Guarantee",
  "Vetted & Insured Professionals",
  "Eco-Friendly Products Available",
  "Flexible Rescheduling",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 md:pt-32 lg:pt-40 flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10" />
        <div className="absolute top-1/4 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 blur-[120px] opacity-40 dark:opacity-20">
          <div className="w-[70vw] h-[500px] bg-gradient-to-r from-primary/50 via-violet-500/30 to-blue-500/40 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="container px-4 md:px-6 relative z-10 mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center rounded-full border border-primary/20 px-4 py-1.5 text-sm bg-primary/5 backdrop-blur"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            <span className="font-semibold text-primary mr-1">ProClean</span>
            <span className="text-muted-foreground">• The standard in home care</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto"
          >
            Come home to a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-blue-500">
              spotless sanctuary
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed"
          >
            Professional, reliable, and thorough home cleaning services tailored to your schedule. Book a cleaner in 60 seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link href="/services">
              <Button size="lg" className="w-full sm:w-auto gap-2 rounded-full h-12 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Book a Cleaning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.7, delay: 0.5 }}
             className="mt-16 mx-auto relative rounded-2xl overflow-hidden border bg-background shadow-2xl shadow-primary/10 max-w-5xl"
          >
             <div className="aspect-[21/9] bg-muted relative">
                <Image 
                  src="/proclean-hero.png"
                  alt="Professional Home Cleaning"
                  fill
                  className="object-cover"
                  priority
                />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background/60 p-6 rounded-2xl border backdrop-blur supports-[backdrop-filter]:bg-background/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Why Thousands <span className="text-primary">Trust</span> ProClean
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We hold ourselves to the highest standards so you don&apos;t have to worry.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-primary/5 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{point}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-1 mt-12 text-muted-foreground"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm font-medium">Rated 4.9/5 by 2,000+ customers</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
