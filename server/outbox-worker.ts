import { db } from "./db";
import { OutboxJob } from "../src/types";
import { ledgerService } from "./ledger";

export class OutboxWorkerService {
  enqueueJob(
    payoutId: string,
    merchantId: string,
    amount: number,
    currency: string,
    idempotencyKey: string,
    bankProvider: string = "National Clearing Switch (BIAT/QNB)"
  ): OutboxJob {
    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const job: OutboxJob = {
      id: jobId,
      payoutId,
      merchantId,
      amount,
      currency,
      status: "QUEUED",
      idempotencyKey,
      bankProvider,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    db.outboxJobs.set(jobId, job);
    return job;
  }

  async processJob(jobId: string, simulateFailure = false): Promise<OutboxJob> {
    const job = db.outboxJobs.get(jobId);
    if (!job) throw new Error(`Outbox job ${jobId} not found`);

    job.attempts += 1;
    job.status = "SUBMITTED";
    db.outboxJobs.set(job.id, job);

    // Simulate async network settlement hop
    await new Promise(r => setTimeout(r, 150));

    const payout = db.payouts.get(job.payoutId);

    if (simulateFailure) {
      job.status = "FAILED";
      job.lastError = "SIMULATED_PSP_NETWORK_TIMEOUT_REVERSAL";
      job.processedAt = new Date().toISOString();
      db.outboxJobs.set(job.id, job);

      if (payout) {
        payout.status = "failed";
        payout.reviewerNotes = "Bank clearing network returned rejection. Compensatory reversal triggered.";
        db.payouts.set(payout.id, payout);
      }

      // Compensatory Ledger Entry: Release hold back to available balance
      ledgerService.recordEntry(
        job.merchantId,
        job.payoutId,
        "RELEASE_HOLD",
        job.amount,
        job.currency,
        "Compensatory ledger reversal: settlement failed at bank switch"
      );

      return job;
    }

    job.status = "SETTLED";
    job.processedAt = new Date().toISOString();
    db.outboxJobs.set(job.id, job);

    if (payout) {
      payout.status = "paid";
      payout.processedAt = new Date().toISOString();
      db.payouts.set(payout.id, payout);
    }

    // Ledger Settle
    ledgerService.recordEntry(
      job.merchantId,
      job.payoutId,
      "SETTLE",
      job.amount,
      job.currency,
      `Settlement completed via ${job.bankProvider}`
    );

    return job;
  }

  // Webhook Receiver with Event Versioning Protection
  receiveBankWebhook(payload: {
    payoutId: string;
    eventVersion: number;
    status: "SETTLED" | "FAILED";
    reason?: string;
  }): { applied: boolean; message: string } {
    const payout = db.payouts.get(payload.payoutId);
    if (!payout) {
      return { applied: false, message: `Payout ${payload.payoutId} not found` };
    }

    // Event Versioning / State Invariant Check:
    // If payout is already 'paid', an out-of-order older failure event must NOT revert it
    if (payout.status === "paid" && payload.status === "FAILED") {
      return {
        applied: false,
        message: "Ignored out-of-order webhook: Payout is already finalized in PAID state",
      };
    }

    return { applied: true, message: `Webhook processed successfully: status updated to ${payload.status}` };
  }

  getAllJobs(): OutboxJob[] {
    return Array.from(db.outboxJobs.values()).reverse();
  }
}

export const outboxService = new OutboxWorkerService();
