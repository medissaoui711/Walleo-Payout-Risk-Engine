import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { LedgerMakerCheckerConsole } from "./components/LedgerMakerCheckerConsole";
import { FinancialTestSuite } from "./components/FinancialTestSuite";
import { JevSimulator } from "./components/JevSimulator";
import { ComplianceLegal } from "./components/ComplianceLegal";
import { MetricsDashboard } from "./components/MetricsDashboard";
import { Merchant, BankAccount, Transaction, Payout, ReviewQueueItem } from "./types";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";

export function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [currency, setCurrency] = useState<string>('USD');
  const [activeTab, setActiveTab] = useState<'merchant' | 'maker-checker' | 'tests' | 'jev-simulator' | 'compliance' | 'metrics'>('merchant');

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Load merchants and review queue initially
  async function loadInitialData() {
    setIsLoading(true);
    setError(null);
    try {
      const [mRes, qRes] = await Promise.all([
        fetch("/api/merchants"),
        fetch("/api/admin/review-queue"),
      ]);

      if (!mRes.ok || !qRes.ok) {
        throw new Error("Failed to load initial data from server");
      }

      const mData: Merchant[] = await mRes.json();
      const qData: ReviewQueueItem[] = await qRes.json();

      setMerchants(mData);
      setReviewQueue(qData);

      if (mData.length > 0 && !selectedMerchant) {
        setSelectedMerchant(mData[0]);
      }
    } catch (err: any) {
      console.error("Initialization error:", err);
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setIsLoading(false);
    }
  }

  // Load data for the currently selected merchant
  async function loadMerchantDetails(merchantId: string) {
    try {
      const [banksRes, txRes, pRes] = await Promise.all([
        fetch(`/api/merchants/${merchantId}/banks`),
        fetch(`/api/merchants/${merchantId}/transactions`),
        fetch(`/api/merchants/${merchantId}/payouts`),
      ]);

      if (banksRes.ok) {
        const banks = await banksRes.json();
        setBankAccounts(banks);
      }

      if (txRes.ok) {
        const txs = await txRes.json();
        setTransactions(txs);
      }

      if (pRes.ok) {
        const pList = await pRes.json();
        setPayouts(pList);
      }
    } catch (err) {
      console.error("Failed to load merchant details:", err);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedMerchant) {
      loadMerchantDetails(selectedMerchant.id);
    }
  }, [selectedMerchant]);

  // Refresh review queue and merchant data after any action
  async function handleRefreshAll() {
    try {
      const [mRes, qRes] = await Promise.all([
        fetch("/api/merchants"),
        fetch("/api/admin/review-queue"),
      ]);

      if (mRes.ok && qRes.ok) {
        const mData: Merchant[] = await mRes.json();
        const qData: ReviewQueueItem[] = await qRes.json();
        setMerchants(mData);
        setReviewQueue(qData);

        if (selectedMerchant) {
          const updatedSelected = mData.find(m => m.id === selectedMerchant.id);
          if (updatedSelected) setSelectedMerchant(updatedSelected);
          loadMerchantDetails(selectedMerchant.id);
        }
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }

  if (isLoading && merchants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="font-bold text-lg text-white">Walleo Payout & Risk Engine</div>
          <p className="text-xs text-slate-400">Loading merchant gateway & Walleo Sentinel AI Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation & Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        selectedMerchant={selectedMerchant}
        merchants={merchants}
        onSelectMerchant={(m) => setSelectedMerchant(m)}
        pendingReviewCount={reviewQueue.length}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Merchant Portal View */}
        {activeTab === 'merchant' && selectedMerchant && (
          <MerchantDashboard
            merchant={selectedMerchant}
            bankAccounts={bankAccounts}
            transactions={transactions}
            payouts={payouts}
            currency={currency}
            lang={lang}
            onRequestPayoutSuccess={handleRefreshAll}
          />
        )}

        {/* Tab 2: Maker / Checker Segregation & Double-Entry Ledger */}
        {activeTab === 'maker-checker' && (
          <LedgerMakerCheckerConsole
            lang={lang}
            onActionComplete={handleRefreshAll}
          />
        )}

        {/* Tab 3: Financial Invariant Tests Matrix (The 8 requested scenarios) */}
        {activeTab === 'tests' && (
          <FinancialTestSuite
            lang={lang}
          />
        )}

        {/* Tab 4: Jev Simulator & Shadow Mode */}
        {activeTab === 'jev-simulator' && (
          <JevSimulator lang={lang} />
        )}

        {/* Tab 5: Compliance & Legal */}
        {activeTab === 'compliance' && (
          <ComplianceLegal merchants={merchants} lang={lang} />
        )}

        {/* Tab 6: Metrics & Telemetry */}
        {activeTab === 'metrics' && (
          <MetricsDashboard lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Walleo PSP & Risk Review Architecture</span>
            <span className="text-slate-400">• Qatar (QCB) & Tunisia (BCT)</span>
          </div>
          <div className="text-slate-400 flex items-center gap-4">
            <span>Powered by Walleo Sentinel Engine & Gemini 3.8 Flash</span>
            <span>Version 1.4.2-prod</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
