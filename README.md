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

### 5. مصفوفة الاختبارات المالية الحتمية الـ 8 (Financial Test Suite)
- **FT-01**: السحب الشرعي مع الحجز والتسوية (Legitimate Payout).
- **FT-02**: توجيه السحوبات ذات المخاطر غير الحاسمة للحجز والمراجعة (Inconclusive Velocity Gate).
- **FT-03**: الحظر الحتمي لمخالفات العقوبات والامتثال (Sanctions Hard Block).
- **FT-04**: منع التكرار والتزامن (Idempotency & Double-Click Protection).
- **FT-05**: الأمان التحفظي عند انقطاع الخدمة (Sentinel Timeout & Fallback).
- **FT-06**: عكس القيود عند فشل التحويل المصرفي (Bank Settlement Failure & Compensatory Reversal).
- **FT-07**: حماية ترتيب إشعارات الويب هوك (Out-of-Order Webhook Protection).
- **FT-08**: حظر تسريب البيانات الشخصية والمصرفية المشفرة (Zero PII Leakage / GDPR).

### 6. الامتثال والتقارير التنظيمية (Regulatory & Compliance)
- توافق مع منشور البنك المركزي التونسي 2018-16 (معايير مزودي خدمات الدفع PSP).
- توافق مع بيئة الاختبار التنظيمية لمصرف قطر المركزي (QCB FinTech Sandbox).
- تصدير حزمة التدقيق الشاملة (`Compliance Audit Package JSON`) بضغطة زر.

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
