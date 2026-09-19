import { db } from "./db";
import { LedgerEntry, LedgerEntryType } from "../src/types";
import crypto from "crypto";

function computeHash(payload: string, previousHash = ""): string {
  return "sha256:" + crypto.createHash("sha256").update(payload + previousHash).digest("hex");
}

let lastLedgerHash = "sha256:genesis-walleo-ledger-v2";

export class AtomicLedgerService {
  private locks: Set<string> = new Set();

  async acquireLock<T>(merchantId: string, action: () => Promise<T>): Promise<T> {
    while (this.locks.has(merchantId)) {
      await new Promise(r => setTimeout(r, 10));
    }
    this.locks.add(merchantId);
    try {
      return await action();
    } finally {
      this.locks.delete(merchantId);
    }
  }

  recordEntry(
    merchantId: string,
    payoutId: string,
    type: LedgerEntryType,
    amount: number,
    currency: string,
    reason: string
  ): LedgerEntry {
    const merchant = db.merchants.get(merchantId);
    if (!merchant) {
      throw new Error(`Merchant ${merchantId} not found`);
    }

    let available = merchant.availableBalance;
    let held = merchant.heldBalance || 0;

    switch (type) {
      case "HOLD":
        if (available < amount) {
          throw new Error(`Insufficient available balance for HOLD. Available: ${available}, Required: ${amount}`);
        }
        available = Math.max(0, available - amount);
        held = held + amount;
        break;

      case "RELEASE_HOLD":
        held = Math.max(0, held - amount);
        available = available + amount;
        break;

      case "SETTLE":
        held = Math.max(0, held - amount);
        // Funds leave the system to the settlement bank
        break;

      case "REVERSE":
        // Reversal of failed settlement or returned bank transfer
        available = available + amount;
        break;
    }

    merchant.availableBalance = Math.round(available * 100) / 100;
    merchant.heldBalance = Math.round(held * 100) / 100;
    db.merchants.set(merchant.id, merchant);

    const entryId = `le-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    const payload = `${entryId}:${payoutId}:${merchantId}:${type}:${amount}:${currency}:${merchant.availableBalance}:${merchant.heldBalance}:${timestamp}`;
    const hash = computeHash(payload, lastLedgerHash);
    const prev = lastLedgerHash;
    lastLedgerHash = hash;

    const entry: LedgerEntry = {
      id: entryId,
      payoutId,
      merchantId,
      type,
      amount,
      currency,
      availableBalanceAfter: merchant.availableBalance,
      heldBalanceAfter: merchant.heldBalance,
      reason,
      timestamp,
      hash,
      previousHash: prev,
    };

    db.ledgerEntries.set(entryId, entry);
    return entry;
  }

  getEntriesForMerchant(merchantId: string): LedgerEntry[] {
    return Array.from(db.ledgerEntries.values())
      .filter(e => e.merchantId === merchantId)
      .reverse();
  }

  getAllEntries(): LedgerEntry[] {
    return Array.from(db.ledgerEntries.values()).reverse();
  }
}

export const ledgerService = new AtomicLedgerService();
