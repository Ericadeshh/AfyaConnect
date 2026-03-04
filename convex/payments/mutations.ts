// convex/payments/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getMpesaClient } from "../../src/lib/mpesa-config";
import {
  generateReference,
  formatPhoneNumber,
} from "../../src/lib/mpesa/utils";
import { Id } from "../_generated/dataModel";

export const initiateSTKPush = mutation({
  args: {
    amount: v.number(),
    phoneNumber: v.string(),
    paymentType: v.union(
      v.literal("booking"),
      v.literal("subscription"),
      v.literal("onboarding"),
      v.literal("referral_fee"),
      v.literal("wallet_topup"),
    ),
    userId: v.optional(v.id("users")),
    facilityId: v.optional(v.id("facilities")),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log(
      "🚀 Starting initiateSTKPush with args:",
      JSON.stringify(args, null, 2),
    );

    try {
      // 1. Validate inputs
      if (args.amount < 10) {
        throw new Error("Amount must be at least 10 KES");
      }

      // 2. Format phone number
      let formattedPhone;
      try {
        formattedPhone = formatPhoneNumber(args.phoneNumber);
        console.log("📱 Formatted phone number:", formattedPhone);
      } catch (phoneError) {
        console.error("❌ Phone number formatting failed:", phoneError);
        throw new Error(
          `Invalid phone number: ${args.phoneNumber}. Please use format 07XXXXXXXX`,
        );
      }

      // 3. Generate unique reference
      const reference = generateReference();
      console.log("🔖 Generated reference:", reference);

      // 4. Prepare payment data for database
      const paymentData: any = {
        reference,
        amount: args.amount,
        phoneNumber: formattedPhone,
        paymentType: args.paymentType,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optional fields if they exist
      if (args.userId) {
        paymentData.userId = args.userId;
        console.log("👤 User ID:", args.userId);
      }

      if (args.facilityId) {
        paymentData.facilityId = args.facilityId;
        console.log("🏥 Facility ID:", args.facilityId);
      }

      if (args.relatedEntityId) {
        paymentData.relatedEntityId = args.relatedEntityId;
        paymentData.relatedEntityType = args.relatedEntityType;
        console.log("📎 Related entity:", {
          id: args.relatedEntityId,
          type: args.relatedEntityType,
        });
      }

      if (args.metadata) {
        paymentData.metadata = args.metadata;
      }

      // 5. Create payment record in database
      console.log("💾 Creating payment record...");
      let paymentId;
      try {
        paymentId = await ctx.db.insert("payments", paymentData);
        console.log("✅ Payment record created with ID:", paymentId);
      } catch (dbError) {
        console.error("❌ Failed to create payment record:", dbError);
        throw new Error(
          `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        );
      }

      // 6. Initialize M-Pesa client
      console.log("🔄 Initializing M-Pesa client...");
      let mpesaClient;
      try {
        mpesaClient = getMpesaClient();
        console.log("✅ M-Pesa client initialized");
      } catch (clientError) {
        console.error("❌ Failed to initialize M-Pesa client:", clientError);

        // Update payment record with initialization error
        await ctx.db.patch(paymentId, {
          status: "failed",
          metadata: {
            ...args.metadata,
            error: "M-Pesa client initialization failed",
            errorDetails:
              clientError instanceof Error
                ? clientError.message
                : String(clientError),
          },
          updatedAt: new Date().toISOString(),
        });

        throw new Error("Payment service unavailable. Please try again later.");
      }

      // 7. Initiate STK Push
      console.log("📲 Initiating STK Push to M-Pesa...");
      let result;
      try {
        // Convert paymentType to uppercase for M-Pesa client
        const mpesaPaymentType = args.paymentType.toUpperCase() as
          | "BOOKING"
          | "SUBSCRIPTION"
          | "ONBOARDING"
          | "REFERRAL_FEE"
          | "WALLET_TOPUP";

        result = await mpesaClient.stkPush({
          amount: args.amount,
          phoneNumber: formattedPhone,
          paymentType: mpesaPaymentType,
          userId: args.userId,
          facilityId: args.facilityId,
          relatedEntityId: args.relatedEntityId || paymentId,
          relatedEntityType: args.relatedEntityType,
          metadata: { ...args.metadata, paymentId, reference },
        });

        console.log(
          "✅ STK Push response received:",
          JSON.stringify(result, null, 2),
        );
      } catch (mpesaError) {
        console.error("❌ STK Push failed:", mpesaError);

        // Update payment record with M-Pesa error
        await ctx.db.patch(paymentId, {
          status: "failed",
          metadata: {
            ...args.metadata,
            error: "M-Pesa STK push failed",
            errorDetails:
              mpesaError instanceof Error
                ? mpesaError.message
                : String(mpesaError),
          },
          updatedAt: new Date().toISOString(),
        });

        throw new Error(
          `M-Pesa payment failed: ${mpesaError instanceof Error ? mpesaError.message : "Unknown error"}`,
        );
      }

      // 8. Check if STK Push was accepted
      if (result.ResponseCode !== "0") {
        console.warn(
          "⚠️ STK Push returned non-zero response code:",
          result.ResponseCode,
          result.ResponseDescription,
        );

        await ctx.db.patch(paymentId, {
          status: "failed",
          responseCode: result.ResponseCode,
          responseDescription: result.ResponseDescription,
          metadata: { ...args.metadata, stkResponse: result },
          updatedAt: new Date().toISOString(),
        });

        throw new Error(
          `M-Pesa: ${result.ResponseDescription || "Payment request rejected"}`,
        );
      }

      // 9. Update payment record with STK push details
      console.log("📝 Updating payment record with STK details...");
      await ctx.db.patch(paymentId, {
        checkoutRequestID: result.CheckoutRequestID,
        merchantRequestID: result.MerchantRequestID,
        responseCode: result.ResponseCode,
        responseDescription: result.ResponseDescription,
        metadata: { ...args.metadata, stkResponse: result },
        updatedAt: new Date().toISOString(),
      });

      console.log("🎉 STK Push initiated successfully for payment:", paymentId);

      // 10. Return success response
      return {
        success: true,
        paymentId,
        checkoutRequestID: result.CheckoutRequestID,
        merchantRequestID: result.MerchantRequestID,
        responseDescription:
          result.ResponseDescription || "STK push sent successfully",
      };
    } catch (error) {
      // Comprehensive error logging
      console.error("❌❌❌ CRITICAL: initiateSTKPush failed:", error);

      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error, error);
      }

      // Re-throw with user-friendly message
      throw new Error(
        `Payment initiation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

export const checkPaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    console.log("🔍 Checking payment status for:", args.paymentId);

    try {
      const payment = await ctx.db.get(args.paymentId);

      if (!payment) {
        console.error("❌ Payment not found:", args.paymentId);
        throw new Error("Payment not found");
      }

      console.log("✅ Payment found:", {
        id: payment._id,
        status: payment.status,
        checkoutRequestID: payment.checkoutRequestID,
      });

      // If payment is still pending and has checkoutRequestID, query M-Pesa
      if (payment.status === "pending" && payment.checkoutRequestID) {
        console.log("🔄 Payment is pending, checking status with M-Pesa...");

        try {
          const mpesaClient = getMpesaClient();
          const status = await mpesaClient.queryStatus(
            payment.checkoutRequestID,
          );

          console.log(
            "📊 M-Pesa status response:",
            JSON.stringify(status, null, 2),
          );

          // Update payment based on status
          if (status.ResultCode === 0) {
            console.log("✅ Payment completed successfully");
            await ctx.db.patch(args.paymentId, {
              status: "completed",
              updatedAt: new Date().toISOString(),
            });
          } else if (status.ResultCode !== 1037) {
            // 1037 means pending
            console.log("❌ Payment failed with code:", status.ResultCode);
            await ctx.db.patch(args.paymentId, {
              status: "failed",
              updatedAt: new Date().toISOString(),
            });
          }

          return {
            ...payment,
            mpesaStatus: status,
          };
        } catch (mpesaError) {
          console.error("❌ Failed to query M-Pesa status:", mpesaError);
          // Return payment without M-Pesa status
        }
      }

      return payment;
    } catch (error) {
      console.error("❌ Error in checkPaymentStatus:", error);
      throw error;
    }
  },
});

export const handleSTKCallback = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    console.log(
      "📞 Received STK callback:",
      JSON.stringify(args.body, null, 2),
    );

    const { body } = args;

    try {
      // Find payment by checkout request ID
      console.log(
        "🔍 Looking for payment with CheckoutRequestID:",
        body.CheckoutRequestID,
      );

      const payment = await ctx.db
        .query("payments")
        .filter((q) =>
          q.eq(q.field("checkoutRequestID"), body.CheckoutRequestID),
        )
        .first();

      if (!payment) {
        console.error(
          "❌ Payment not found for CheckoutRequestID:",
          body.CheckoutRequestID,
        );
        return {
          ResultCode: 1,
          ResultDesc: "Payment not found",
        };
      }

      console.log("✅ Found payment:", payment._id);

      // Check if payment was successful (ResultCode 0 means success)
      const isSuccess = body.ResultCode === 0;

      if (isSuccess) {
        console.log("💰 Payment successful!");

        // Parse metadata from callback
        const metadata = body.CallbackMetadata?.Item || [];
        let mpesaReceiptNumber = "";
        let transactionDate = "";
        let amount = 0;
        let phoneNumber = "";

        metadata.forEach((item: any) => {
          console.log(`Callback metadata item: ${item.Name} = ${item.Value}`);
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceiptNumber = item.Value;
          }
          if (item.Name === "TransactionDate") {
            transactionDate = item.Value.toString();
          }
          if (item.Name === "Amount") {
            amount = item.Value;
          }
          if (item.Name === "PhoneNumber") {
            phoneNumber = item.Value;
          }
        });

        // Update payment record
        await ctx.db.patch(payment._id, {
          status: "completed",
          mpesaReceiptNumber,
          transactionDate,
          stkCallback: body,
          updatedAt: new Date().toISOString(),
        });

        console.log(
          "✅ Payment record updated with receipt:",
          mpesaReceiptNumber,
        );

        // Handle successful payment based on type
        switch (payment.paymentType) {
          case "booking":
            console.log(
              "📅 Processing booking payment for:",
              payment.relatedEntityId,
            );
            // Add your booking completion logic here
            break;

          case "subscription":
            if (payment.facilityId) {
              console.log(
                "🏥 Activating subscription for facility:",
                payment.facilityId,
              );

              try {
                const subscription = await ctx.db
                  .query("facilitySubscriptions")
                  .filter((q) =>
                    q.eq(q.field("facilityId"), payment.facilityId!),
                  )
                  .first();

                if (subscription) {
                  const newEndDate = new Date();
                  if (subscription.billingCycle === "monthly") {
                    newEndDate.setMonth(newEndDate.getMonth() + 1);
                  } else if (subscription.billingCycle === "quarterly") {
                    newEndDate.setMonth(newEndDate.getMonth() + 3);
                  } else {
                    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                  }

                  await ctx.db.patch(subscription._id, {
                    status: "active",
                    endDate: newEndDate.toISOString(),
                    nextBillingDate: newEndDate.toISOString(),
                    updatedAt: new Date().toISOString(),
                  });

                  console.log("✅ Subscription activated until:", newEndDate);
                }
              } catch (subError) {
                console.error("❌ Error updating subscription:", subError);
              }
            }
            break;

          case "onboarding":
            if (payment.facilityId) {
              console.log(
                "🏥 Processing facility onboarding for:",
                payment.facilityId,
              );
              // Add your onboarding completion logic here
            }
            break;

          case "wallet_topup":
            if (payment.userId) {
              console.log(
                "💰 Processing wallet topup for user:",
                payment.userId,
              );
              // Add your wallet topup logic here
            }
            break;

          case "referral_fee":
            if (payment.relatedEntityId) {
              console.log(
                "📋 Processing referral fee for:",
                payment.relatedEntityId,
              );
              // Add your referral completion logic here
            }
            break;
        }

        // Create invoice
        try {
          await ctx.db.insert("invoices", {
            invoiceNumber: `INV-${payment.reference}`,
            userId: payment.userId,
            facilityId: payment.facilityId,
            items: [
              {
                description: `${payment.paymentType} payment`,
                quantity: 1,
                unitPrice: payment.amount,
                total: payment.amount,
              },
            ],
            subtotal: payment.amount,
            total: payment.amount,
            status: "paid",
            dueDate: new Date().toISOString(),
            paidDate: new Date().toISOString(),
            paymentId: payment._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log("📄 Invoice created for payment:", payment._id);
        } catch (invoiceError) {
          console.error("❌ Error creating invoice:", invoiceError);
        }
      } else {
        // Payment failed
        console.log(
          "❌ Payment failed with code:",
          body.ResultCode,
          "desc:",
          body.ResultDesc,
        );

        await ctx.db.patch(payment._id, {
          status: "failed",
          stkCallback: body,
          updatedAt: new Date().toISOString(),
        });
      }

      // Return success to M-Pesa
      return {
        ResultCode: 0,
        ResultDesc: "Success",
      };
    } catch (error) {
      console.error("❌ Error processing callback:", error);

      // Always return success to M-Pesa to prevent retries
      return {
        ResultCode: 0,
        ResultDesc: "Success",
      };
    }
  },
});

export const test = mutation({
  args: {},
  handler: async () => {
    console.log("🧪 Test mutation called successfully");
    return {
      success: true,
      message: "Payment functions are working!",
      timestamp: new Date().toISOString(),
    };
  },
});
