"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Users, Receipt, Briefcase, Plus, Trash2, Edit, DollarSign, ShieldPlus, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Booking {
  _id: string;
  user: { name: string; email: string };
  service: { name: string };
  price: number;
  status: string;
  createdAt: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: { month: number; revenue: number }[];
  popularServices: { name: string; bookings: number }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // New Admin state
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  // New Service state
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("Standard Cleaning");
  const [newServiceImage, setNewServiceImage] = useState("");
  const [newServiceFile, setNewServiceFile] = useState<File | null>(null);

  // Edit Service state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceDesc, setEditServiceDesc] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");
  const [editServiceDuration, setEditServiceDuration] = useState("");
  const [editServiceCategory, setEditServiceCategory] = useState("");
  const [editServiceImage, setEditServiceImage] = useState("");
  const [editServiceFile, setEditServiceFile] = useState<File | null>(null);
  const [isUpdatingService, setIsUpdatingService] = useState(false);

  const previewUrl = useMemo(() => {
    if (newServiceFile) return URL.createObjectURL(newServiceFile);
    return newServiceImage;
  }, [newServiceFile, newServiceImage]);

  const editPreviewUrl = useMemo(() => {
    if (editServiceFile) return URL.createObjectURL(editServiceFile);
    return editServiceImage;
  }, [editServiceFile, editServiceImage]);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (editPreviewUrl && editPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editPreviewUrl);
      }
    };
  }, [editPreviewUrl]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingsRes, servicesRes, analyticsRes, usersRes] = await Promise.all([
          api.get("/bookings"),
          api.get("/services"),
          api.get("/analytics"),
          api.get("/users")
        ]);

        if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
        if (servicesRes.data.success) setServices(servicesRes.data.data);
        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
        if (usersRes.data.success) setUsersList(usersRes.data.data);
      } catch (error) {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isInitialized, isAuthenticated, user, router]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success("Booking status updated");
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status } : b));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCreateService = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newServiceName);
      formData.append("description", newServiceDesc);
      formData.append("price", newServicePrice);
      formData.append("duration", newServiceDuration);
      formData.append("category", newServiceCategory);
      if (newServiceFile) {
        formData.append("image", newServiceFile);
      } else if (newServiceImage) {
        formData.append("image", newServiceImage);
      }

      const res = await api.post("/services", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        toast.success("Service created");
        setServices([...services, res.data.data]);
        // Reset form
        setNewServiceName("");
        setNewServiceDesc("");
        setNewServicePrice("");
        setNewServiceDuration("");
        setNewServiceCategory("Standard Cleaning");
        setNewServiceImage("");
        setNewServiceFile(null);
      }
    } catch (error) {
      toast.error("Failed to create service");
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditServiceName(service.name);
    setEditServiceDesc(service.description);
    setEditServicePrice(service.price.toString());
    setEditServiceDuration(service.duration.toString());
    setEditServiceCategory(service.category);
    setEditServiceImage(service.image || "");
    setEditServiceFile(null);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    setIsUpdatingService(true);
    try {
      const formData = new FormData();
      formData.append("name", editServiceName);
      formData.append("description", editServiceDesc);
      formData.append("price", editServicePrice);
      formData.append("duration", editServiceDuration);
      formData.append("category", editServiceCategory);
      if (editServiceFile) {
        formData.append("image", editServiceFile);
      } else {
        formData.append("image", editServiceImage);
      }

      const res = await api.patch(`/services/${editingService._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        toast.success("Service updated successfully");
        setServices(services.map(s => s._id === editingService._id ? res.data.data : s));
        setEditingService(null);
        setEditServiceFile(null);
      }
    } catch (error) {
      toast.error("Failed to update service");
    } finally {
      setIsUpdatingService(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
      toast.success("User role updated successfully");
      setUsersList(usersList.map(u => u._id === userId ? { ...u, role } : u));
    } catch (error: Error | unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        toast.error((error as any).response?.data?.message || "Failed to update role");
      } else {
        toast.error("Failed to update role");
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      setUsersList(usersList.filter(u => u._id !== userId));
    } catch (error: Error | unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        toast.error((error as any).response?.data?.message || "Failed to delete user");
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await api.delete(`/services/${serviceId}`);
      toast.success("Service deleted");
      setServices(services.filter(s => s._id !== serviceId));
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const res = await api.post("/auth/create-admin", {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword
      });
      if (res.data.success) {
        toast.success("New Admin created successfully");
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
      }
    } catch (error: Error | unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        toast.error((error as any).response?.data?.message || "Failed to create admin");
      } else {
        toast.error("Failed to create admin");
      }
    }
  };

  if (!isInitialized || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col mb-12 space-y-4">
        <div className="flex justify-between items-center pr-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Manage services, view incoming bookings, and oversee operations.
            </p>
          </div>

          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary/50 text-primary shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <ShieldPlus className="w-4 h-4 mr-2" />
              Add Co-Admin
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Co-Admin</DialogTitle>
                <DialogDescription>Create a new administrator account with full platform access.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Full Name" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} />
                <Input type="email" placeholder="Email Address" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                <Input type="password" placeholder="Secure Password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} />
                <Button onClick={handleCreateAdmin} className="w-full mt-4">Create Admin Account</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.totalRevenue || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From successful bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform lifetime requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Offered</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersList.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total accounts on platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>Most booked services by frequency</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.popularServices} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Monthly Trend</CardTitle>
              <CardDescription>Aggregate earnings over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyRevenue} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" tickFormatter={(mt) => `Month ${mt}`} />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => [`$${value}`, "Revenue"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Bookings Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Bookings</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground border border-dashed p-6 rounded-lg text-center">No bookings yet.</p>
            ) : (
              bookings.map((booking) => (
                <Card key={booking._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="font-semibold">{booking.service?.name || "Deleted Service"}</h4>
                    <p className="text-sm text-muted-foreground">{booking.user?.name} ({booking.user?.email})</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(booking.createdAt), "PPp")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium capitalize px-2 py-1 bg-muted rounded">
                      {booking.status}
                    </span>
                    <select
                      className="text-sm border rounded p-1 bg-background"
                      value={booking.status}
                      onChange={(e) => handleUpdateStatus(booking._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Services Management */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Manage Services</h2>
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                  <DialogDescription>Fill in the details for the new service offering.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input placeholder="Service Name" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
                  <Input placeholder="Description" value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} />
                  <select
                    value={newServiceCategory}
                    onChange={e => setNewServiceCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Standard Cleaning">Standard Cleaning</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Move-In/Move-Out">Move-In/Move-Out</option>
                    <option value="Post-Construction">Post-Construction</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex gap-4">
                    <Input type="number" placeholder="Price ($)" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} />
                    <Input type="number" placeholder="Duration (mins)" value={newServiceDuration} onChange={e => setNewServiceDuration(e.target.value)} />
                  </div>

                  <div className="space-y-4 border p-3 rounded-lg bg-muted/20">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">Service Image</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => setNewServiceFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                    </div>
                    {(newServiceFile || (newServiceImage && (newServiceImage.startsWith("/") || newServiceImage.startsWith("http")))) && (
                      <div className="relative h-40 w-full rounded-md overflow-hidden mt-2 border-2 border-primary/20 bg-black/10">
                        <Image
                          src={previewUrl}
                          alt="Service Preview"
                          fill
                          className="object-cover"
                          unoptimized={previewUrl.startsWith('blob:')}
                        />
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreateService} className="w-full">Create Service</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)
            ) : services.length === 0 ? (
              <p className="text-muted-foreground border border-dashed p-6 rounded-lg text-center">No services available.</p>
            ) : (
              services.map(service => (
                <Card key={service._id} className="p-0 overflow-hidden flex flex-col md:flex-row items-stretch md:items-center hover:bg-muted/5 transition-colors">
                  <div className="relative h-48 md:h-32 w-full md:w-56 bg-muted flex items-center justify-center border-b md:border-b-0 md:border-r shrink-0">
                    {service.image && (service.image.startsWith("/") || service.image.startsWith("http")) ? (
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover"
                        unoptimized={service.image.startsWith("blob:")}
                      />
                    ) : (
                      <Briefcase className="w-10 h-10 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 p-5 flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold tracking-tight">{service.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          ${service.price}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 opacity-50" /> {service.duration} mins
                        </span>
                        <span className="hidden md:inline text-border">|</span>
                        <span className="italic opacity-80">{service.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <Dialog open={!!editingService && editingService._id === service._id} onOpenChange={(open) => !open && setEditingService(null)}>
                        <DialogTrigger
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Service</DialogTitle>
                            <DialogDescription>Update the details for "{service.name}"</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input placeholder="Service Name" value={editServiceName} onChange={e => setEditServiceName(e.target.value)} />
                            <Input placeholder="Description" value={editServiceDesc} onChange={e => setEditServiceDesc(e.target.value)} />
                            <select
                              value={editServiceCategory}
                              onChange={e => setEditServiceCategory(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="Standard Cleaning">Standard Cleaning</option>
                              <option value="Deep Cleaning">Deep Cleaning</option>
                              <option value="Move-In/Move-Out">Move-In/Move-Out</option>
                              <option value="Post-Construction">Post-Construction</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="flex gap-4">
                              <Input type="number" placeholder="Price ($)" value={editServicePrice} onChange={e => setEditServicePrice(e.target.value)} />
                              <Input type="number" placeholder="Duration (mins)" value={editServiceDuration} onChange={e => setEditServiceDuration(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                              <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Change Image</p>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={e => setEditServiceFile(e.target.files?.[0] || null)}
                                className="cursor-pointer"
                              />
                            </div>
                            {(editServiceFile || (editServiceImage && (editServiceImage.startsWith("/") || editServiceImage.startsWith("http")))) && (
                              <div className="relative h-40 w-full rounded-md overflow-hidden mt-2 border-2 border-primary/20 bg-black/10">
                                <Image
                                  src={editPreviewUrl}
                                  alt="Service preview"
                                  fill
                                  className="object-cover"
                                  unoptimized={!!editServiceFile || (!!editServiceImage && editServiceImage.startsWith("blob:"))}
                                />
                              </div>
                            )}
                            <Button onClick={handleUpdateService} className="w-full" disabled={isUpdatingService}>
                              {isUpdatingService ? "Updating..." : "Update Service"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="icon" className="h-10 w-10 shrink-0" onClick={() => handleDeleteService(service._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Users Management */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Manage Users</h2>
        </div>

        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)
          ) : usersList.length === 0 ? (
            <p className="text-muted-foreground border border-dashed p-6 rounded-lg text-center">No users found.</p>
          ) : (
            usersList.map((usr) => (
              <Card key={usr._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {usr.name} {usr.role === "admin" && <ShieldPlus className="w-4 h-4 text-primary" />}
                  </h4>
                  <p className="text-sm text-muted-foreground">{usr.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Joined: {format(new Date(usr.createdAt), "PP")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="text-sm border rounded p-2 bg-background font-medium"
                    value={usr.role}
                    onChange={(e) => handleUpdateUserRole(usr._id, e.target.value)}
                    disabled={usr._id === user?._id}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteUser(usr._id)}
                    disabled={usr._id === user?._id}
                    title={usr._id === user?._id ? "Cannot delete yourself" : "Delete user"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
