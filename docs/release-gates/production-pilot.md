# Walleo Production Pilot Release Gates

> **Standard Compliance**: NIST CSF 2.0 (Govern, Identify, Protect, Detect, Respond, Recover) & OWASP API Security Top 10

This document defines the strict gate criteria required before moving from Sandboxed Prototyping to Live Production Pilot with real merchant balances and banking rails.

---

## 🚦 Gate 1: Automated Invariant & Security Test Matrix (CI/CD)

The CI/CD build MUST pass **100% of all 22 tests** on every commit and pull request:

- [x] **FT-01 to FT-08**: Complete Double-Entry Ledger Invariants & Money Safety
  - Double-entry atomic balance conservation
  - Mandatory pre-payout `HOLD` before calling AI or external APIs
  - Deterministic sanctions hard-block
  - Idempotency & double-spend protection
  - Fail-safe fallback to `MANUAL_REVIEW` on Sentinel engine timeout
  - Compensatory reversal on bank settlement failure
  - Out-of-order webhook sequence defense
  - Zero PII leakage in telemetry
- [x] **SEC-001 to SEC-014**: Walleo Sentinel API Cyber Defense Matrix
  - **SEC-001**: BOLA / IDOR object-level data layer isolation (`where: { id, merchantId }`)
  - **SEC-002**: Mass assignment & sensitive DTO field tamper defense
  - **SEC-003**: RBAC / BFLA & Segregation of Duties (Maker cannot self-approve as Checker)
  - **SEC-004**: Step-Up MFA & 48h cooling period on beneficiary bank account changes
  - **SEC-005**: High-concurrency race condition defense with database unique constraints
  - **SEC-006**: Bank webhook HMAC-SHA256 signature verification with constant-time equality
  - **SEC-007**: Webhook replay attack protection via timestamp expiry (<5m) and nonce caching
  - **SEC-008**: Sentinel AI engine fail-safe circuit breaker
  - **SEC-009**: PII & credential masking in logs, Sentry, and Grafana streams
  - **SEC-010**: Supply chain dependency hygiene & Secret Manager isolation
  - **SEC-011**: Outbound webhook SSRF defense & loopback/metadata egress blocking
  - **SEC-012**: Tiered token bucket rate limiting on sensitive financial endpoints
  - **SEC-013**: Improper assets management & deprecated shadow API removal
  - **SEC-014**: Upstream bank API response sanitization & payload anomaly interception

---

## 🔐 Gate 2: Code Review & Cryptographic Auditing

- [ ] **Manual Cryptographic Review**: Complete peer review of all signing algorithms, key derivation paths, and HMAC verifiers.
- [ ] **Data Access Layer Audit**: Assert that every database query includes tenant `merchant_id` at the query engine level.
- [ ] **Immutable Ledger Chaining**: Verify that every journal entry maintains an unbroken SHA-256 hash pointer to its ancestor.

---

## 🛡️ Gate 3: Application Security Testing (AST & PenTest)

- [ ] **SAST (Static Analysis)**: Clean scan with zero high or critical severity CVEs.
- [ ] **Dependency & SBOM Scanning**: Dependabot / Snyk audit with zero vulnerable direct or transitive packages.
- [ ] **DAST (Dynamic Analysis)**: Automated dynamic fuzzing on Staging environment.
- [ ] **Independent Penetration Test**: Formal third-party black-box and grey-box security assessment covering:
  - Authentication bypass & token hijacking
  - BOLA / IDOR across tenant boundaries
  - Webhook forgery and tampering
  - Concurrency & double-spending under distributed load

---

## 🚨 Gate 4: Incident Response & Disaster Recovery Drills

- [ ] **Stolen Operator Token Drill**: Verify token revocation and session invalidation across all nodes within <60 seconds.
- [ ] **Corrupted AI Stream Drill**: Verify circuit breaker trips immediately to `MANUAL_REVIEW` with zero funds dispersed.
- [ ] **Cold Backup Restoration Test**: Perform a live database recovery from encrypted point-in-time backups and verify ledger consistency.

---

## 📋 Gate 5: Regulatory & Executive Approvals

- [ ] **Product Owner Approval**: Functional completeness and business workflow sign-off.
- [ ] **Chief Technology Officer (CTO) Approval**: Architectural stability and scalability sign-off.
- [ ] **Risk & Compliance Officer Approval**: Adherence to BCT Notice 2018-16 and QCB FinTech Sandbox regulations.
- [ ] **Partner Bank / PSP Sandbox Clearance**: Formal confirmation of sandbox readiness and dual-signature integration agreements.
