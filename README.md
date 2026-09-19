# Walleo - Payout & Risk Engine (Walleo Sentinel)

منصة مدفوعات وسحب أرباح مصرفية للمؤسسات والتجار الإلكترونيين، مدعومة بمحرك المخاطر والذكاء الاصطناعي **Walleo Sentinel Engine** مع تطبيق معايير الأمان المالي الحتمية، دفتر الأستاذ المزدوج (Double-Entry Ledger)، عزل الصلاحيات (Maker / Checker)، والامتثال التنظيمي للبنك المركزي التونسي (BCT) ومصرف قطر المركزي (QCB).

---

## 🌟 أبرز مميزات النظام

### 1. محرك الأمان وتقييم المخاطر (Walleo Sentinel AI Engine)
- تقييم لحظي لاحتماليات المخاطر (Low, Medium, High) ونقاط الثقة (Trust Score: 0 - 100).
- عتبات ثقة صارمة (> 0.90) للموافقة التلقائية على السحب الفوري (Instant Payout).
- كشف ذكي لقفزات السحب المفاجئة (Velocity Burst & Spikes) وسجلات النزاعات المفتوحة.

### 2. دفتر الأستاذ المزدوج الذري (Double-Entry Ledger)
- حجز الرصيد في الضمان فوراً (`HOLD`) قبل أي تحويل مصرفي أو استدعاء للذكاء الاصطناعي.
- تسوية الأموال (`SETTLE`) عند اكتمال التحويل البنكي أو الاعتماد.
- عكس القيود ورد الأموال للرصيد المتاح (`RELEASE_HOLD`) في حال فشل التحويل أو رفض المعاملة.
- ربط القيود بسلسلة بصمات تشفيرية (`SHA-256 Chained Hash`) غير قابلة للتعديل.

### 3. نظام عزل الصلاحيات (Maker / Checker Segregation of Duties)
- فصل تام بين المحقق المالي (`Maker`) الذي يجمع الأدلة ويوصي بالقرار، والمسؤول المعتمد (`Checker`) الذي يوقع الاعتماد النهائي.
- منع تعارض المصالح الحسابي (حيث لا يمكن للمُعد أن يكون هو نفسه المعتمد للمعاملة ذاتها).

### 4. حماية التزامن ومنع التكرار (Idempotency & Outbox Pattern)
- دعم ترويسة `Idempotency-Key` لمنع السحب المزدوج عند تكرار النقر أو إعادة إرسال الطلبات بالشبكة.
- إدارة طوابير التحويل المصرفي عبر نمط `Outbox Pattern`.
- حماية تسلسل إشعارات الويب هوك المصرفية (`Event Versioning`) لمنع التعديل على المعاملات المنتهية.

### 5. مصفوفة الاختبارات المالية والحتمية (Financial Invariants FT-01..08)
- **FT-01**: السحب الشرعي مع الحجز والتسوية (Legitimate Payout).
- **FT-02**: توجيه السحوبات ذات المخاطر غير الحاسمة للحجز والمراجعة (Inconclusive Velocity Gate).
- **FT-03**: الحظر الحتمي لمخالفات العقوبات والامتثال (Sanctions Hard Block).
- **FT-04**: منع التكرار والتزامن (Idempotency & Double-Click Protection).
- **FT-05**: الأمان التحفظي عند انقطاع الخدمة (Sentinel Timeout & Fallback).
- **FT-06**: عكس القيود عند فشل التحويل المصرفي (Bank Settlement Failure & Compensatory Reversal).
- **FT-07**: حماية ترتيب إشعارات الويب هوك (Out-of-Order Webhook Protection).
- **FT-08**: حظر تسريب البيانات الشخصية والمصرفية المشفرة (Zero PII Leakage / GDPR).

### 6. مصفوفة الأمان السيبراني ومكافحة الاختراق (Walleo Sentinel Security Suite SEC-001..014)
- **SEC-001**: عزل الكائنات ومنع الوصول غير المصرح به (`BOLA / IDOR Tenant Isolation`).
- **SEC-002**: حظر حقن الحقول غير المصرح بها (`Mass Assignment & DTO Tamper Defense`).
- **SEC-003**: حماية الصلاحيات الوظيفية وفصل مهام Maker / Checker (`RBAC / BFLA`).
- **SEC-004**: التحقق المزدوج وفترة التبريد لتغيير الحساب المصرفي (`Step-Up MFA & Cooling Period`).
- **SEC-005**: حماية التزامن ومنع تكرار السحب تحت الهجمات الموازية (`High-Concurrency Race Condition Defense`).
- **SEC-006**: التحقق من توقيع الويب هوك المصرفي (`Bank Webhook Forgery & HMAC-SHA256`).
- **SEC-007**: حظر هجمات إعادة الإرسال (`Webhook Replay Attack & Timestamp Expiry Guard`).
- **SEC-008**: قاطع الدائرة الآمن عند سقوط أو تلوث نموذج الذكاء الاصطناعي (`Sentinel Fail-Safe Circuit Breaker`).
- **SEC-009**: تشفير وحجب الأسرار والبيانات في سجلات التتبع (`PII & Secret Masking in API Telemetry`).
- **SEC-010**: عزل المفاتيح البيئية وفحص سلسلة التوريد (`Environment Secret Isolation & CI/CD Security`).
- **SEC-011**: حماية استدعاء الـ APIs الخارجية من هجمات SSRF وتجاوز الشبكة الداخلية (`SSRF Egress Guard`).
- **SEC-012**: تحديد معدل الطلبات وحماية موارد الخادم من الإغراق (`Tiered Token-Bucket Rate Limiting`).
- **SEC-013**: إدارة مخزون الـ APIs وحظر المسارات التجريبية أو القديمة (`Shadow API Protection`).
- **SEC-014**: فحص وتطهير استجابات البنوك الخارجية وحظر الحالات الشاذة (`Upstream Bank Anomaly Interception`).

### 7. الامتثال والتقارير التنظيمية (Regulatory & Compliance)
- توافق مع منشور البنك المركزي التونسي 2018-16 (معايير مزودي خدمات الدفع PSP).
- توافق مع بيئة الاختبار التنظيمية لمصرف قطر المركزي (QCB FinTech Sandbox).
- تصدير حزمة التدقيق الشاملة (`Compliance Audit Package JSON`) بضغطة زر.

---

## 🛡️ Security and Financial Safety

> **Walleo Sentinel Engine is a risk-evaluation and routing layer.**  
> It does not independently authorize bank transfers or override mandatory financial controls.

Every payout is governed by:
- **Server-side authorization and tenant isolation**: Strict object-level checking on all database queries.
- **Financial invariants and double-entry ledger controls**: Mandatory pre-payout `HOLD` before calling AI or external APIs.
- **Idempotency and concurrency protection**: Atomic database constraints and distributed locks preventing race conditions.
- **Signed and replay-protected bank/PSP webhooks**: HMAC-SHA256 validation with constant-time equality and 5-minute replay window.
- **Sentinel fail-safe routing to manual review**: Any AI error or timeout defaults immediately to human review.
- **Maker/Checker separation for sensitive decisions**: Role segregation cryptographically enforced in append-only event records.
- **Auditable, append-only event records**: Cryptographically chained SHA-256 ledger journals.

---

## 🚦 Production Release Gates

Detailed release criteria are documented in [`docs/release-gates/production-pilot.md`](./docs/release-gates/production-pilot.md), requiring 100% CI pass rates across all 22 financial & security invariants, SAST/DAST clearance, and dual-party regulatory approvals before any live production pilot.

---

## 🛠️ البنية التقنية

- **الواجهة الأمامية (Frontend):** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **الواجهة الخلفية (Backend API):** Node.js, Express, TypeScript (`tsx` dev / `esbuild` prod bundle).
- **محرك الذكاء الاصطناعي:** Gemini 3.8 Flash مع خطة احتياطية حتمية (Deterministic Fail-Safe Fallback).
- **القيود المحاسبية:** Atomic In-Memory Chained Double-Entry Ledger.

---

## 🚀 التشغيل والتطوير المحلي

```bash
# 1. تثبيت الحزم البرمجية
npm install

# 2. تشغيل السيرفر في وضع التطوير (Port 3000)
npm run dev

# 3. بناء المشروع للإنتاج
npm run build

# 4. تشغيل نسخة الإنتاج
npm start
```

---

## 🔐 المتغيرات البيئية (Environment Variables)

راجع ملف `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📄 الترخيص

مرخص وفق معايير أنظمة الدفع وحلول التكنولوجيا المالية (Walleo Fintech Platform).
