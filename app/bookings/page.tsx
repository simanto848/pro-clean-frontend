"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, DollarSign, Clock, Receipt, CheckCircle2, ChevronRight } from "lucide-react";

import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

interface Booking {
  _id: string;
  service: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  price: number;
  status: string;
  bookingDate?: string;
  timeSlot?: string;
  createdAt: string;
}

const hasValidImage = (img?: string) => img && img !== 'default-service.jpg' && (img.startsWith('/') || img.startsWith('http'));

export default function MyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my-bookings");
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isInitialized, isAuthenticated, router]);

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "paid":
        return <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</span>;
      case "completed":
        return <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">Completed</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">Cancelled</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
    }
  };

  if (!isInitialized || !isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">My <span className="text-primary">Bookings</span></h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, {user?.name}. Here is a history of all your requested services.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 max-w-4xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl max-w-4xl border border-dashed">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No bookings found</h3>
          <p className="text-muted-foreground mb-6">You haven&apos;t booked any services yet.</p>
          <Link href="/services">
            <Button className="shadow-md shadow-primary/20">Explore Services</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-12 max-w-4xl">
          {(() => {
            const today = new Date();
            today.setHours(0,0,0,0);
            
            const upcoming = bookings.filter(b => b.bookingDate ? new Date(b.bookingDate) >= today : false);
            const past = bookings.filter(b => b.bookingDate ? new Date(b.bookingDate) < today : true);

            const renderList = (list: Booking[], title: string) => {
              if (list.length === 0) return null;

              const handleCancelBooking = async (id: string) => {
                if (!confirm("Are you sure you want to cancel this booking?")) return;
                try {
                  const res = await api.patch(`/bookings/${id}/cancel`, { status: "cancelled" });
                  if (res.data.success) {
                    toast.success("Booking cancelled successfully");
                    setBookings(bookings.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
                  }
                } catch (error) {
                  toast.error("Failed to cancel booking");
                }
              };

              return (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {list.map((booking, index) => (
                      <motion.div
                        key={booking._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-card/50 backdrop-blur border-muted hover:shadow-md hover:shadow-primary/5 transition-all gap-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                            {hasValidImage(booking.service?.image) && (
                              <div className="w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted border relative">
                                <Image 
                                  src={booking.service.image!} 
                                  alt={booking.service.name} 
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold">{booking.service?.name || "Deleted Service"}</h3>
                                <StatusBadge status={booking.status} />
                              </div>
                              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 text-foreground font-medium bg-primary/5 px-2 py-1 rounded">
                                  <CalendarDays className="w-4 h-4 text-primary" />
                                  {booking.bookingDate ? format(new Date(booking.bookingDate), "PPP") : format(new Date(booking.createdAt), "PPP")}
                                  {booking.timeSlot && <span className="text-muted-foreground font-normal ml-1">at {booking.timeSlot}</span>}
                                </span>
                                <span className="flex items-center gap-1.5 flex-shrink-0">
                                  <DollarSign className="w-4 h-4" />
                                  ${booking.price}
                                </span>
                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground flex-shrink-0 flex items-center">
                                  ID: {booking._id.substring(booking._id.length - 8).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                      
                          <div className="flex items-center gap-2 mt-4 sm:mt-0">
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {booking.service && (
                              <Link href={`/services/${booking.service._id}`}>
                                <Button variant="ghost" size="icon" title="View Service" className="opacity-50 hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5"/>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            };

            return (
              <>
                {renderList(upcoming, "Upcoming Cleanings")}
                {renderList(past, "Past History")}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
