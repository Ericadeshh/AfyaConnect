import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) throw new Error("Phone number is required");
  if (cleaned.startsWith("254") && cleaned.length === 12) return cleaned;
  if (cleaned.startsWith("0") && cleaned.length === 10)
    return "254" + cleaned.substring(1);
  if (cleaned.startsWith("7") && cleaned.length === 9) return "254" + cleaned;
  throw new Error(`Invalid phone number format`);
};

export function usePayments() {
  const [paymentId, setPaymentId] = useState<Id<"payments"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initiatePayment = useAction(api.payments.initiateSTKPush);
  const payment = useQuery(
    api.payments.getPayment,
    paymentId ? { paymentId } : "skip",
  );

  const makePayment = async (amount: number, phoneNumber: string) => {
    setIsLoading(true);
    try {
      if (amount < 1) throw new Error("Amount must be at least KES 1");

      const formattedPhone = formatPhoneNumber(phoneNumber);
      const result = await initiatePayment({
        amount,
        phoneNumber: formattedPhone,
      });

      if (result.success && result.paymentId) {
        setPaymentId(result.paymentId);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    makePayment,
    payment,
    isLoading,
  };
}
