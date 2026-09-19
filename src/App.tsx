import React, { useState, useEffect } from "react";
import { TopHeader } from "./components/TopHeader";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { ExecutiveOverviewPage } from "./components/ExecutiveOverviewPage";
import { ManualReviewQueuePage } from "./components/ManualReviewQueuePage";
import { PayoutCaseInvestigation } from "./components/PayoutCaseInvestigation";
import { FinancialLedgerPage } from "./components/FinancialLedgerPage";
import { BankReconciliationPage } from "./components/BankReconciliationPage";
import { SentinelSecurityPage } from "./components/SentinelSecurityPage";
import { ShadowTestingPage } from "./components/ShadowTestingPage";
import { AuditCompliancePage } from "./components/AuditCompliancePage";
import { MerchantDashboard } from "./components/MerchantDashboard";
import { FinancialTestSuite } from "./components/FinancialTestSuite";
import { JevSimulator } from "./components/JevSimulator";
import { MetricsDashboard } from "./components/MetricsDashboard";
import { ComplianceLegal } from "./components/ComplianceLegal";
import { ActivePage } from "./navigation";
import { Merchant, BankAccount, Transaction, Payout, ReviewQueueItem, LedgerEntry } from "./types";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";

export function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('PRODUCTION');
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [investigatingPayoutId, setInvestigatingPayoutId] = useState<string>("PO-101");

  // Persistent sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("walleo_sidebar_collapsed");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("walleo_sidebar_collapsed", String(next));
      } catch (e) {
        console.error("Failed to save sidebar state", e);
      }
      return next;
    });
  };

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize HTML dir and lang
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Load merchants, review queue, and ledger entries initially
  async function loadInitialData() {
    setIsLoading(true);
    setError(null);
    try {
      const [mRes, qRes, lRes] = await Promise.all([
        fetch("/api/merchants"),
        fetch("/api/admin/review-queue"),
        fetch("/api/ledger/entries"),
      ]);

      if (!mRes.ok || !qRes.ok) {
        throw new Error("Failed to load operations state from server");
      }

      const mData: Merchant[] = await mRes.json();
      const qData: ReviewQueueItem[] = await qRes.json();
      let lData: LedgerEntry[] = [];
      if (lRes.ok) {
        lData = await lRes.json();
      }

      setMerchants(mData);
      setReviewQueue(qData);
      setLedgerEntries(lData);

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
      const [mRes, qRes, lRes] = await Promise.all([
        fetch("/api/merchants"),
        fetch("/api/admin/review-queue"),
        fetch("/api/ledger/entries"),
      ]);

      if (mRes.ok && qRes.ok) {
        const mData: Merchant[] = await mRes.json();
        const qData: ReviewQueueItem[] = await qRes.json();
        setMerchants(mData);
        setReviewQueue(qData);

        if (lRes.ok) {
          const lData: LedgerEntry[] = await lRes.json();
          setLedgerEntries(lData);
        }

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

  const handleGlobalSearch = (query: string) => {
    const q = query.trim().toUpperCase();
    if (q.startsWith("PO-") || q === "PO-101" || q === "101") {
      setInvestigatingPayoutId("PO-101");
      setActivePage('payouts-case-detail');
    } else if (q.includes("LEDGER") || q.includes("JRN")) {
      setActivePage('financial-ledger');
    } else if (q.includes("RECON") || q.includes("BANK")) {
      setActivePage('financial-reconciliation');
    } else if (q.includes("SEC") || q.includes("BOLA")) {
      setActivePage('security-incidents');
    } else {
      setActivePage('payouts-review');
    }
  };

  const handleOpenCase = (payoutId: string) => {
    setInvestigatingPayoutId(payoutId);
    setActivePage('payouts-case-detail');
  };

  if (isLoading && merchants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="font-bold text-lg text-white font-mono">Walleo Sentinel Control Center</div>
          <p className="text-xs text-slate-400">Booting Financial Operating System & Bank Invariants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* 1. FIXED TOP HEADER */}
      <TopHeader
        lang={lang}
        setLang={setLang}
        environment={environment}
        setEnvironment={setEnvironment}
        onSearch={handleGlobalSearch}
        onRefresh={handleRefreshAll}
        unreadAlertCount={reviewQueue.length > 0 ? 2 : 0}
      />

      {/* 2. BODY LAYOUT (FIXED SIDEBAR + SCROLLABLE PAGE WORKSPACE) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Right-Side (RTL) / Left-Side (LTR) Navigation Sidebar */}
        <NavigationSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          lang={lang}
          pendingReviewCount={reviewQueue.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1600px] w-full min-w-0 transition-all duration-200 ease-in-out">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PAGE 1: Executive Operations Overview */}
          {activePage === 'overview' && (
            <ExecutiveOverviewPage
              merchants={merchants}
              payouts={payouts}
              reviewQueue={reviewQueue}
              lang={lang}
              onNavigate={(page) => setActivePage(page)}
              onOpenCase={handleOpenCase}
            />
          )}

          {/* PAGE 2: Manual Review Queue */}
          {(activePage === 'payouts-review' || activePage === 'payouts-all' || activePage === 'payouts-held') && (
            <ManualReviewQueuePage
              queue={reviewQueue}
              lang={lang}
              onOpenCase={handleOpenCase}
            />
          )}

          {/* PAGE 3: Payout Case Detail (Dossier PO-101) */}
          {activePage === 'payouts-case-detail' && (
            <PayoutCaseInvestigation
              payoutId={investigatingPayoutId}
              lang={lang}
              onBack={() => setActivePage('payouts-review')}
              onDecisionSubmitted={handleRefreshAll}
            />
          )}

          {/* PAGE 4: Financial Ledger Control (Double-Entry) */}
          {activePage === 'financial-ledger' && (
            <FinancialLedgerPage
              entries={ledgerEntries}
              lang={lang}
            />
          )}

          {/* PAGE 5: Bank Reconciliation Control */}
          {(activePage === 'financial-reconciliation' || activePage === 'financial-exceptions' || activePage === 'payouts-settlements') && (
            <BankReconciliationPage
              lang={lang}
            />
          )}

          {/* PAGE 6: Sentinel Security Center & Defense Suite */}
          {(activePage === 'security-incidents' || activePage === 'security-access' || activePage === 'security-api' || activePage === 'security-webhooks') && (
            <SentinelSecurityPage
              lang={lang}
            />
          )}

          {/* PAGE 7: Sentinel Shadow Testing */}
          {(activePage === 'risk-shadow' || activePage === 'risk-policies') && (
            <ShadowTestingPage
              lang={lang}
            />
          )}

          {/* PAGE 8: Audit & Compliance Trail */}
          {(activePage === 'audit-log' || activePage === 'audit-compliance' || activePage === 'audit-exports') && (
            <AuditCompliancePage
              lang={lang}
            />
          )}

          {/* Additional Operational Views */}
          {activePage === 'risk-decisions' && (
            <JevSimulator lang={lang} />
          )}

          {activePage === 'risk-engine-health' && (
            <MetricsDashboard lang={lang} />
          )}

          {(activePage === 'settings-users' || activePage === 'settings-limits' || activePage === 'settings-integrations') && (
            <ComplianceLegal merchants={merchants} lang={lang} />
          )}

          {activePage === 'payouts-failed' && (
            <FinancialTestSuite lang={lang} />
          )}

          {activePage === 'merchant-portal' && selectedMerchant && (
            <MerchantDashboard
              merchant={selectedMerchant}
              bankAccounts={bankAccounts}
              transactions={transactions}
              payouts={payouts}
              currency="USD"
              lang={lang}
              onRequestPayoutSuccess={handleRefreshAll}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
