import { donations, type Donation, type InsertDonation, dailyStats, type DailyStats, type InsertDailyStats } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationById(id: number): Promise<Donation | undefined>;
  getDonationByPaymentId(paymentId: string): Promise<Donation | undefined>;
  updateDonationStatus(id: number, status: string): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  getDonationStats(): Promise<{ totalAmount: number; totalCount: number; averageAmount: number }>;
  
  // Daily stats operations
  getOrCreateDailyStat(date: Date): Promise<DailyStats>;
  updateDailyStat(id: number, amount: number): Promise<DailyStats | undefined>;
  getWeeklyStats(): Promise<DailyStats[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donations: Map<number, Donation>;
  private dailyStats: Map<number, DailyStats>;
  private userCurrentId: number;
  private donationCurrentId: number;
  private dailyStatsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.donations = new Map();
    this.dailyStats = new Map();
    this.userCurrentId = 1;
    this.donationCurrentId = 1;
    this.dailyStatsCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Donation operations
  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.donationCurrentId++;
    const date = new Date();
    const donation: Donation = { 
      ...insertDonation,
      id,
      date,
    };
    this.donations.set(id, donation);
    
    // Update daily stats
    await this.incrementDailyStats(date, donation.amount);
    
    return donation;
  }

  async getDonationById(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getDonationByPaymentId(paymentId: string): Promise<Donation | undefined> {
    return Array.from(this.donations.values()).find(
      (donation) => donation.paymentId === paymentId
    );
  }

  async updateDonationStatus(id: number, status: string): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;
    
    const updatedDonation = { ...donation, status };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  async getAllDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getDonationStats(): Promise<{ totalAmount: number; totalCount: number; averageAmount: number }> {
    const donations = Array.from(this.donations.values()).filter(d => d.status === "completed");
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const totalCount = donations.length;
    const averageAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
    
    return {
      totalAmount,
      totalCount,
      averageAmount
    };
  }

  // Daily stats operations
  private async incrementDailyStats(date: Date, amount: number): Promise<void> {
    const dateWithoutTime = new Date(date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    
    const existingStat = await this.getOrCreateDailyStat(dateWithoutTime);
    
    const updatedStat: DailyStats = {
      ...existingStat,
      totalAmount: existingStat.totalAmount + amount,
      count: existingStat.count + 1
    };
    
    this.dailyStats.set(existingStat.id, updatedStat);
  }

  async getOrCreateDailyStat(date: Date): Promise<DailyStats> {
    const dateWithoutTime = new Date(date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    
    const existingStat = Array.from(this.dailyStats.values()).find(
      (stat) => stat.date.getTime() === dateWithoutTime.getTime()
    );
    
    if (existingStat) {
      return existingStat;
    }
    
    const id = this.dailyStatsCurrentId++;
    const newStat: DailyStats = {
      id,
      date: dateWithoutTime,
      totalAmount: 0,
      count: 0
    };
    
    this.dailyStats.set(id, newStat);
    return newStat;
  }

  async updateDailyStat(id: number, amount: number): Promise<DailyStats | undefined> {
    const stat = this.dailyStats.get(id);
    if (!stat) return undefined;
    
    const updatedStat = { 
      ...stat,
      totalAmount: stat.totalAmount + amount,
      count: stat.count + 1
    };
    
    this.dailyStats.set(id, updatedStat);
    return updatedStat;
  }

  async getWeeklyStats(): Promise<DailyStats[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // Last 7 days including today
    
    return Array.from(this.dailyStats.values())
      .filter(stat => stat.date >= weekStart && stat.date <= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

export const storage = new MemStorage();
