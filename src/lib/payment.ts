// Payment processing and booking expiry logic
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { formatPhoneNumber } from "./mpesa/utils";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  paymentId?: string;
  checkoutRequestID?: string;
}

// Initiate M-Pesa STK Push for booking payment
export async function sendSTKPaymentPrompt(
  bookingId: string,
  phoneNumber: string,
  amount: number,
  userId?: string,
): Promise<PaymentResult> {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const result = await fetchMutation(api.payments.initiateSTKPush, {
      amount,
      phoneNumber: formattedPhone,
      paymentType: "booking",
      userId,
      relatedEntityId: bookingId,
      relatedEntityType: "booking",
      metadata: { bookingId },
    });

    return {
      success: true,
      transactionId: result.checkoutRequestID,
      paymentId: result.paymentId,
      checkoutRequestID: result.checkoutRequestID,
      message: `STK prompt sent to ${phoneNumber}. Please check your phone and enter your PIN to complete payment.`,
    };
  } catch (error: any) {
    console.error("STK Push failed:", error);
    return {
      success: false,
      message: error.message || "Failed to send STK prompt. Please try again.",
    };
  }
}

// Check payment status
export async function checkPaymentStatus(paymentId: string) {
  try {
    return await fetchMutation(api.payments.checkPaymentStatus, { paymentId });
  } catch (error) {
    console.error("Failed to check payment status:", error);
    return null;
  }
}

// Confirm payment manually (admin function)
export async function confirmPayment(
  bookingId: string,
  mpesaReceiptNumber?: string,
): Promise<PaymentResult> {
  try {
    // Find the payment for this booking
    const payments = await fetchQuery(api.payments.getUserPayments, {
      userId: "", // This needs to be handled differently
    });

    // This would need to be implemented based on your needs
    return {
      success: true,
      transactionId: mpesaReceiptNumber,
      message: "Payment confirmed manually",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to confirm payment",
    };
  }
}

// Check and expire old bookings
export async function checkAndExpireBookings() {
  // This would be a scheduled job in Convex
  // You can create a cron job to run this periodically
  const now = new Date();

  // Query for expired pending payments
  // This logic should be moved to a Convex mutation

  return {
    expiredBookings: [],
    activeBookings: [],
  };
}

// Get available slots for a clinic
export function getAvailableSlots(
  clinicId: string,
  date: string,
  maxPerDay = 15,
) {
  const allSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  // This should be fetched from Convex
  // For now, return all slots as available
  return {
    available: allSlots,
    isFull: false,
    availableCount: allSlots.length,
  };
}

// Get available dates
export function getAvailableDates(
  clinicId: string,
  startDate: Date,
  daysAhead = 30,
): string[] {
  const available: string[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    const slots = getAvailableSlots(clinicId, dateStr);

    if (slots.available.length > 0) {
      available.push(dateStr);
    }
  }

  return available;
}
