// src/app/payments/page.tsx
"use client";

import { MpesaPayment } from "@/components/payments/MpesaPayment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

export default function PaymentsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

      <Tabs defaultValue="pay" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pay">Make Payment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pay">
          <div className="grid md:grid-cols-2 gap-6">
            <MpesaPayment
              paymentType="booking"
              description="Pay for referral services"
              showAmountSelector={true}
            />

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
                <CardDescription>Common payment scenarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Referral Fee</h3>
                  <p className="text-sm text-gray-500">
                    Standard referral processing fee
                  </p>
                  <p className="text-lg font-bold mt-2">KES 200</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Consultation</h3>
                  <p className="text-sm text-gray-500">
                    Specialist consultation fee
                  </p>
                  <p className="text-lg font-bold mt-2">KES 500</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-medium">Emergency</h3>
                  <p className="text-sm text-gray-500">
                    Emergency referral processing
                  </p>
                  <p className="text-lg font-bold mt-2">KES 350</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <a
                  href="/payments/history"
                  className="text-blue-600 hover:underline"
                >
                  View full payment history →
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
