import { MPESA_API_URLS, TRANSACTION_TYPES } from "./constants";
import { generatePassword, generateTimestamp } from "./utils";
import type {
  MpesaConfig,
  STKPushRequest,
  STKPushResponse,
  InitiatePaymentParams,
} from "./types";

export class MpesaClient {
  private config: MpesaConfig;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: MpesaConfig) {
    // Validate required config
    if (!config.consumerKey || !config.consumerSecret || !config.passkey) {
      console.error("M-Pesa configuration is incomplete");
    }
    this.config = config;
  }

  private async getAuthToken(): Promise<string> {
    // Check if token is still valid
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.authToken;
    }

    if (!this.config.consumerKey || !this.config.consumerSecret) {
      throw new Error("M-Pesa consumer key or secret is missing");
    }

    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`,
    ).toString("base64");

    const urls = MPESA_API_URLS[this.config.environment];

    try {
      const response = await fetch(urls.AUTH, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Auth failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.authToken = data.access_token;
      // Token expires in 1 hour (3600 seconds)
      this.tokenExpiry = new Date(Date.now() + 3599 * 1000);

      return this.authToken!;
    } catch (error) {
      console.error("Failed to get M-Pesa auth token:", error);
      throw new Error(
        `M-Pesa authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async stkPush(params: InitiatePaymentParams): Promise<STKPushResponse> {
    try {
      const token = await this.getAuthToken();
      const timestamp = generateTimestamp();
      const password = generatePassword(
        this.config.businessShortCode,
        this.config.passkey,
        timestamp,
      );

      const urls = MPESA_API_URLS[this.config.environment];
      const phoneNumber = params.phoneNumber.replace(/\D/g, "");

      const transactionDesc =
        typeof params.paymentType === "string"
          ? params.paymentType
          : String(params.paymentType);

      const requestBody: STKPushRequest = {
        businessShortCode: this.config.businessShortCode,
        password,
        timestamp,
        transactionType: TRANSACTION_TYPES.CUSTOMER_PAYBILL_ONLINE,
        amount: params.amount,
        partyA: phoneNumber,
        partyB: this.config.businessShortCode,
        phoneNumber,
        callBackURL: this.config.callbackUrl,
        accountReference: (params.relatedEntityId || "UZIMACARE").substring(
          0,
          12,
        ),
        transactionDesc: transactionDesc.substring(0, 12),
      };

      console.log("Sending STK push request to M-Pesa...");

      const response = await fetch(urls.STK_PUSH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`STK Push failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("STK push response:", result);
      return result;
    } catch (error) {
      console.error("STK Push failed:", error);
      throw error;
    }
  }

  async queryStatus(checkoutRequestID: string): Promise<any> {
    try {
      const token = await this.getAuthToken();
      const timestamp = generateTimestamp();
      const password = generatePassword(
        this.config.businessShortCode,
        this.config.passkey,
        timestamp,
      );

      const urls = MPESA_API_URLS[this.config.environment];

      const requestBody = {
        businessShortCode: this.config.businessShortCode,
        password,
        timestamp,
        checkoutRequestID,
      };

      const response = await fetch(urls.QUERY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Status query failed: ${response.status} - ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Status query failed:", error);
      throw error;
    }
  }
}
