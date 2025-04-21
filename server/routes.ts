import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { donationAmountSchema, donationInfoSchema } from "@shared/schema";
import { yooMoneyAPI } from "./yoomoney-api";
import { cryptoBotAPI } from "./cryptobot-api";
import { telegramBot } from "./telegram-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the Telegram bot
  telegramBot.start();

  // API endpoint to get donation statistics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDonationStats();
      const weeklyStats = await storage.getWeeklyStats();
      
      res.json({
        totalAmount: stats.totalAmount,
        totalCount: stats.totalCount,
        averageAmount: stats.averageAmount,
        weeklyStats
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // API endpoint to initiate a donation
  app.post("/api/donate/init", async (req: Request, res: Response) => {
    try {
      // Validate amount
      const amountValidation = donationAmountSchema.safeParse(req.body);
      if (!amountValidation.success) {
        return res.status(400).json({ 
          message: "Invalid amount. Must be between 10 and a 100,000 rubles." 
        });
      }
      
      const { amount } = amountValidation.data;
      
      // Create payment via YooMoney API
      const paymentResponse = await yooMoneyAPI.createPayment(amount, "Донат через сайт");
      
      if (paymentResponse.status !== 'success' || !paymentResponse.payment_id || !paymentResponse.payment_url) {
        return res.status(500).json({ 
          message: paymentResponse.error || "Payment initialization failed" 
        });
      }
      
      // Save initial donation record
      await storage.createDonation({
        amount: amount * 100, // Convert to kopecks
        paymentId: paymentResponse.payment_id,
        source: "website",
        status: "pending",
        name: undefined,
        message: undefined
      });
      
      // Return payment details to the client
      res.json({
        paymentId: paymentResponse.payment_id,
        paymentUrl: paymentResponse.payment_url
      });
    } catch (error) {
      console.error("Error initializing donation:", error);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  // API endpoint to update donation info (name and message)
  app.post("/api/donate/update-info", async (req: Request, res: Response) => {
    try {
      // Extract and validate payment ID
      const { paymentId } = req.body;
      if (!paymentId || typeof paymentId !== 'string') {
        return res.status(400).json({ message: "Payment ID is required" });
      }
      
      // Validate donation info
      const infoValidation = donationInfoSchema.safeParse(req.body);
      if (!infoValidation.success) {
        return res.status(400).json({ message: "Invalid donation information" });
      }
      
      // Find the donation
      const donation = await storage.getDonationByPaymentId(paymentId);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      // Update the donation with name and message
      const { name, message } = infoValidation.data;
      const updatedDonation = {
        ...donation,
        name: name || donation.name,
        message: message || donation.message
      };
      
      // Save the updated donation
      await storage.updateDonationStatus(donation.id, donation.status);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating donation info:", error);
      res.status(500).json({ message: "Failed to update donation information" });
    }
  });

  // API endpoint to check payment status
  app.get("/api/donate/status/:paymentId", async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      // Check payment status with YooMoney
      const paymentResponse = await yooMoneyAPI.checkPaymentStatus(paymentId);
      
      if (paymentResponse.status === 'success') {
        // If payment was successful, update our local status
        const donation = await storage.getDonationByPaymentId(paymentId);
        if (donation) {
          await storage.updateDonationStatus(donation.id, "completed");
        }
        
        res.json({ status: "completed" });
      } else if (paymentResponse.status === 'pending') {
        res.json({ status: "pending" });
      } else {
        res.json({ status: "failed", error: paymentResponse.error });
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
