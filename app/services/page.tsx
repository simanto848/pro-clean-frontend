"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, DollarSign } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  image?: string;
}

const CATEGORIES = ["All", "Standard Cleaning", "Deep Cleaning", "Move-In/Move-Out", "Post-Construction", "Other"];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/services");
        if (res.data.success) {
          setServices(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const hasValidImage = (img?: string) => img && img !== 'default-service.jpg' && (img.startsWith('/') || img.startsWith('http'));

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col mb-12 space-y-4 items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Professional <span className="text-primary">Cleaning</span> Services
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Choose from our selection of premium home care packages. Vetted professionals, spotless results.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {CATEGORIES.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`rounded-full px-6 transition-all ${
              selectedCategory === category 
                ? "shadow-md shadow-primary/20" 
                : "hover:border-primary/30"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl bg-muted/20">
          No services available at the moment.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services
            .filter(service => selectedCategory === "All" || service.category === selectedCategory)
            .map((service) => (
            <motion.div key={service._id} variants={itemVariants}>
              <Card className="flex flex-col h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border shadow-md bg-card overflow-hidden rounded-2xl group">
                {hasValidImage(service.image) ? (
                  <div className="w-full h-48 relative overflow-hidden bg-muted">
                    <Image 
                      src={service.image!} 
                      alt={service.name} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                       <span className="text-xs font-semibold uppercase tracking-wider text-white bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        {service.category || "Standard Cleaning"}
                      </span>
                    </div>
                  </div>
                ) : null}
                <CardHeader className={`bg-muted/10 pb-6 border-b ${hasValidImage(service.image) ? 'pt-4' : ''}`}>
                  {!hasValidImage(service.image) && (
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {service.category || "Standard Cleaning"}
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-2xl line-clamp-1">{service.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      {service.price}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-5 h-5 text-primary" />
                      {service.duration} mins
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <CardDescription className="line-clamp-6 text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-4 pb-6 px-6">
                  <Link href={`/services/${service._id}`} className="w-full">
                    <Button variant="default" size="lg" className="w-full group rounded-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                      Select Package
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
