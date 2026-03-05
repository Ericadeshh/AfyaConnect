// src/components/payments/MpesaPayment.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { usePayments } from "@/hooks/usePayments";

const AMOUNT_OPTIONS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

interface MpesaPaymentProps {
  amount?: number;
  paymentType:
    | "booking"
    | "subscription"
    | "onboarding"
    | "referral_fee"
    | "wallet_topup";
  relatedEntityId?: string;
  relatedEntityType?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  description?: string;
  showAmountSelector?: boolean;
}

export function MpesaPayment({
  amount: presetAmount,
  paymentType,
  relatedEntityId,
  relatedEntityType,
  onSuccess,
  onError,
  description,
  showAmountSelector = true,
}: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(presetAmount || 100);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const { makePayment } = usePayments();

  const getFinalAmount = () => {
    if (useCustomAmount) {
      return parseInt(customAmount) || 0;
    }
    return selectedAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let formattedPhone = phoneNumber.trim();
    formattedPhone = formattedPhone.replace(/\D/g, "");

    if (formattedPhone.length < 10) {
      setStatus("error");
      setMessage(
        "Please enter a valid Safaricom phone number starting with 07...",
      );
      return;
    }

    const amount = getFinalAmount();
    if (amount < 10) {
      setStatus("error");
      setMessage("Minimum amount is KES 10");
      return;
    }

    setIsProcessing(true);
    setStatus("processing");
    setMessage("Initiating payment...");

    try {
      const result = await makePayment(amount, phoneNumber);

      setStatus("success");
      setMessage(
        `STK push sent to ${phoneNumber}. Please check your phone and enter your PIN.`,
      );
      onSuccess?.(result);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Payment failed. Please try again.");
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>M-Pesa Payment</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {showAmountSelector && !presetAmount && (
            <div className="space-y-4">
              <Label>Select Amount (KES)</Label>

              <div className="grid grid-cols-5 gap-2">
                {AMOUNT_OPTIONS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`p-2 text-sm border rounded transition-colors ${
                      !useCustomAmount && selectedAmount === amt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setUseCustomAmount(false);
                      setSelectedAmount(amt);
                    }}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customAmount"
                  checked={useCustomAmount}
                  onChange={(e) => setUseCustomAmount(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="customAmount">Enter custom amount</Label>
              </div>

              {useCustomAmount && (
                <div>
                  <Input
                    type="number"
                    placeholder="Enter amount (KES)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="10"
                    step="10"
                  />
                </div>
              )}

              {!useCustomAmount && (
                <div className="text-lg font-semibold text-center">
                  Amount: KES {selectedAmount}
                </div>
              )}
            </div>
          )}

          {presetAmount && (
            <div className="text-lg font-semibold text-center">
              Amount: KES {presetAmount}
            </div>
          )}

          <div>
            <Label htmlFor="phone" className="block text-sm font-medium mb-2">
              M-Pesa Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="07XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isProcessing}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your Safaricom number starting with 07 (e.g., 0712345678)
            </p>
          </div>

          {status !== "idle" && (
            <div
              className={`p-3 rounded ${
                status === "success"
                  ? "bg-green-50 text-green-700"
                  : status === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            !phoneNumber ||
            (useCustomAmount ? !customAmount : false)
          }
          className="w-full"
        >
          {isProcessing ? "Processing..." : `Pay KES ${getFinalAmount()}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
