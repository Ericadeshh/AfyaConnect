// src/app/payments/history/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const payments = useQuery(
    api.payments.getUserPayments,
    user ? { userId: user._id } : "skip",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <Button onClick={() => router.push("/payments")}>
          Make New Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Your payment history and status</CardDescription>
        </CardHeader>
        <CardContent>
          {!payments ? (
            <div className="text-center py-8">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments found
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        KES {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.paymentType} • {payment.reference}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(new Date(payment.createdAt))}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {payment.status}
                      </span>
                      {payment.mpesaReceiptNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Receipt: {payment.mpesaReceiptNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
