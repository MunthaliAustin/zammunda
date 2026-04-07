"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building, Shield, Truck } from "lucide-react";
import { useAuth, useCart } from "@/app/providers";
import { orderService } from "@/lib/order-service";
import { paymentService } from "@/lib/payment-service";
import { formatPricePerUnit, formatQuantityWithUnit } from "@/lib/units";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

const MALAWI_CITIES = ["Lilongwe", "Blantyre", "Mzuzu"] as const;

const routeShippingFee = (originCity?: string, destinationCity?: string): number => {
  if (!originCity || !destinationCity) return 10000;
  if (originCity === destinationCity) return 5000;
  const routeKey = [originCity, destinationCity].sort().join("-");
  if (routeKey === "Blantyre-Mzuzu") return 15000;
  if (routeKey === "Blantyre-Lilongwe") return 10000;
  if (routeKey === "Lilongwe-Mzuzu") return 10000;
  return 10000;
};

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cart, cartCount } = useCart();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.first_name || "",
    lastName: "",
    phone: user?.phone_number || "",
    email: user?.email || "",
    address1: "",
    address2: "",
    city: "Lilongwe",
    region: "Central",
    postalCode: "",
    country: "Malawi",
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const paymentState = searchParams.get("payment");
    if (paymentState === "failed" || paymentState === "cancelled") {
      alert("Your PayChangu payment was not completed. Your cart is still available so you can try again.");
    }
  }, [searchParams]);

  const displayName = user?.first_name?.trim() || "Customer";
  const userNameParts = useMemo(() => displayName.split(/\s+/).filter(Boolean), [displayName]);
  const buyerFirstName = userNameParts[0] || "Customer";
  const buyerLastName = userNameParts.slice(1).join(" ") || "";

  const shippingBreakdown = useMemo(
    () => cart.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      originCity: item.product.city,
      fee: routeShippingFee(item.product.city, shippingAddress.city),
    })),
    [cart.items, shippingAddress.city]
  );

  const shippingTotal = useMemo(
    () => shippingBreakdown.reduce((sum, item) => sum + item.fee, 0),
    [shippingBreakdown]
  );

  const grandTotal = cart.totalAmount + shippingTotal;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <p className="text-xl text-gray-600 mb-4">Please sign in to proceed with checkout.</p>
        <button
          onClick={() => router.push(`/signin?redirect=${encodeURIComponent("/checkout")}`)}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Sign In
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
        <button
          onClick={() => router.push("/products")}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition shadow-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.firstName.trim()) newErrors.firstName = "First name is required";
    if (!shippingAddress.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!shippingAddress.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?265\d{9}$|^\d{9}$/.test(shippingAddress.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid Malawian phone number";
    }
    if (!shippingAddress.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!shippingAddress.address1.trim()) newErrors.address1 = "Street address is required";
    if (!shippingAddress.city.trim()) newErrors.city = "City is required";
    if (!shippingAddress.region.trim()) newErrors.region = "Region is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    setPlacingOrder(true);
    const createdOrders: Awaited<ReturnType<typeof orderService.createOrder>>[] = [];

    try {
      for (const item of cart.items) {
        const createdOrder = await orderService.createOrder({
          skuCode: item.skuCode || "",
          price: item.price,
          quantity: item.quantity,
          sellerId: item.sellerId || "",
          userId: user.user_id,
          userDetails: {
            email: shippingAddress.email,
            firstName: shippingAddress.firstName || buyerFirstName,
            lastName: shippingAddress.lastName || buyerLastName,
          },
        });

        createdOrders.push(createdOrder);
      }

      const checkoutSession = await paymentService.createCheckoutSession({
        orders: createdOrders.map((order) => ({
          orderNumber: order.orderNumber,
          amount: order.price,
        })),
        totalAmount: grandTotal,
        shippingAmount: shippingTotal,
        currency: "MWK",
        method: "WALLET",
        email: shippingAddress.email,
        firstName: shippingAddress.firstName || buyerFirstName,
        lastName: shippingAddress.lastName || buyerLastName,
        providerReference: `PAYCHANGU_HOSTED_CHECKOUT:${shippingAddress.city}`,
      });

      if (!checkoutSession.checkoutUrl) {
        throw new Error("PayChangu did not return a checkout link.");
      }

      window.location.href = checkoutSession.checkoutUrl;
    } catch (err) {
      if (createdOrders.length > 0) {
        await Promise.allSettled(createdOrders.map((order) => orderService.cancelOrder(order.orderNumber)));
      }

      console.error("Error during checkout:", err);
      alert(err instanceof Error ? err.message : "An error occurred while checking out.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-green-700 hover:text-green-900 transition font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                  <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={shippingAddress.firstName} onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })} className={`w-full px-4 py-3 border ${errors.firstName ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`} placeholder="John" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" value={shippingAddress.lastName} onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })} className={`w-full px-4 py-3 border ${errors.lastName ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`} placeholder="Doe" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} className={`w-full px-4 py-3 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`} placeholder="+265 999 123 456" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={shippingAddress.email} onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })} className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`} placeholder="john@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address <span className="text-red-500">*</span></label>
                  <input type="text" value={shippingAddress.address1} onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })} className={`w-full px-4 py-3 border ${errors.address1 ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`} placeholder="123 Main Street" />
                  {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apartment, suite, etc. (optional)</label>
                  <input type="text" value={shippingAddress.address2} onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition" placeholder="Apt 4B" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                  <select value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} className={`w-full px-4 py-3 border ${errors.city ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`}>
                    {MALAWI_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region <span className="text-red-500">*</span></label>
                  <select value={shippingAddress.region} onChange={(e) => setShippingAddress({ ...shippingAddress, region: e.target.value })} className={`w-full px-4 py-3 border ${errors.region ? "border-red-500" : "border-gray-300"} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition`}>
                    <option value="Central">Central</option>
                    <option value="Northern">Northern</option>
                    <option value="Southern">Southern</option>
                  </select>
                  {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input type="text" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition" placeholder="P.O. Box 123" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input type="text" value={shippingAddress.country} onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition" placeholder="Malawi" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
              <p className="text-sm text-gray-500 mb-6">PayChangu will handle payment method selection. Shipping is calculated from each product city to {shippingAddress.city}.</p>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <img src={item.product.imageUrl || item.product.image || "https://via.placeholder.com/80x80.png?text=Product"} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-gray-500">Qty: {formatQuantityWithUnit(item.quantity, item.product.unitType, item.product.unitLabel)}</p>
                      <p className="text-xs text-gray-500">{formatPricePerUnit(item.price, item.product.unitType, item.product.unitLabel)}</p>
                      <p className="text-sm font-semibold text-green-600">MWK {item.price * item.quantity}</p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <Truck className="w-3.5 h-3.5 mr-1" />
                        {item.product.city || "Unknown city"} to {shippingAddress.city}: MWK {routeShippingFee(item.product.city, shippingAddress.city)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>MWK {cart.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>MWK {shippingTotal}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">MWK {grandTotal}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placingOrder} className="mt-6 w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-green-800 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {placingOrder ? "Preparing PayChangu checkout..." : `Continue to PayChangu - MWK ${grandTotal}`}
              </button>

              <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure checkout powered by PayChangu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
