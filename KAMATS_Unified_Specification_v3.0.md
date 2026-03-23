# KAMATS Unified Specification
## Kano Alum Management and Transparency System
### Authoritative System Design & Implementation Specification

---

**Document Version:** 3.0
**Date:** March 2026
**Prepared by:** HUBUK Technology Limited
**Reference:** HUBUK/KN-WTP/2026/SPEC-003
**Supersedes:** Implementation Plan v2.0 (HUBUK/KN-WTP/2026/IMPL-002) + Flowcharts v1.1 (HUBUK/KN-WTP/2026/FLOW-001)

---

## Revision Notes (v2.0 → v3.0)

This revision unifies the Implementation Plan v2.0 and Process Flowcharts v1.1 into a single authoritative specification, resolving all identified conflicts and gaps:

- **16-module architecture** adopted from the flowcharts (replacing the 15-module structure in the implementation plan)
- **Pre-Weighbridge Quality Sampling** retained as Module 4 — quality gate before stock enters the facility
- **Weighbridge sequence corrected:** Gross (loaded truck) → Unload → Tare (empty truck) → Net (flowcharts' realistic single-weighbridge sequence)
- **GRN & Physical Check** separated into standalone Module 6 (no longer combined with Weighbridge as Module 4)
- **19 actors** defined — Gate/Security Officer added as Actor 19
- **9 new database tables** added: `driver_visit_records`, `dosage_rate_configurations`, `alerts`, `alert_rules`, `notifications`, `reorder_point_configs`, `system_configurations`, `investigation_records`, `return_orders`
- **Missing columns added:** `stores.parent_store_id`, `items.current_store_id`
- **All missing FK constraints** added
- **Stock ledger concurrency** specified: `SELECT FOR UPDATE` + `SERIALIZABLE` isolation for balance operations
- **Audit hash chain redesigned:** per-store chains, canonical JSON serializer, `TRIGGER` replaces `RULE`
- **Document number formats unified** across plan and flowcharts
- **All missing API endpoints** added (rejections, amendments, sync, config, biometric enrollment)
- **Offline sync protocol** fully specified with conflict resolution, delta sync, and incremental delivery
- **Security specification** completed: CORS, rate limiting, JSONB validation, photo upload limits, device binding
- **AutoMapper replaced by Mapperly** (source-generated, no runtime reflection)
- **Dosage thresholds** made dynamic with seasonal adjustment factors
- **Segregation of duties** technically enforced via middleware validation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Module Specifications (M1–M16)](#2-module-specifications)
   - 2.1 Group 1: Procurement (M1–M6)
   - 2.2 Group 2: Inventory Management (M7–M10)
   - 2.3 Group 3: Distribution Management (M11–M13)
   - 2.4 Group 4: Consumption Management (M14–M16)
   - 2.5 Cross-Cutting Concerns
3. [Actor Definitions & RBAC (19 Actors)](#3-actor-definitions--rbac)
4. [Database Schema (Complete)](#4-database-schema)
5. [API Specification (Complete)](#5-api-specification)
6. [Offline Sync Protocol](#6-offline-sync-protocol)
7. [Security Specification](#7-security-specification)
8. [Hardware Integration](#8-hardware-integration)
9. [Revised Phase Plan](#9-revised-phase-plan)
10. [Verification & Testing Strategy](#10-verification--testing-strategy)

---

## 1. System Overview

### 1.1 Purpose & Scope

KAMATS is a comprehensive supply chain transparency system designed to track Aluminium Sulphate (Alum) across every node of Kano State Water Board's supply chain — from the moment a supplier's truck arrives at the gate to the moment the last kilogram is dosed into a water treatment tank.

The system implements a **hybrid tracking strategy**: deliveries are verified at the batch level at the gate (quality sampling) and weighbridge, and every individual bag is assigned a unique QR code at the Central Store during lot registration, providing complete chain-of-custody from delivery to consumption.

### 1.2 Stakeholders

| Stakeholder | Interest |
|---|---|
| Kano State Water Board | Operational transparency, loss prevention, water treatment quality |
| State Government | Accountability for public procurement expenditure |
| Treatment Plant Staff | Operational tools (dosage guidance, stock visibility) |
| Suppliers | Clear delivery requirements, performance feedback |
| Public | Safe, properly treated water supply |
| HUBUK Technology Limited | System developer and initial support provider |

### 1.3 Three-Tier Distribution Model

```
SUPPLIER
    ↓  [Gate Check (DVR) → Quality Sampling → Weighbridge → GRN]
CENTRAL STORE (1 instance)
    ↓  [Stock Transfer Order + Transfer Dispatch Note]
UNIT STORES (multiple instances — regional distribution hubs)
    ↓  [Stock Transfer Order + Transfer Dispatch Note]
USER STORES / TREATMENT PLANTS (multiple instances)
    ↓  [Consumption Recording + Dosage Validation]
FINAL CONSUMPTION
```

**Known Facilities:**
1. Challawa Water Treatment Plant (CWTP) — Challawa Industrial Area, Kano
2. Tamburawa Water Treatment Plant (TWTP) — Tamburawa, Kano
3. Wudil Water Treatment Plant (WWTP) — Wudil LGA, Kano
4. Bagauda Water Treatment Plant (BWTP) — Bagauda Dam, Kano

> **NOTE:** Exact store count (Unit Stores and User Stores) must be confirmed with KSWB before capacity planning and device procurement can be finalised.

### 1.4 Sixteen-Module Architecture

| # | Module | Group | Primary Document(s) |
|---|--------|-------|---------------------|
| M1 | Supplier Management | Procurement | Supplier Registration |
| M2 | Purchase Requisition | Procurement | PR-YYYY-NNNN |
| M3 | Purchase Order | Procurement | PO-YYYY-NNNN |
| M4 | Pre-Weighbridge Quality Sampling | Procurement | DVR-YYYY-NNNN + INS-YYYY-NNNN |
| M5 | Weighbridge | Procurement | WT-YYYY-NNNN |
| M6 | GRN & Physical Check | Procurement | GRN-YYYY-NNNN |
| M7 | Lot & Item Registration (QR) | Inventory | LOT-YYYY-NNNN + QR Labels |
| M8 | Warehouse Location Management | Inventory | Put-Away Record |
| M9 | Stock Ledger & Inventory Control | Inventory | SL-YYYY-NNNNNNNN |
| M10 | Physical Stock Count & Reconciliation | Inventory | SCO-YYYY-NNNN |
| M11 | Stock Transfer Order | Distribution | STO-YYYY-NNNN |
| M12 | Transfer Dispatch & Chain of Custody | Distribution | TDN-YYYY-NNNN |
| M13 | Transfer Receipt & Custody Confirmation | Distribution | GRD-YYYY-NNNN |
| M14 | User Store Inventory & Consumption | Consumption | CONS-YYYY-NNNN |
| M15 | Dosage Validation & Analytics | Consumption | Anomaly Report |
| M16 | Loss Management & Write-Offs | Consumption | WO-YYYY-NNNN |

**Cross-cutting concerns** (not numbered as modules): Authentication & Authorization, Audit Trail, Alert System, Reporting & Dashboard, Offline Sync.

### 1.5 Core Design Principles

| Principle | Implementation |
|---|---|
| **No Transaction Without a Document** | Every stock movement requires a pre-approved governing document (PO, STO) before any bag can move |
| **Dual Confirmation on Every Transfer** | Dispatch officer scans bags out; receiving officer independently scans bags in — both authenticate |
| **Segregation of Duties** | No actor can both initiate and approve any transaction — enforced by system middleware, not just policy |
| **Immutable Audit Trail** | Every system event is cryptographically hash-chained (per-store chains); no record can be altered or deleted |
| **FIFO Enforcement** | Oldest lot is always picked first for distribution — enforced by the system, not manual selection |
| **Dosage Cross-Validation** | Consumption claims are automatically validated against water volumes treated using dynamic seasonal thresholds |
| **Quality Before Entry** | Pre-weighbridge sampling ensures sub-standard Alum never enters the facility |
| **Minimum Manual Entry** | System auto-generates PRs, STOs, and Lot records from transaction events; weighbridge auto-captures weight |

### 1.6 Technology Stack

#### 1.6.1 Backend Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | .NET | 10.0 LTS | Core runtime |
| Web Framework | ASP.NET Core | 10.0 | REST API, SignalR hubs |
| ORM | Entity Framework Core | 10.0 | Database access, migrations |
| Database | PostgreSQL | 16 | Primary data store |
| Audit Database | PostgreSQL | 16 | Append-only, separate instance |
| Caching | Redis | 7.x | Distributed cache, session |
| Message Queue | RabbitMQ | 3.12 | Async processing, alerts |
| API Gateway | Traefik | 3.6.x | Reverse proxy, routing, rate limiting |
| Background Jobs | Hangfire | 1.8 | Scheduled tasks (ROP checks, reports) |
| Logging | Serilog | 3.x | Structured logging |
| Validation | FluentValidation | 11.x | Request validation |
| **Mapping** | **Mapperly** | **4.x** | **Source-generated object mapping (replaces AutoMapper)** |
| Documentation | Swagger / OpenAPI | 6.x | API documentation |
| Cryptography | .NET SHA256 (built-in) | — | Audit hash chain |

#### 1.6.2 Frontend Stack (Web Dashboard)

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 18.x | UI framework |
| State Management | Redux Toolkit | 2.x | State management |
| UI Components | Ant Design | 5.x | Component library |
| Charts | Recharts | 4.x | Consumption analytics, stock charts |
| HTTP Client | Axios | 1.x | API communication |
| Real-time | SignalR Client | 8.x | Live dashboard updates |

#### 1.6.3 Mobile Stack (Flutter)

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Flutter | 3.19+ | Cross-platform (Android / iOS) |
| State Management | flutter_bloc | 8.x | BLoC pattern |
| Local Database | drift (SQLite) | 2.x | Offline-first local storage |
| QR Scanning | mobile_scanner | 3.x | High-performance QR scan |
| QR Generation | qr_flutter | 4.x | QR code rendering |
| Biometrics | local_auth | 2.x | Device-local fingerprint / Face ID |
| USB Serial | usb_serial | 0.5.x | Weighbridge scale integration (Android) |
| HTTP Client | dio | 5.x | REST API calls |
| DI | get_it + injectable | 7.x | Dependency injection |

#### 1.6.4 Infrastructure Stack

| Component | Technology | Purpose |
|---|---|---|
| Hosting | Galaxy Backbone (Kano DC) | Nigerian data sovereignty |
| Containerisation | Docker | Application containerisation |
| Orchestration | Docker Compose | Multi-container management |
| Reverse Proxy | Nginx | SSL termination, load balancing |
| Monitoring | Prometheus + Grafana | Metrics, uptime, performance |
| Log Aggregation | Seq | Centralised structured log viewer |
| Backup | pgBackRest | PostgreSQL backup and recovery |
| CI/CD | GitHub Actions | Automated build and deployment |

### 1.7 End-to-End Data Flow

```
PROCUREMENT FLOW:
Stock below ROP → Auto PR → Approved PR → PO Created → PO Approved (2-stage)
    → Supplier Delivers → Gate DVR Created → Pre-Weighbridge Quality Sampling
    → Quality PASS → Truck to Weighbridge → Gross Weight Captured
    → Truck to Unloading Bay → GRN Physical Count → Truck Returns
    → Tare Weight → Net Weight Verified → GRN Finalised
    → Lot Created → QR Labels Printed → Put-Away

DISTRIBUTION FLOW:
Unit/User Store below ROP → Auto STO Draft → STO Approved → FIFO Bags Reserved
    → Scan-Out at Source → TDN Generated
    → [In Transit] → Scan-In at Destination → GRD Generated
    → Ledger Updated Both Ends

CONSUMPTION FLOW:
Treatment Session Started → Volume Entered → Dosage Suggested
    → Bags Scanned → Consumption Submitted
    → Dosage Validation Runs (dynamic thresholds) → Anomaly Flag (if deviation)
    → Lifecycle Closed: Consumed Status

LOSS FLOW:
Loss Identified → Write-Off Request Raised → Photos + Description
    → Approval (tiered by quantity) → Ledger Adjusted
    → Cumulative Loss Monitoring → Threshold Alerts
```

### 1.8 Unified Document Number Formats

All document numbers are system-generated, sequential, and immutable.

| Document | Format | Generated By |
|---|---|---|
| Purchase Requisition | PR-YYYY-NNNN | M2 |
| Purchase Order | PO-YYYY-NNNN | M3 |
| Driver Visit Record | DVR-YYYY-NNNN | M4 |
| Inspection Record | INS-YYYY-NNNN | M4 |
| Weighbridge Ticket | WT-YYYY-NNNN | M5 |
| Goods Received Note | GRN-YYYY-NNNN | M6 |
| Lot Number | LOT-YYYY-NNNN | M7 |
| Item Code | ITM-YYYY-NNNNNN | M7 |
| Stock Ledger Entry | SL-YYYY-NNNNNNNN | M9 |
| Stock Count Order | SCO-YYYY-NNNN | M10 |
| Stock Transfer Order | STO-YYYY-NNNN | M11 |
| Transfer Dispatch Note | TDN-YYYY-NNNN | M12 |
| Goods Receipt at Destination | GRD-YYYY-NNNN | M13 |
| Consumption Record | CONS-YYYY-NNNN | M14 |
| Write-Off Record | WO-YYYY-NNNN | M16 |

---

## 2. Module Specifications

### 2.1 Group 1: Procurement (Modules 1–6)

This group covers the full upstream procurement lifecycle — from supplier qualification through pre-weighbridge quality sampling, weight verification, physical receipt, and quality-cleared stock entering the Central Store.

**Operational Sequence (canonical):**

```
Supplier Registration (M1) → PR Raised (M2) → PO Issued (M3)
    → Truck Arrives at Gate → DVR Created → Quality Sampling (M4)
    → Quality PASS → Truck Proceeds to Weighbridge
    → Gross Weight (M5) → Truck to Unloading Bay → GRN Count (M6)
    → Truck Returns → Tare Weight (M5) → Net Weight Verified
    → GRN Finalised (M6) → Lot & QR Registration (M7)
```

---

#### Module 1 — Supplier Management

**What:** A controlled register of all approved Alum suppliers. Suppliers must be registered, vetted, and approved before any Purchase Order can be raised against them. Supplier performance is tracked continuously.

**Why:** Prevents procurement against fictitious or unapproved vendors — one of the most common public-sector procurement fraud vectors. Performance tracking enables evidence-based supplier management and flags persistently under-performing vendors.

**Actors:** Procurement Officer (create), Procurement Manager (approve/reject/suspend/deactivate)

**Documents Generated:** Supplier Registration Record

**Process Steps:**

1. Procurement Officer collects supplier details: legal name, CAC number, address, contact details, bank account, Tax ID
2. Officer submits Supplier Registration Request in system
3. System creates record — Status: `PendingApproval` — notifies Procurement Manager
4. Procurement Manager reviews registration (verifies CAC number, checks legitimacy)
5. Decision:
   - **Reject:** Manager enters rejection reason → Status: `Rejected` → Officer notified (may resubmit with corrections)
   - **Approve:** Manager approves → Status: `Active` → Supplier selectable on POs → Timestamp recorded

**Supplier Statuses:**
```
PendingApproval → Active → [Suspended | Deactivated]
                → Rejected (may resubmit)
```

**Performance Scorecard** (auto-updated after each delivery):
- **On-Time Delivery Rate:** actual delivery date vs. expected date from PO
- **Quantity Accuracy Rate:** net weight delivered vs. PO quantity (from Weighbridge Ticket)
- **Quality Acceptance Rate:** batches accepted vs. rejected at Pre-Weighbridge Quality Sampling (M4)

**Performance Monitoring:**
- System continuously evaluates scorecard after every delivery
- If any metric breaches configured threshold → Alert sent to Procurement Manager with scorecard summary
- Manager decides: Suspend / Deactivate / Accept (with note)
  - **Suspend:** Status → `Suspended`, all pending POs flagged
  - **Deactivate:** Status → `Deactivated`, no new POs possible
  - **Accept:** Alert closed, note added to record

**Business Rules:**
- A PO cannot be created unless the selected supplier status is `Active`
- Supplier status changes are permanently audited
- Only Procurement Manager can change supplier status

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/suppliers` | Register new supplier | `suppliers:create` |
| GET | `/api/v1/suppliers` | List suppliers (filterable by status) | `suppliers:read` |
| GET | `/api/v1/suppliers/{id}` | Get supplier details + scorecard | `suppliers:read` |
| PATCH | `/api/v1/suppliers/{id}/approve` | Approve supplier registration | `suppliers:approve` |
| PATCH | `/api/v1/suppliers/{id}/reject` | Reject supplier registration | `suppliers:approve` |
| PATCH | `/api/v1/suppliers/{id}/suspend` | Suspend active supplier | `suppliers:approve` |
| PATCH | `/api/v1/suppliers/{id}/deactivate` | Deactivate supplier | `suppliers:approve` |
| PATCH | `/api/v1/suppliers/{id}/reactivate` | Reactivate suspended supplier | `suppliers:approve` |
| GET | `/api/v1/suppliers/{id}/scorecard` | Get performance scorecard history | `suppliers:read` |

**Error Paths:**
- Attempt to create PO with non-Active supplier → HTTP 422 with validation error
- Attempt to approve supplier when already Active → HTTP 409 Conflict
- Attempt to suspend supplier with pending deliveries → allowed, but POs flagged with alert

---

#### Module 2 — Purchase Requisition (PR)

**What:** The formal internal demand signal that opens every procurement cycle — generated automatically when stock falls below the Reorder Point, or manually by a Procurement Officer with written justification.

**Why:** Eliminates discretionary procurement. Every purchase must originate from a documented, justified, quantity-specific request traceable to actual stock levels — not informal instruction. The PR is the anti-corruption gateway.

**Actors:** System (auto-generate), Procurement Officer (create/submit), Procurement Manager (approve/reject)

**Documents Generated:** PR-YYYY-NNNN

**Process Steps:**

*Trigger A — System-Generated (Auto-ROP):*
1. Hangfire daily stock check job reads Central Store balance from Stock Ledger (M9)
2. Balance ≤ Reorder Point?
   - **No:** Stock healthy — check tomorrow
   - **Yes:** Open PR already exists?
     - **Yes:** No duplicate created — Officer alerted that PR is in progress
     - **No:** System auto-creates Draft PR: `PR-YYYY-NNNN`, Trigger: `AutoReorderPoint`, Qty: Max Stock Level minus Current Balance, expiry date set, Officer notified

*Trigger B — Manual Requisition:*
1. Procurement Officer or Store Keeper initiates manual PR: quantity, justification, requested delivery date
2. System validates no duplicate open PR exists → creates Draft PR, Trigger: `Manual`

*Approval Workflow:*
3. Procurement Officer reviews Draft PR — adjusts qty if needed, adds notes
4. Officer submits PR for approval → Status: `Submitted` → Procurement Manager notified
5. Manager reviews: current stock, quantity, justification, budget period
6. Decision:
   - **Reject:** Manager enters rejection reason → Status: `Rejected` → returned to Officer (may resubmit)
   - **Approve:** Manager approves → Status: `Approved` → PR locked (no edits) → expiry clock starts → Officer notified

*Post-Approval:*
7. PR expires before PO raised? → Status: `Expired` → alerts Officer and Manager → re-raise if still needed
8. PO raised within expiry → PR linked to PO → Status: `ConvertedToPO`

**PR Statuses:**
```
Draft → Submitted → Approved → ConvertedToPO
                  → Rejected (may resubmit)
                  → Expired (if no PO raised within window)
```

**Business Rules:**
- Only one open PR per commodity at a time (prevents duplicate procurement)
- A PR must be `Approved` before a PO can reference it
- Approved PRs expire after a configurable number of days (stored in `system_configurations`)
- PR creator cannot be the PR approver (segregation of duties enforced at API level)

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/purchase-requisitions` | Create manual PR | `pr:create` |
| GET | `/api/v1/purchase-requisitions` | List PRs (filterable) | `pr:read` |
| GET | `/api/v1/purchase-requisitions/{id}` | Get PR details | `pr:read` |
| PATCH | `/api/v1/purchase-requisitions/{id}/submit` | Submit PR for approval | `pr:create` |
| PATCH | `/api/v1/purchase-requisitions/{id}/approve` | Approve PR | `pr:approve` |
| PATCH | `/api/v1/purchase-requisitions/{id}/reject` | Reject PR with reason | `pr:approve` |

**Error Paths:**
- Attempt to create PR when open PR exists → HTTP 409 Conflict
- Attempt to submit PR without required fields → HTTP 422 Validation Error
- Attempt to approve PR by the same user who created it → HTTP 403 Forbidden (segregation of duties)
- Attempt to create PO from expired PR → HTTP 422 "PR has expired"

---

#### Module 3 — Purchase Order (PO) Management

**What:** The formal contractual document issued to an approved supplier, authorizing delivery of a specified quantity of Alum at an agreed price. Every PO must reference an approved PR and be subject to two-stage approval.

**Why:** The PO establishes the expected quantity the Weighbridge will verify, the unit price Finance will match against invoices, and the delivery date for supplier performance measurement. Without a formal PO, the weighbridge has nothing to verify against and Finance has no basis for payment validation.

**Actors:** Procurement Officer (create/submit), Procurement Manager (Stage 1 approval), Finance Officer (Stage 2 approval)

**Documents Generated:** PO-YYYY-NNNN

**Process Steps:**

1. Procurement Officer opens PO creation — selects an Approved PR
2. System pre-fills quantity from PR — Officer selects Active Supplier, enters unit price and expected delivery date
3. System validates: Supplier Active? Price > 0? Delivery date in future? Calculates line total
4. Officer reviews and submits PO for Manager approval → Status: `Submitted` → Manager notified

*Two-Stage Approval:*
5. Procurement Manager reviews: supplier, quantity, price, delivery date acceptability
6. Manager Decision:
   - **Reject:** Enters rejection reason → Status: `ManagerRejected` → returned to Officer → PR remains `Approved`
   - **Approve:** Stage 1 complete → Status: `ManagerApproved` → Finance Officer notified
7. Finance Officer reviews: budget availability, price vs. contract, total value within authority
8. Finance Decision:
   - **Reject:** Enters rejection reason → Status: `FinanceRejected` → returned to Officer → Manager notified
   - **Approve:** Stage 2 complete → Status: `Issued` → PO LOCKED (no further edits) → `issued_at` timestamp recorded → Officer notified

*Post-Issue:*
9. System sends Supplier Notification: PO Number, Qty, Delivery date via SMS and email
10. Status: `AwaitingDelivery` → overdue alert scheduled for expected date + 1 day

**PO Statuses:**
```
Draft → Submitted → ManagerApproved → Issued (Finance Approved)
                  → ManagerRejected         → FinanceRejected
     → AwaitingDelivery → PartiallyReceived → FullyReceived → Closed
```

**PO Amendment Cycle:**
When an Issued PO requires changes (e.g., quantity adjustment, delivery date change):
1. Procurement Officer requests amendment → Status: `AmendmentPending`
2. Amendment must go through same two-stage approval (Manager → Finance)
3. All amendments are version-tracked with original values preserved in audit trail
4. Amended PO retains same PO number with amendment version suffix

**Business Rules:**
- PO cannot be created without an `Approved` PR
- PO cannot reference a non-`Active` supplier
- Issued PO is locked — no changes without formal amendment cycle
- PO creator ≠ PO Manager approver ≠ PO Finance approver (enforced by middleware)
- No delivery can be processed without a matching PO in `AwaitingDelivery` status

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/purchase-orders` | Create PO (ref Approved PR) | `po:create` |
| GET | `/api/v1/purchase-orders` | List POs (filterable) | `po:read` |
| GET | `/api/v1/purchase-orders/{id}` | Get PO details | `po:read` |
| PATCH | `/api/v1/purchase-orders/{id}/submit` | Submit PO for approval | `po:create` |
| PATCH | `/api/v1/purchase-orders/{id}/approve-manager` | Manager Stage 1 approval | `po:approve:manager` |
| PATCH | `/api/v1/purchase-orders/{id}/reject-manager` | Manager Stage 1 rejection | `po:approve:manager` |
| PATCH | `/api/v1/purchase-orders/{id}/approve-finance` | Finance Stage 2 approval | `po:approve:finance` |
| PATCH | `/api/v1/purchase-orders/{id}/reject-finance` | Finance Stage 2 rejection | `po:approve:finance` |
| POST | `/api/v1/purchase-orders/{id}/amendments` | Request PO amendment | `po:create` |
| PATCH | `/api/v1/purchase-orders/{id}/amendments/{amendId}/approve-manager` | Approve amendment (Manager) | `po:approve:manager` |
| PATCH | `/api/v1/purchase-orders/{id}/amendments/{amendId}/approve-finance` | Approve amendment (Finance) | `po:approve:finance` |

**Error Paths:**
- PO with non-Active supplier → HTTP 422
- PO with expired or non-Approved PR → HTTP 422
- Same user attempting both create and approve → HTTP 403 (segregation of duties)
- Same user attempting both Manager and Finance approval → HTTP 403
- Amendment on non-Issued PO → HTTP 422

---

#### Module 4 — Pre-Weighbridge Quality Sampling

**What:** A quality gate at the facility entrance. When a supplier's truck arrives, a sample is drawn and tested BEFORE the truck is allowed onto the weighbridge. If the Alum fails quality checks, the truck is turned away without ever entering the facility.

**Why:** Testing quality before the truck enters the weighbridge prevents sub-standard Alum from entering the supply chain at all. It also protects against the scenario where stock is received, stored, and only later discovered to be defective — by which time it may have been distributed. Additionally, it establishes the Driver Visit Record (DVR) which tracks every delivery attempt.

**Actors:** Gate/Security Officer (DVR creation, access control), Quality Inspector (sampling, testing), Procurement Officer (notified on rejection)

**Documents Generated:** DVR-YYYY-NNNN, INS-YYYY-NNNN

**Process Steps:**

*Gate Registration:*
1. Supplier truck arrives at facility gate
2. Gate/Security Officer stops truck at entry point
3. Officer registers a **Driver Visit Record (DVR):** driver full name, driver ID number, driver phone number, vehicle registration plate — linked to expected Supplier on PO
4. System creates `DVR-YYYY-NNNN` — Status: `PendingPOMatch`
5. Officer searches for matching PO by Supplier name in system

6. Decision — Valid PO found with status `AwaitingDelivery`?
   - **No PO found:** Officer blocks truck entry, contacts Procurement Officer, driver asked to wait → **BLOCKED** (no valid PO for this supplier, truck cannot enter facility)
   - **PO matched:** DVR linked to matched PO → DVR Status: `Active` → Quality Inspector notified (truck at gate, sampling required)

*Quality Sampling:*
7. Quality Inspector proceeds to gate/yard area where truck is parked
8. Inspector draws samples from accessible bags on the truck (minimum: 3 bags per 1,000 delivered)
9. Samples labelled with DVR reference number, taken to laboratory
10. Inspector records sampling details: bags sampled, sampling time, any visible concerns noted
11. Laboratory conducts tests:
    - **Visual check:** colour, appearance, foreign matter present?
    - **Physical state:** powder consistency, clumping, moisture level
    - **Purity/Grade:** verify supplier Certificate of Analysis (COA), field or lab test result
12. Inspector records results for each criterion in app, attaches lab photos → `INS-YYYY-NNNN` created

13. Decision — Overall Sampling Result:
    - **PASS (all criteria met):**
      - DVR Status → `QualityCleared`
      - `quality_cleared_at` timestamp recorded
      - Supplier Scorecard: Quality +
      - Weighbridge Operator notified: truck cleared to proceed
      - → **Truck proceeds to Weighbridge (Module 5 begins)**
    - **FAIL (criteria not met):**
      - Record each failed criterion (photos mandatory)
      - DVR Status → `QualityFailed`
      - PO stays: `AwaitingDelivery` (delivery not fulfilled)
      - Procurement Officer notified
      - Supplier notified of rejection
      - Supplier Scorecard: Quality −
      - Gate Officer instructs driver to depart
      - → **Truck turned away — goods never entered facility. Supplier must resupply.**

**Business Rules:**
- No truck may proceed to the weighbridge without a `QualityCleared` DVR status
- Minimum 3 bags sampled per 1,000 bags delivered
- Photos are mandatory for FAIL results
- A quality failure does NOT close the PO — the supplier may redeliver
- Quality Inspector cannot override a FAIL result — a new delivery attempt creates a new DVR

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/driver-visit-records` | Create DVR at gate | `dvr:create` |
| GET | `/api/v1/driver-visit-records` | List DVRs (filterable) | `dvr:read` |
| GET | `/api/v1/driver-visit-records/{id}` | Get DVR details | `dvr:read` |
| PATCH | `/api/v1/driver-visit-records/{id}/link-po` | Link DVR to matching PO | `dvr:create` |
| POST | `/api/v1/quality-inspections` | Create inspection record for DVR | `inspection:submit` |
| PATCH | `/api/v1/quality-inspections/{id}/submit-result` | Submit inspection result (Pass/Fail) | `inspection:submit` |
| GET | `/api/v1/quality-inspections/{id}` | Get inspection details | `inspection:read` |

**Error Paths:**
- Truck arrives with no matching PO → BLOCKED at gate (DVR created but truck not admitted)
- Quality Inspector attempts to clear a truck without completing all test criteria → HTTP 422
- Attempt to proceed to weighbridge without `QualityCleared` DVR → HTTP 422

---

#### Module 5 — Weighbridge

**What:** Weight verification of the delivery using a single-weighbridge facility. The loaded truck is weighed (gross), sent to the unloading bay for GRN processing (M6), then returns empty for a tare weigh. The system calculates net weight and verifies against the PO.

**Why:** The weighbridge eliminates short delivery fraud (truck delivers less than invoiced). The gross→unload→tare sequence is the operationally correct order for a single-weighbridge facility where the truck must be weighed loaded, unloaded elsewhere, and return for the empty weigh.

**Actors:** Weighbridge Operator (record weights), Weighbridge Supervisor (variance override/reject), Driver (signs ticket)

**Documents Generated:** WT-YYYY-NNNN

**Process Steps:**

*Session Creation:*
1. Truck cleared by Quality Sampling (DVR Status: `QualityCleared`)
2. Weighbridge Operator opens Weighbridge session — links to PO and DVR
3. System pre-fills from DVR: driver name, vehicle registration, supplier, PO reference → Session `WT-YYYY-NNNN` created

*Step 1 — Gross Weight (Loaded Truck):*
4. Loaded truck drives onto weighbridge scale
5. Weight capture mode:
   - **Mode A — Auto:** System auto-captures Gross Weight from digital scale, waits for stable reading (variance < 0.01 kg over 3 consecutive readings within 30 seconds)
   - **Mode B — Manual:** If no stable reading in 30 seconds, Operator manually enters Gross Weight (kg) — requires Weighbridge Supervisor's PIN confirmation; `ManualEntry` flag permanently recorded
6. Gross Weight recorded with `gross_weight_at` timestamp (cannot be manually edited after capture)
7. Operator instructs truck: proceed to Central Store unloading bay
8. System notifies Central Store Keeper: truck en route to bay, gross weight captured, begin unloading

*Unloading Phase (Module 6 runs):*
9. Module 6 (GRN & Physical Check) runs at unloading bay — Store Keeper counts bags and inspects for damage
10. System receives notification from Module 6: unloading complete, truck returning for tare weight

*Step 2 — Tare Weight (Empty Truck):*
11. Truck (now empty or carrying only rejected bags) returns to weighbridge scale
12. Weight capture mode (same Auto/Manual logic as Step 1)
13. Tare Weight recorded with `tare_weight_at` timestamp

*Net Weight Calculation:*
14. System calculates: **Net Weight = Gross Weight − Tare Weight** (auto-calculated, cannot be edited)
15. System calculates: **Variance % = |Net Weight − PO Ordered Quantity| / PO Ordered Quantity × 100**

16. Decision — Variance within tolerance (±2%)?
    - **PASS:** Ticket Status: `Pass` → `WT-YYYY-NNNN` finalised, all timestamps complete
    - **FAIL (exceeds tolerance):** BLOCKS ticket completion → Variance flag raised → Weighbridge Supervisor notified
      - Supervisor physically reviews discrepancy, may instruct reweigh
      - Supervisor Decision:
        - **Override — accept:** Supervisor enters mandatory justification → Override recorded in audit trail (Supervisor ID, Reason, Timestamp) → Ticket Status: `OverrideApproved`
        - **Reject delivery:** Delivery Rejection Order generated → PO stays `AwaitingDelivery` → Supplier Scorecard: Quantity − → **REJECTED** (truck departs, supplier must redeliver)

*Ticket Completion:*
17. WB Ticket printed (two copies): Operator signs, Driver signs — one retained at WB, one given to driver
18. System notifies Central Store Keeper: net weight confirmed, WT reference, proceed to finalise GRN in Module 6

**Business Rules:**
- Gross weight MUST be captured before tare weight (enforced by system — tare weight entry is blocked until gross weight exists)
- Manual weight entry requires Supervisor PIN confirmation and is permanently flagged
- Variance tolerance is configurable (default: ±2%) — stored in `system_configurations`
- Only Weighbridge Supervisor can override a variance — Operator cannot
- A rejected delivery does NOT close the PO — supplier may redeliver

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/weighbridge-tickets` | Create weighbridge session (link DVR + PO) | `weighbridge:record` |
| PATCH | `/api/v1/weighbridge-tickets/{id}/gross-weight` | Record gross weight | `weighbridge:record` |
| PATCH | `/api/v1/weighbridge-tickets/{id}/tare-weight` | Record tare weight | `weighbridge:record` |
| PATCH | `/api/v1/weighbridge-tickets/{id}/override` | Supervisor variance override | `weighbridge:override` |
| PATCH | `/api/v1/weighbridge-tickets/{id}/reject` | Supervisor reject delivery | `weighbridge:override` |
| GET | `/api/v1/weighbridge-tickets` | List tickets (filterable) | `weighbridge:read` |
| GET | `/api/v1/weighbridge-tickets/{id}` | Get ticket details | `weighbridge:read` |

**Error Paths:**
- Attempt to create session without `QualityCleared` DVR → HTTP 422
- Attempt to record tare weight before gross weight → HTTP 422
- Variance > 2% without supervisor override → ticket blocked (HTTP 422 on finalise)
- Operator attempting to override variance → HTTP 403

---

#### Module 6 — GRN & Physical Check

**What:** Physical counting and inspection of bags at the unloading bay. The truck arrives from the weighbridge after gross weight capture, bags are unloaded and counted, damaged bags identified and quarantined, and the GRN is created. This happens BETWEEN the gross and tare weighbridge measurements.

**Why:** The GRN enforces a formal physical count separate from the weight verification. Making the GRN a distinct module from the weighbridge ensures the Store Keeper and Weighbridge Operator are always different people (segregation of duties). Separating it also allows the system to cross-reference the bag count (GRN) against the net weight (Weighbridge Ticket) as an additional verification.

**Actors:** Central Store Keeper (count, inspect, create GRN), Witness (present throughout unloading), Procurement Officer (notified on damage for supplier credit/return)

**Documents Generated:** GRN-YYYY-NNNN

**Process Steps:**

*Physical Unloading:*
1. Truck arrives at unloading bay (gross weight already captured in M5)
2. Central Store Keeper receives truck at bay, confirms WT reference with driver
3. Store Keeper AND Witness both present throughout unloading process
4. Unloading begins: all bags offloaded from truck to bay area
5. Store Keeper physically counts every bag as it is offloaded
6. Store Keeper inspects each bag: torn or burst packaging? Contaminated contents? Wet or moisture-damaged?

7. Decision — Any damaged bags found?
   - **Yes — damaged bags found:**
     - Damaged bags set aside to designated quarantine area, labelled: `QUARANTINE — DO NOT USE`
     - System records: total bags offloaded, damaged bag count, accepted bags = total − damaged, photos of damage attached
   - **No damage:**
     - Store Keeper records all bag count details in mobile app

8. Truck returns to Weighbridge for tare weight (whether empty or carrying rejected bags only)
9. System notifies Weighbridge Operator: unloading complete, truck returning for tare weight

*GRN Creation (after Weighbridge Ticket finalised):*
10. System delivers confirmed Net Weight to this GRN session from `WT-YYYY-NNNN`
11. Store Keeper opens GRN in system — links to WT reference
12. System creates `GRN-YYYY-NNNN` pre-filled from WT and DVR: PO reference, supplier, DVR, net weight from WB ticket, bags accepted count

13. Decision — Any damaged bags recorded?
    - **No (bags_damaged = 0):** GRN Status: `Accepted` — all bags cleared for Lot creation in Module 7
    - **Yes (bags_damaged > 0):** GRN Status: `PartiallyAccepted` — accepted bags proceed to M7, damaged bags → write-off process via Module 16, Procurement Officer notified for supplier credit or return

14. Store Keeper reviews and submits GRN → `submitted_at` timestamp → Central Store Manager notified
15. GRN-YYYY-NNNN confirmed → triggers Module 7 (Lot & QR Registration)

**GRN Statuses:**
```
Draft → Accepted (no damage)
     → PartiallyAccepted (some damage — accepted bags proceed, damaged bags to M16)
```

**Business Rules:**
- GRN cannot be created without a finalised Weighbridge Ticket (`Pass` or `OverrideApproved`)
- Both Store Keeper and Witness must be present during unloading (Witness recorded in GRN)
- Damaged bags are NOT added to available stock — they route to Module 16 (Loss Management)
- GRN creator ≠ Weighbridge Operator (different actors by design; enforced by role separation)

**Cross-Reference Validation:**
The system compares:
- **Bag count × standard weight** (from GRN) vs. **Net weight** (from WT)
- If these differ beyond tolerance → warning flag for investigation (bags heavier/lighter than standard)

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/goods-received-notes` | Create GRN (ref WT ticket) | `grn:create` |
| PATCH | `/api/v1/goods-received-notes/{id}/record-count` | Record bag count and damage | `grn:create` |
| PATCH | `/api/v1/goods-received-notes/{id}/submit` | Submit GRN | `grn:create` |
| GET | `/api/v1/goods-received-notes` | List GRNs (filterable) | `grn:read` |
| GET | `/api/v1/goods-received-notes/{id}` | Get GRN details | `grn:read` |

**Error Paths:**
- Attempt to create GRN without finalised WT ticket → HTTP 422
- Attempt to submit GRN without bag count recorded → HTTP 422
- Bag count × standard weight deviates significantly from WT net weight → warning flag (not blocking)

---

### 2.2 Group 2: Inventory Management (Modules 7–10)

This group governs stock organisation, tracking, and verification within stores — primarily the Central Store.

---

#### Module 7 — Lot & Item Registration (QR Labelling)

**What:** The process of converting an accepted GRN into individually trackable inventory items. Each delivery is registered as a Lot, and each physical bag receives a unique QR code label — making it a scannable, traceable item for the remainder of its lifecycle.

**Why:** Without a QR label, a bag is anonymous — it cannot be verified against its PO, traced if it disappears, or linked to a specific delivery. The QR label is the bag's identity document for every subsequent transaction. It also enforces FIFO: every bag carries its receipt date and lot sequence number, enabling the system to enforce oldest-first selection at every distribution step.

**Actors:** Central Store Keeper (print labels, attach, scan), Witness (present during labelling), Central Store Manager (investigate discrepancies)

**Documents Generated:** LOT-YYYY-NNNN, QR Labels (one per bag), Item Codes (ITM-YYYY-NNNNNN)

**Process Steps:**

*Lot Creation (System-Automated on GRN Acceptance):*
1. GRN status is `Accepted` (or `PartiallyAccepted` — only accepted bags proceed)
2. System auto-creates Lot record:
   - Lot Number: `LOT-YYYY-NNNN` (system-generated)
   - Linked: GRN Number, PO Number, Supplier, Receipt Date
   - Standard weight per bag (from PO line)
   - Total bags = GRN `bags_accepted`
   - FIFO Sequence Number (auto-incremented — enforces oldest-first selection)
   - Status: `PendingLabelling`
3. System generates unique QR codes — one per accepted bag
   - QR encodes: Item ID, Lot Number, PO Reference, Receipt Date, Weight
   - QR URL format: `https://kamats.kanostate.gov.ng/item/{itemCode}`
4. Label print job queued → Store Keeper notified: Lot ready for labelling

*QR Label Printing & Attachment:*
5. Store Keeper opens Lot in mobile app/workstation
6. Sends print job to connected thermal label printer
7. Printer outputs batch of labels: QR code, Item Code, Lot No., Weight (e.g. 50kg), Date, KSWB logo
   - Label size: 100mm × 50mm standard logistics label
8. Store Keeper AND Witness both present for labelling process
9. Store Keeper attaches label to next bag
10. Store Keeper scans attached label with scanner

11. Decision — Scan validation:
    - **Invalid or duplicate:** ALERT: Invalid or duplicate scan — bag NOT registered, audit event logged → investigate label printing error
    - **Valid:** Bag updated: Status → `InStock`, `labelled_at` timestamp, `labelled_by` User ID, Lot `bags_in_stock` +1

12. Decision — All bags in Lot labelled and scanned?
    - **No:** Continue: attach and scan next bag (loop to step 9)
    - **Yes:** System checks: bags scanned = GRN `bags_accepted`?

13. Decision — Count matches?
    - **Discrepancy:** ALERT: Expected X, Scanned Y, Variance = X − Y → notifies Central Store Manager
      - Manager investigates before Lot activates
      - If resolved → recount and rescan
      - If genuine shortage → shortage logged, Lot activated with actual count, investigation opened
    - **Matches:** Lot Status → `Active`, all bags `InStock`
      - Stock Ledger Receipt entry created (+) → Central Store balance updated
      - Store Keeper notified: ready for put-away (Module 8)

**Item (Bag) Statuses:**
```
PendingLabelling → InStock → Reserved → InTransit → Consumed
                        ↘ PartiallyConsumed → Consumed
                        ↘ Quarantined
                        ↘ Damaged / Lost (with write-off record)
                        ↘ Returned (supplier return)
```

**Business Rules:**
- No bag can be issued or transferred without `InStock` status
- QR codes are unique and non-reusable — a consumed bag's QR is permanently retired
- Lot FIFO sequence number governs pick order for all outbound STOs
- Label printing requires physical witness presence (recorded in system)

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/lots` | List lots (filterable by store, status) | `lots:read` |
| GET | `/api/v1/lots/{id}` | Get lot details with item list | `lots:read` |
| POST | `/api/v1/lots/{id}/generate-labels` | Generate QR labels for lot | `labels:print` |
| PATCH | `/api/v1/items/{id}/scan-label` | Confirm label affixed to bag | `items:label` |
| GET | `/api/v1/items/{qrCode}` | Lookup item by QR scan | `items:read` |
| GET | `/api/v1/items/{id}` | Get item details | `items:read` |
| GET | `/api/v1/items/{id}/lifecycle` | Full lifecycle history of a bag | `items:read` |

---

#### Module 8 — Warehouse Location Management

**What:** A structured digital map of the Central Store's physical layout — organised into Zones, Rows, and Bin Positions — tracking the exact physical location of every Lot and bag at all times.

**Why:** Unlocated stock cannot be meaningfully counted, cannot be efficiently picked, and cannot reveal unauthorized movement. Location management converts the warehouse from an opaque room into an auditable, mappable space.

**Actors:** Central Store Keeper (put-away, location moves), System Administrator (configure locations)

**Documents Generated:** Put-Away Record

**Process Steps:**

*Location Structure:*
```
Central Store
    └── Zone (e.g., Zone-A, Zone-B)
            └── Row (e.g., Row-01, Row-02)
                    └── Bin Position (e.g., CS-A-01-01)
                                └── Current: Lot(s) + Bag Count + Weight
```

*Put-Away Process (after QR labelling in M7):*
1. Lot `Active`, bags `InStock`, not yet bin-located
2. System calculates put-away suggestion based on: available bin capacity (kg), FIFO (new lot placed BEHIND older lots), zone rules if configured
3. Suggested bin location displayed (e.g., CS-A-1-03) showing: zone, row, bin, capacity
4. Store Keeper reviews suggested bin location

5. Decision — Accept suggested location?
   - **Override:** Store Keeper selects alternative bin, must enter reason → override reason logged in audit trail
   - **Accept:** Proceed

6. Store Keeper physically moves bags to assigned bin location
7. Opens put-away confirmation in mobile app, selects this Lot's put-away task
8. Store Keeper scans the BIN LOCATION QR code on the shelf

9. Decision — Bin validation:
   - **Wrong bin:** ALERT: Wrong bin scanned — expected CS-A-1-03 — move bags to correct location (loop to step 6)
   - **Correct bin:** Store Keeper scans each bag QR code to confirm placement in this bin

10. System updates each bag: `bag_location_id` assigned, `put_away_at` timestamp, `put_away_by` User ID

11. Decision — All bags in this lot placed?
    - **No:** Continue placing bags (loop)
    - **Yes:** Bin Location record updated: `current_bags` +, `current_weight_kg` +, Status → `Occupied` or `Full`

12. Decision — Lot requires multiple bins (overflow)?
    - **Yes:** System identifies next available bin for remaining bags (loop to suggestion step)
    - **No:** PUT-AWAY COMPLETE — all bags bin-located, warehouse map updated

**Business Rules:**
- A bin cannot be assigned weight exceeding its configured max capacity
- Internal location-to-location moves within the Central Store require a logged Internal Transfer — not silent reorganisations
- Location override reasons are permanently recorded in audit trail
- Bin location QR codes are separate from bag QR codes

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/storage-locations` | List all locations (filterable by store, zone, status) | `locations:read` |
| POST | `/api/v1/storage-locations` | Create new storage location | `locations:manage` |
| PATCH | `/api/v1/storage-locations/{id}` | Update location details | `locations:manage` |
| PATCH | `/api/v1/items/{id}/put-away` | Assign item to bin location | `items:putaway` |
| POST | `/api/v1/internal-transfers` | Record internal location move | `items:putaway` |
| GET | `/api/v1/storage-locations/{id}/contents` | Get current contents of a bin | `locations:read` |
| GET | `/api/v1/stores/{storeId}/warehouse-map` | Get full warehouse occupancy map | `locations:read` |

---

#### Module 9 — Stock Ledger & Inventory Control

**What:** The real-time, perpetual quantity record of all Alum stock at every location across all three tiers. The system's single source of truth for stock balances. Every stock movement in every other module results in an automatic ledger entry here. No user can write to the ledger directly.

**Why:** Every theft, loss, or misuse creates a variance between the ledger and physical reality. The Stock Ledger makes that variance visible and measurable. It is also the engine behind automated reorder triggers — the PR in Module 2 and the STO in Module 11 are only as reliable as the balance they read from here.

**Actors:** System only — no human writes directly to the ledger

**Documents Generated:** SL-YYYY-NNNNNNNN (8-digit sequence — system-generated)

**Process Steps:**

This module is **always-on** — no user trigger needed. Ledger entries are auto-created whenever a triggering event occurs elsewhere.

*Automated Ledger Entry Triggers:*

| Trigger Event | Entry Type | Direction | Store | Reference Document |
|---|---|---|---|---|
| GRN Accepted + QR labels printed (M7) | RECEIPT | + | Central Store | GRN number |
| STO Dispatch / TDN generated (M12) | ISSUE | − | Source Store | TDN number |
| STO Receipt / GRD confirmed (M13) | TRANSFER_RECEIPT | + | Destination Store | GRD number |
| Consumption submitted (M14) | CONSUMPTION | − | User Store | CONS number |
| Count adjustment approved (M10) | ADJUSTMENT | ±  | Adjusted Store | SCO number |
| Write-off approved (M16) | WRITE_OFF | − | Affected Store | WO number |
| Supplier return (M16) | RETURN | − | Central Store | WO number |

*Each Ledger Entry Records:*
- Entry Number: `SL-YYYY-NNNNNNNN`
- Server-side timestamp (authoritative)
- Store ID, Lot ID
- Transaction type (from enum above)
- Quantity bags (signed: positive = in, negative = out)
- Weight kg
- Reference document number
- **Balance BEFORE** and **Balance AFTER** (atomically computed — see concurrency strategy below)

*Hard Constraints:*
- **No entry allowed that would make balance go below ZERO** — attempt blocked and alerted
- No user can write directly to the ledger — only the system creates entries
- Every entry is immutably linked to a source document

*Reorder Point Monitoring:*
- After every Central Store ledger entry: system checks balance ≤ Reorder Point?
  - **No:** Balance healthy — continue monitoring
  - **Yes:** Auto-PR process triggered → Module 2 begins → Procurement Officer and Central Store Manager alerted

**Concurrency Strategy (Critical):**

`balance_before` / `balance_after` requires atomic read-then-write. The system uses:

1. **`SELECT FOR UPDATE`** on the store's current balance row in `store_balances` table — locks the row for the duration of the transaction
2. **`SERIALIZABLE`** transaction isolation for all balance-modifying operations
3. Sequence:
   ```sql
   BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
   SELECT current_balance FROM store_balances WHERE store_id = $1 AND lot_id = $2 FOR UPDATE;
   -- Validate: current_balance + quantity >= 0 (no negative balance)
   INSERT INTO stock_ledger (..., balance_before, balance_after) VALUES (..., current_balance, current_balance + quantity);
   UPDATE store_balances SET current_balance = current_balance + quantity WHERE store_id = $1 AND lot_id = $2;
   COMMIT;
   ```
4. On serialization failure → automatic retry (up to 3 attempts)

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/stock-ledger/{storeId}` | Current stock balance by store | `ledger:read` |
| GET | `/api/v1/stock-ledger/{storeId}/entries` | Ledger entries (filterable by date, lot, type) | `ledger:read` |
| GET | `/api/v1/stock-ledger/{storeId}/balance-history` | Balance over time for a store | `ledger:read` |

**Error Paths:**
- Transaction that would result in negative balance → blocked, HTTP 422, alert raised
- Serialization conflict → auto-retry up to 3 times, then HTTP 503

---

#### Module 10 — Physical Stock Count & Reconciliation

**What:** A scheduled and ad-hoc process where store keepers physically count all Alum bags in a location and the system compares the physical count against the ledger balance. Variances are recorded, investigated, and resolved through an authorized escalation workflow.

**Why:** Even perfect transaction recording can miss physical discrepancies. The Stock Count is the ground-truth check that catches what the transaction system missed — handling errors, miscounts, and deliberate theft.

**Actors:** Store Manager (create count orders, approve minor variances), Store Keeper/Counter (physically count), Second Counter (independent recount), Operations Manager (approve significant variances), Director (approve critical variances)

**Documents Generated:** SCO-YYYY-NNNN, Variance Report

**Count Types:**
- **Cycle Count:** Scheduled rolling count — one zone per week so the entire store is covered monthly without stopping operations
- **Full Count:** Complete count of all locations — typically quarterly or triggered by critical variance
- **Spot Count:** Ad-hoc count of a specific lot or location — initiated by a Supervisor on suspicion

**Process Steps:**

1. Store Manager creates Count Order in system: specifies locations, type, assigned counter, scheduled date
2. System creates `SCO-YYYY-NNNN` → snapshots current ledger balance as theoretical → Status: `Open` → counter notified

3. Counter physically goes to specified location
4. Count method:
   - **QR scanner:** Counter scans each bag QR code one by one
   - **Manual only:** Counter manually counts bags per lot, enters in app
5. System records each item confirmed physically: lot noted, timestamp, counter ID
6. All items counted? → Counter submits count result

*Comparison & Variance:*
7. System compares: Physical Count vs. Ledger Balance
   - Variance = Physical Count − Ledger Balance
   - Variance % calculated per Lot

8. Decision — Variance:
   - **Zero or ≤ 0.1%:** Count auto-closed → Status: `Closed` → Manager notified → ZERO VARIANCE (ledger confirmed accurate)
   - **Variance detected:** Variance Report generated with severity:
     - < 1% = **Minor**
     - 1–5% = **Significant**
     - > 5% = **Critical**
     - Store Manager notified

*Recount Process:*
9. Manager orders RECOUNT by DIFFERENT independent counter (second counter must be a different person from the first)
10. Second counter performs independent count
11. System re-compares: second count vs. ledger

12. Decision — Recount confirms variance?
    - **No — first count error:** First count marked error → ledger confirmed accurate
    - **Yes — real discrepancy:** Variance confirmed → approval workflow based on severity:
      - **Minor (< 1%):** Store Manager approves adjustment
      - **Significant (1–5%):** Operations Manager approval required
      - **Critical (> 5%):** Director notified → mandatory investigation before any adjustment

13. Approver enters adjustment justification (for critical: investigation conducted and findings documented)
14. Ledger Adjustment entry created (+/−) → balance adjusted → Count Order: `Closed` → all approvals permanently recorded

15. Decision — Theft suspected?
    - **No:** VARIANCE RESOLVED (ledger adjusted, count closed)
    - **Yes:** SECURITY ESCALATION (Director, formal investigation, evidence preserved)

**Business Rules:**
- First counter ≠ recount counter (enforced by system)
- Variance approval thresholds are configurable (stored in `system_configurations`)
- All count results and approvals are permanently audited
- A count order cannot be deleted once created — only completed or closed

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/stock-counts` | Create count order | `stockcount:create` |
| GET | `/api/v1/stock-counts` | List count orders (filterable) | `stockcount:read` |
| GET | `/api/v1/stock-counts/{id}` | Get count order details | `stockcount:read` |
| PATCH | `/api/v1/stock-counts/{id}/submit-result` | Submit count result | `stockcount:execute` |
| POST | `/api/v1/stock-counts/{id}/recount` | Order recount (different counter) | `stockcount:create` |
| PATCH | `/api/v1/stock-counts/{id}/approve-variance` | Approve variance adjustment | `stockcount:approve` |
| PATCH | `/api/v1/stock-counts/{id}/reject-variance` | Reject variance (investigation required) | `stockcount:approve` |

**Error Paths:**
- Same user attempting both initial count and recount → HTTP 403 (segregation of duties)
- Attempt to approve critical variance without investigation report → HTTP 422
- Attempt to close count with unresolved variance → HTTP 422

---

### 2.3 Group 3: Distribution Management (Modules 11–13)

This group governs all inter-store movements — Central Store → Unit Stores, and Unit Stores → User Stores. The same three-module process governs both tiers.

---

#### Module 11 — Stock Transfer Order (STO)

**What:** The formal document that authorizes the movement of a specific quantity of Alum from a source store to a destination store. No physical movement of bags may begin without an approved STO. The STO pre-assigns specific bags by FIFO lot selection before any loading begins.

**Why:** Without an STO, inter-store transfers are informal and unverifiable. The STO forces every movement to be pre-authorized, quantity-specific, lot-specific, and dual-confirmed — eliminating the single largest accountability gap in public-sector inventory systems: stock that leaves one location but never verifiably arrives at another.

**Actors:** System (auto-trigger on ROP), Store Keeper (manual request), Store Manager (approve/reject — Central Store Manager for Central→Unit, Unit Store Manager for Unit→User)

**Documents Generated:** STO-YYYY-NNNN

**Process Steps:**

*STO Initiation:*

Trigger A — System-Triggered (Auto-ROP):
1. Unit/User Store balance ≤ Reorder Point (detected by M9 Stock Ledger)
2. System auto-creates Draft STO: `STO-YYYY-NNNN`, Source: parent store, Destination: low-stock store, Qty: to reach Max Stock Level, notifies Manager for review

Trigger B — Manual Request:
1. Store Keeper enters: requested qty, date, justification
2. System validates: source has sufficient stock, no duplicate STO pending → Draft STO created

*FIFO Bag Pre-Selection:*
3. System queries source store Stock Ledger
4. Selects bags from oldest lot first (lowest FIFO sequence number)
5. If insufficient bags in oldest lot → continues to next lot
6. Assigns specific Item IDs to this STO
7. Selected bags: `InStock` → `Reserved`
8. **Reserved bags LOCKED — cannot be selected by any other STO**

*Approval:*
9. Store Manager reviews Draft STO: quantity appropriate? Source balance sufficient? Timing acceptable?
10. Manager reviews FIFO selection: lot numbers, bag count, total weight, remaining balance after reservation
11. Decision — Manager Decision:
    - **Reject:** Manager enters rejection reason → Status: `Rejected` → reserved bags → `InStock` (unreserved) → Store Keeper notified
    - **Authorise:** Manager authorises STO → records source balance at time of authorisation → Status: `Authorised` → `authorised_by` + timestamp → notifies dispatching Store Keeper: STO ready for dispatch

**STO Statuses:**
```
Draft → Submitted → Authorised → InTransit
                  → Rejected    → PartiallyReceived → FullyReceived → Closed
                                                                    → Cancelled
```

**Approval Hierarchy:**
- Central → Unit STOs: Central Store Manager approves
- Unit → User STOs: Unit Store Manager approves

**Business Rules:**
- No physical movement without an `Authorised` STO
- FIFO selection is system-enforced — cannot be overridden by user
- Reserved bags cannot be selected by any other STO until released
- STO creator ≠ STO approver (segregation of duties)
- A rejected STO automatically unreserves all pre-selected bags

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/stock-transfer-orders` | Create STO (manual request) | `sto:create` |
| GET | `/api/v1/stock-transfer-orders` | List STOs (filterable) | `sto:read` |
| GET | `/api/v1/stock-transfer-orders/{id}` | Get STO details with item list | `sto:read` |
| PATCH | `/api/v1/stock-transfer-orders/{id}/submit` | Submit STO for approval | `sto:create` |
| PATCH | `/api/v1/stock-transfer-orders/{id}/authorise` | Authorise STO | `sto:approve:central_unit` or `sto:approve:unit_user` |
| PATCH | `/api/v1/stock-transfer-orders/{id}/reject` | Reject STO with reason | `sto:approve:central_unit` or `sto:approve:unit_user` |
| PATCH | `/api/v1/stock-transfer-orders/{id}/cancel` | Cancel STO (before dispatch only) | `sto:approve:central_unit` or `sto:approve:unit_user` |

**Error Paths:**
- Insufficient stock at source → HTTP 422
- Duplicate pending STO for same destination → HTTP 409
- STO creator attempting to approve → HTTP 403
- Attempt to dispatch against non-Authorised STO → HTTP 422

---

#### Module 12 — Transfer Dispatch & Chain of Custody

**What:** The physical execution of an authorised STO — covering the loading of bags, scan-out of every bag leaving the source store, generation of the Transfer Dispatch Note (TDN), and formal custody handover to the transporter.

**Why:** This module creates a hard record of precisely what left the source store, in whose custody it was placed, at what time, and in what condition. Without it, the "transfer" is simply a disappearance from the source ledger with no verified departure record.

**Actors:** Dispatching Store Keeper (scan-out, generate TDN), Store Manager (approve short shipments), Driver (confirm receipt via PIN)

**Documents Generated:** TDN-YYYY-NNNN

**Process Steps:**

1. STO status: `Authorised` → Store Keeper notified
2. Dispatching Store Keeper opens Authorised STO on mobile app
3. App displays pre-assigned bag list (Item IDs and QR codes), destination store details
4. Store Keeper enters: vehicle registration, driver name, driver phone
5. Store Keeper verifies driver identity physically before loading begins

*Bag Scanning:*
6. Physical loading begins: Store Keeper scans first bag as it is placed on vehicle
7. Decision — Scan validation:
   - **BAG NOT ON STO LIST:** REJECTS scan → ALERT: "this bag is NOT assigned to this STO — do not load" → audit event logged → remove bag from loading area (loop)
   - **VALID:** Scan recorded: bag added to loading manifest, scan timestamp, User ID

8. Decision — More bags to load?
   - **Yes:** Load and scan next bag (loop)
   - **No — all bags loaded:** System compares bags scanned out vs. STO authorised count

*Count Verification:*
9. Decision — Loaded count vs. Authorised count:
   - **MATCH:** Proceed to weight verification
   - **SHORT — missing bags:** Flag: "X expected, Y loaded" → displays Item IDs of missing bags
     - Store Keeper searches for missing bags
     - Found? → scan found bags (loop back)
     - Not found? → Escalate to Manager:
       - Manager authorises short shipment with reason → missing bags remain `Reserved`, investigation opened
       - OR Manager delays dispatch until bags found

*Weight Verification:*
10. Dispatch scale available?
    - **Yes:** Auto-captures total weight from dispatch scale
    - **No:** Manually enter estimated total weight
11. Compares loaded weight vs. STO authorised weight (tolerance ±1%)
12. Decision — Weight within tolerance?
    - **Variance > 1%:** Escalate to Manager → verify bags before dispatch
    - **Within tolerance:** Proceed

*TDN Generation:*
13. TDN generated: `TDN-YYYY-NNNN` contains: STO ref, source/destination stores, all Item IDs, total bags, total weight, vehicle, driver, departure time
14. Consignment QR code printed and attached to load
15. TDN printed two copies: source store retains one, driver takes one

*Dual Authentication:*
16. **DUAL AUTHENTICATION REQUIRED:**
    1. Dispatching Store Keeper authenticates: fingerprint or PIN
    2. Driver confirms receipt of load via PIN

*System Finalisation:*
17. All loaded bags: `Reserved` → `InTransit`
18. Source Store Ledger: Issue entry (−)
19. STO Status → `InTransit`
20. TDN Status → `Generated`
21. Destination Store Keeper notified: shipment en route, ETA

**Business Rules:**
- Dispatch cannot begin without an `Authorised` STO
- Only pre-assigned bags can be scanned onto the vehicle — any non-assigned bag is rejected
- A short dispatch (fewer bags than authorised) requires Manager approval with written reason
- Both dispatcher and driver must authenticate before TDN is finalised
- Dual authentication is mandatory — cannot be bypassed

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/transfer-dispatch` | Begin dispatch session for STO | `transfer:dispatch` |
| PATCH | `/api/v1/transfer-dispatch/{id}/scan-item` | Scan bag onto vehicle | `transfer:dispatch` |
| PATCH | `/api/v1/transfer-dispatch/{id}/record-weight` | Record dispatch weight | `transfer:dispatch` |
| PATCH | `/api/v1/transfer-dispatch/{id}/approve-short` | Manager approve short shipment | `sto:approve:central_unit` or `sto:approve:unit_user` |
| PATCH | `/api/v1/transfer-dispatch/{id}/complete` | Finalise dispatch and generate TDN | `transfer:dispatch` |
| GET | `/api/v1/transfer-dispatch/{id}` | Get dispatch session details | `transfer:read` |

**Error Paths:**
- Scan bag not on STO pre-assigned list → REJECTED with alert
- Attempt to complete dispatch without dual authentication → HTTP 422
- Short shipment without Manager approval → HTTP 422
- Attempt to dispatch against non-Authorised STO → HTTP 422

---

#### Module 13 — Transfer Receipt & Custody Confirmation

**What:** The formal confirmation at the destination store that transferred bags have arrived, been physically counted, scanned in, and taken into the receiving store's custody and ledger. This module closes the transfer loop and the transit custody gap.

**Why:** Receipt confirmation is the closing half of the dual-confirmation requirement. Without it, a "transfer" is a disappearance from the source store with no verified destination. The system tracks every transfer as `InTransit` — a custody limbo — and raises escalating alerts if not resolved within the expected transit window.

**Actors:** Receiving Store Keeper (scan-in, accept custody), Source Manager + Destination Manager + Operations Manager (shortage/excess alerts)

**Documents Generated:** GRD-YYYY-NNNN

**Process Steps:**

*Transit Monitoring:*
1. STO: `InTransit` → Destination Store Keeper notified (SMS + app)
2. System monitors transit time: if overdue beyond ETA + 2 hours → alert to both Store Managers

*Arrival & Validation:*
3. Truck arrives at destination store
4. Receiving Store Keeper opens mobile app, navigates to expected TDN
5. Store Keeper scans the CONSIGNMENT QR attached to the load
6. System validates: matches an `InTransit` TDN? TDN destination = this store?

7. Decision — Consignment QR validated?
   - **Wrong delivery:** ALERT: "This consignment not expected here — do not unload — contact source store immediately" → INVESTIGATION REQUIRED
   - **Valid:** GRD session opened: `GRD-YYYY-NNNN` assigned → app shows expected bags from TDN

*Bag Scanning:*
8. Unloading begins: Store Keeper scans first bag QR as it comes off vehicle
9. System validates: Item ID on TDN expected list? Bag status = `InTransit`? Dispatched to THIS destination?
10. Decision — Scan validation:
    - **VALID:** Check physical condition:
      - **Good:** Bag received, Condition: Good
      - **Damaged on arrival:** Bag received, Condition: Damaged → flagged for Module 16 write-off
    - **UNEXPECTED bag (not on TDN):** BLOCKS receipt → ALERT: "this bag was NOT dispatched in this STO — cannot be received" → Source Manager alerted, audit event logged → set aside

11. Decision — More bags to unload?
    - **Yes:** Unload and scan next bag (loop)
    - **No:** System compares bags scanned in vs. bags dispatched on TDN

*Reconciliation:*
12. Decision — Receipt count vs. TDN count:
    - **FULL MATCH:** Proceed to finalise receipt
    - **SHORTAGE:** GRD status: `Shortage` → missing bags remain `InTransit` → Shortage Report generated (STO ref, TDN ref, missing Item IDs) → alert: Source Manager + Destination Manager + Operations Manager
      - Investigation workflow:
        - (a) Find and re-deliver missing bags → receipt completed
        - (b) Confirm lost → Module 16 (Loss Management)
        - (c) Driver/transporter held accountable → security escalation
    - **EXCESS:** BLOCKS excess bags → alert: extra bags not on TDN → Source Manager investigates before any excess accepted

*Custody Acceptance:*
13. Receiving Store Keeper authenticates to formally accept custody: fingerprint or PIN
14. System finalises receipt:
    - All received bags: `InTransit` → `InStock` (at destination store)
    - Each bag's `current_store_id` = destination store
    - Destination Store Ledger: TransferReceipt entry (+)
    - TDN Status → `Completed`
    - STO Status → `FullyReceived` or `PartiallyReceived`
    - Source Manager notified
    - **TRANSIT CUSTODY GAP CLOSED**

**Business Rules:**
- Receipt cannot begin without scanning the consignment QR (links to correct TDN)
- Only bags on the TDN expected list can be received — unexpected bags are blocked
- Shortage investigation is mandatory before missing bags can be written off
- Receiving officer must authenticate to accept custody
- Missing bags remain in `InTransit` status indefinitely until resolved

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/transfer-receipt` | Begin receipt session (scan consignment QR) | `transfer:receive` |
| PATCH | `/api/v1/transfer-receipt/{id}/scan-item` | Scan bag during unloading | `transfer:receive` |
| PATCH | `/api/v1/transfer-receipt/{id}/report-damage` | Mark bag as damaged on arrival | `transfer:receive` |
| PATCH | `/api/v1/transfer-receipt/{id}/complete` | Finalise receipt and generate GRD | `transfer:receive` |
| GET | `/api/v1/transfer-receipt/{id}` | Get receipt session details | `transfer:read` |
| GET | `/api/v1/transfer-receipt/{id}/shortage-report` | Get shortage report | `transfer:read` |

**Error Paths:**
- Consignment QR does not match any InTransit TDN → HTTP 422 with alert
- Unexpected bag not on TDN → BLOCKED, not receivable
- Attempt to finalise receipt without authentication → HTTP 422
- Transit overdue (ETA + 2hrs) → automated alert to both Store Managers

---

### 2.4 Group 4: Consumption Management (Modules 14–16)

This group governs the final stage of the Alum lifecycle — from arrival at the User Store through treatment plant dosing, validation, and lifecycle closure.

---

#### Module 14 — User Store Inventory & Consumption Recording

**What:** Management of Alum stock at the Treatment Plant (User Store) and the recording of every dosing event where bags are opened and used in water treatment. Each consumption is tied to a treatment session, operator, volume treated, and quantity used.

**Why:** Arrival at the treatment plant is not the end of accountability. The consumption record closes the lifecycle by requiring that every bag entering the User Store is eventually accounted for as consumed, in stock, or written off. There is no fourth category. Consumption data also provides the independent cross-check used by Module 15's dosage validation.

**Actors:** Treatment Plant Operator (record consumption, scan bags), Plant Supervisor/Chemist (acknowledge anomalies)

**Documents Generated:** CONS-YYYY-NNNN

**Process Steps:**

*Consumption Entry:*
1. Treatment session about to begin — operator needs Alum
2. Treatment Plant Operator opens "New Consumption Entry" on mobile app
3. System auto-populates: timestamp (server-side, NOT editable), location (operator's User Store), current stock balance, lot numbers
4. Operator enters Treatment Session Reference (if applicable)
5. Operator enters **VOLUME OF WATER** to be treated in m³ (MANDATORY FIELD)
6. System calculates suggested dosage:
   ```
   Expected Bags = (Volume m³ × Dose Rate kg/m³) / Bag Weight kg
   Rounded up to nearest whole bag
   ```
   Displayed to Operator as guidance

*Bag Scanning:*
7. Operator reviews suggested dosage, physically retrieves bags from User Store shelves
8. Operator opens first bag and scans its QR code before use
9. Decision — Scan validation:
   - **Invalid / wrong store / already consumed:** REJECTS scan → ALERT: "this bag cannot be used here — return bag and scan a valid bag"
   - **Valid — partially consumed bag from previous session?**
     - **Yes:** System shows remaining weight from last session → confirm using this bag → Operator confirms
     - **No — fresh bag:** Bag recorded in consumption entry

10. Decision — More bags needed for this session?
    - **Yes:** Open and scan next bag (loop)
    - **No — all bags scanned:** Operator confirms actual treatment details and any dosage adjustments

*Partial Bag Handling:*
11. Decision — Last bag fully or partially used?
    - **Fully empty:** Mark last bag as fully consumed → Status: `Consumed`
    - **Partially used:** Operator marks "Partially Used" → enters estimated remaining weight (kg) → Status: `PartiallyConsumed` → `remaining_weight_kg` recorded → bag remains in User Store at reduced weight → system will prompt this bag FIRST next session

*Submission:*
12. Total kg consumed calculated: sum of full bags + partial used weight
13. Operator reviews and submits Consumption Entry
14. Module 15 (Dosage Validation) triggered automatically

15. Decision — Dosage Validation result from M15:
    - **NORMAL:** Each consumed bag: `InStock` → `Consumed`, `consumed_at`, `consumed_by` recorded → User Store Ledger: Consumption (−) → `CONS-YYYY-NNNN` assigned → Status: `Confirmed`
    - **ELEVATED or HIGH ANOMALY:** Status: `PendingAcknowledgment` → cannot finalise until Supervisor acknowledges (M15 governs this)
    - **LOW CONSUMPTION:** Low consumption warning → Supervisor notified → entry still processes but flagged → Status: `Confirmed` (with flag)

**Business Rules:**
- Entries cannot be backdated beyond configurable window (default: 24 hours, stored in `system_configurations`)
- Every entry requires at least one QR scan — purely manual entries are blocked
- A bag cannot be marked consumed twice — hard system block on re-consumption
- Volume of water treated is a mandatory field (cannot be zero)
- Timestamp is server-side authoritative (client timestamp recorded for reference only)
- System prompts partially consumed bags FIRST before fresh bags

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/consumption` | Create consumption entry | `consumption:record` |
| PATCH | `/api/v1/consumption/{id}/scan-item` | Scan bag into consumption | `consumption:record` |
| PATCH | `/api/v1/consumption/{id}/submit` | Submit consumption entry | `consumption:record` |
| PATCH | `/api/v1/consumption/{id}/acknowledge-anomaly` | Supervisor acknowledge anomaly | `consumption:acknowledge` |
| GET | `/api/v1/consumption` | List consumption records (filterable) | `consumption:read` |
| GET | `/api/v1/consumption/{id}` | Get consumption details | `consumption:read` |

**Error Paths:**
- Bag not at operator's User Store → HTTP 422
- Bag already consumed → HTTP 422
- Entry backdated beyond allowed window → HTTP 422
- Submission without QR scan → HTTP 422
- Volume of water = 0 → HTTP 422

---

#### Module 15 — Dosage Validation & Consumption Analytics

**What:** An automated analytical layer that continuously compares actual Alum consumption against expected consumption based on water volumes treated, dynamic dosage rates (with seasonal adjustment), historical patterns, and operator-level behaviour. Anomalous consumption triggers real-time alerts.

**Why:** This is the system's forensic intelligence layer. Even if multiple actors collude to falsify upstream records, consumption analytics provides a physics-based cross-check that is very difficult to fabricate: water treatment chemistry constrains how much Alum a plant should realistically consume per cubic metre of water treated.

**Actors:** System (auto-triggered), Plant Supervisor/Chemist (acknowledge anomalies, configure dosage rates), Operations Manager (receive alerts), Director (receive critical alerts), System Administrator (initial dosage rate configuration)

**Documents Generated:** Anomaly Report (auto-generated)

**Process Steps:**

*Dosage Rate Configuration:*
Per User Store (configurable by System Administrator + Plant Supervisor/Chemist):
```
- Standard dosage rate: X kg Alum per m³ of raw water treated
- Acceptable variance: ± Y%
- Seasonal adjustment factors:
  - Dry season multiplier (e.g., 0.9 — lower turbidity)
  - Wet season multiplier (e.g., 1.3 — higher turbidity)
  - Season date ranges configurable per plant
- Thresholds:
  - Normal range: adjustable (default 85%–115% of expected)
  - Elevated range: adjustable (default 115%–130%)
  - High anomaly: adjustable (default > 130%)
  - Low consumption: adjustable (default < 85%)
```

*Automated Validation (triggered on every Consumption Entry submission):*
1. System retrieves active Dosage Rate Configuration for this User Store
2. Decision — Config found?
   - **No config:** ALERT: "No dosage rate configured" → Supervisor and Admin notified → entry flagged: `Unconfigured` → Admin must configure before validation proceeds
   - **Config found:** System calculates:
     ```
     Season Multiplier = active seasonal factor for current date
     Adjusted Rate = Standard Rate × Season Multiplier
     Expected kg = Volume (m³) × Adjusted Rate (kg/m³)
     Efficiency Ratio = (Actual / Expected) × 100%
     Deviation % = (Actual − Expected) / Expected × 100%
     ```

3. Decision — Efficiency Ratio result:
   - **85%–115% (NORMAL):** Result: `Normal` → no alert → entry Status: `Confirmed`
   - **< 85% (LOW CONSUMPTION):** Result: `LowConsumption` → possible under-dosing (public health concern) → Supervisor notified → entry confirms but flagged
   - **115%–130% (ELEVATED):** Result: `Elevated` → higher than expected → Supervisor notified → entry confirms, anomaly logged → Supervisor reviews and records explanation → acknowledgment logged in audit trail
   - **> 130% (HIGH ANOMALY):** Result: `HighAnomaly` → CRITICAL ALERT
     - Entry Status: `PendingAcknowledgment` → **Entry CANNOT finalise until Supervisor acts**
     - Alerts sent to: Plant Supervisor (IMMEDIATE), Operations Manager, Director via SMS and app
     - Supervisor must investigate:
       - Physically visits plant, verifies actual usage, checks bags on site
       - Decision — Investigation result:
         - **Legitimate reason (high turbidity, dosing adjustment):** Supervisor records full explanation (reason, evidence, corrective action) → acknowledgment recorded → entry Status: `Confirmed` → anomaly closed with notes → all permanently auditable
         - **Suspicious — cannot explain high usage:** Escalation: possible diversion or theft → security investigation opened → Operations Manager and Director notified → INVESTIGATION OPEN (entry held pending outcome)

*Automated Trend Analytics (continuously running):*
- 30-day rolling consumption rate (kg/m³) per plant
- Lot consumption velocity (how quickly each lot is consumed)
- Operator-level pattern analysis (variance by operator)
- Time-of-day distribution (entries at plausible treatment hours?)
- Delivery vs. consumption correlation (deliveries growing; water output flat?)

4. Decision — Rolling trend breach detected?
   - **No:** Analytics updated, no alert
   - **Yes:** Trend Anomaly Alert generated → sent to Supervisor and Operations Manager

**Business Rules:**
- Dosage rate parameters can only be configured by System Administrator + Plant Supervisor/Chemist
- Operators and Store Keepers cannot change dosage parameters
- All Supervisor overrides of anomaly flags are permanently recorded with mandatory justification
- Analytics outputs are read-only — cannot be adjusted, suppressed, or deleted
- Seasonal adjustment factors are applied automatically based on configured date ranges — no manual intervention needed per consumption entry
- Normal range thresholds are per-plant configurable (not system-wide static 85%–115%)

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/dosage-configurations` | List all dosage rate configs | `dosage:read` |
| GET | `/api/v1/dosage-configurations/{storeId}` | Get config for a store | `dosage:read` |
| POST | `/api/v1/dosage-configurations` | Create dosage rate config for a store | `dosage:configure` |
| PUT | `/api/v1/dosage-configurations/{id}` | Update dosage rate config | `dosage:configure` |
| GET | `/api/v1/consumption-analytics/{storeId}` | Get analytics dashboard data | `reports:view` |
| GET | `/api/v1/consumption-analytics/{storeId}/trends` | Get trend data | `reports:view` |
| GET | `/api/v1/consumption-analytics/{storeId}/operator-patterns` | Operator-level analysis | `reports:view` |

---

#### Module 16 — Loss Management & Write-Offs

**What:** The formal, controlled process for writing off bags that exit the system through routes other than normal consumption — physical damage, quality degradation, confirmed transit loss, unexplained physical count shortages, or supplier returns.

**Why:** Every supply chain needs a legitimate write-off pathway for genuine losses. Without one, operators create undocumented workarounds (indistinguishable from theft). The critical design principle: the write-off pathway must be hard to abuse — it requires documentation, photographs, and escalating authorization thresholds based on quantity.

**Actors:** Store Keeper (raise request), Unit Store Manager / Plant Supervisor (approve 1–5 bags), Operations Manager (approve 6–20 bags), Director (approve > 20 bags), Procurement Officer (notified on supplier returns)

**Documents Generated:** WO-YYYY-NNNN

**Triggers:**
- Store Keeper discovers damaged or missing bags (manual)
- Physical Count confirms shortage (Module 10 — automated)
- Transit shortage confirmed (Module 13 — automated)
- Damaged bags on arrival recorded in GRN (Module 6 — automated)

**Write-Off Categories:**

| Category | Description |
|---|---|
| Physical Damage | Bag torn or contaminated; not usable |
| Quality Degradation | Stock deteriorated past usable grade (improper storage, age) |
| Transit Loss | Bags confirmed missing after full shortage investigation (M13) |
| Unexplained Shortage | Physical count variance confirmed after recount (M10) |
| Supplier Return | Rejected batch returned to supplier following quality failure (M4) |

**Process Steps:**

1. Store Keeper identifies affected bags: scans QR codes if accessible, or records lot and quantity if missing/damaged beyond scanning
2. Store Keeper selects Write-Off category
3. Store Keeper enters: bags count, estimated weight (kg), detailed description, photos (mandatory for Damage and Returns)
4. System validates: Item IDs exist at this store? Quantity > 0? Description provided? → `WO-YYYY-NNNN` assigned

*Approval Routing (by bag count):*
5. Decision — Approval route:
   - **1–5 bags:** Route to Unit Store Manager or Plant Supervisor
   - **6–20 bags:** Route to Operations Manager
   - **> 20 bags:** Route to Director + mandatory investigation report required

6. Approver reviews: details, photos, description, quantity consistent with known circumstances
   (Director also reviews investigation report for > 20 bags)
7. Decision — Approver Decision:
   - **Reject:** Enters rejection reason → Status: `Rejected` → Store Keeper notified → bags remain in current status → resubmit with better evidence if warranted
   - **Approve:** Approver enters approval justification

*Post-Approval:*
8. Decision — Write-off category:
   - **Physical Damage / Quality Degradation / Transit Loss / Unexplained Shortage:**
     - Bags status → `Damaged` or `Lost`
     - `written_off_at`, `written_off_by` timestamps recorded
     - Ledger: WriteOff entry (−)
     - Lot counters updated (`bags_written_off` +)
     - Write-Off Report generated
   - **Supplier Return:**
     - Bags → `Quarantined` then `Returned`
     - Ledger: SupplierReturn entry (−)
     - Supplier notified
     - Return shipment documented
     - Supplier Scorecard: Quality −
     - Credit note or replacement tracked via new PR

*Cumulative Loss Monitoring:*
9. Month-to-date losses recalculated as % of total received
10. Decision — Monthly loss % of received:
    - **< 0.5% (Acceptable):** Within threshold — no alert
    - **0.5%–1% (Warning):** Warning alert → Procurement Manager and Store Manager notified
    - **1%–2% (Significant):** Significant alert → Operations Manager, investigation required, pending STOs flagged for enhanced scrutiny
    - **> 2% (Critical):** CRITICAL ALERT → Director notified immediately, all pending STOs held, external audit may trigger, enhanced scrutiny mode activated

**Business Rules:**
- Write-off raiser ≠ write-off approver (segregation of duties)
- Photos are mandatory for Physical Damage and Supplier Return categories
- Investigation report is mandatory for > 20 bag write-offs
- Approval thresholds are configurable (stored in `system_configurations`)
- All write-off approvals and rejections are permanently audited
- Cumulative loss monitoring runs automatically — cannot be disabled or suppressed

**API Endpoints:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/write-offs` | Raise write-off request | `writeoff:raise` |
| GET | `/api/v1/write-offs` | List write-off requests (filterable) | `writeoff:read` |
| GET | `/api/v1/write-offs/{id}` | Get write-off details | `writeoff:read` |
| PATCH | `/api/v1/write-offs/{id}/approve` | Approve write-off | `writeoff:approve:minor` or `writeoff:approve:significant` or `writeoff:approve:critical` |
| PATCH | `/api/v1/write-offs/{id}/reject` | Reject write-off with reason | `writeoff:approve:minor` or `writeoff:approve:significant` or `writeoff:approve:critical` |
| GET | `/api/v1/write-offs/loss-summary` | Get cumulative loss monitoring data | `reports:view` |
| POST | `/api/v1/return-orders` | Create return order for supplier | `writeoff:raise` |
| PATCH | `/api/v1/return-orders/{id}/ship` | Record return shipment | `writeoff:raise` |
| PATCH | `/api/v1/return-orders/{id}/confirm-credit` | Confirm supplier credit note | `po:create` |

**Error Paths:**
- Write-off raiser attempting to approve own request → HTTP 403
- > 20 bag write-off without investigation report → HTTP 422
- Damage/Return without photos → HTTP 422
- Bags not at specified store → HTTP 422

---

### 2.5 Cross-Cutting Concerns

These capabilities span all 16 modules and are not numbered as standalone modules.

#### 2.5.1 Alert System

All modules generate alerts based on configurable rules. Alerts are delivered via:
- In-app notification (mobile + web)
- SMS (via Africa's Talking — 3 retry attempts with exponential backoff: 1s, 2s, 3s)
- Email

**Alert Categories:**
| Category | Source Module(s) | Example |
|---|---|---|
| Reorder Point | M9 | "Central Store balance below ROP: 95 bags (ROP: 100)" |
| Variance | M5, M10 | "Weighbridge variance 3.5% — exceeds 2% tolerance" |
| Transit Overdue | M12, M13 | "STO-2026-0042 overdue — ETA was 2 hours ago" |
| Consumption Anomaly | M15 | "High anomaly at CWTP: 142% of expected consumption" |
| Loss Threshold | M16 | "MTD loss rate 1.3% — exceeds 1% significant threshold" |
| Quality Failure | M4 | "Delivery from Supplier X failed quality sampling" |
| PO Overdue | M3 | "PO-2026-0018 — expected delivery date passed" |
| Security | M10, M13 | "Theft suspected at Unit Store B — critical shortage" |

**Alert Configuration API:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/alerts` | List alerts (filterable) | `alerts:read` |
| PATCH | `/api/v1/alerts/{id}/acknowledge` | Acknowledge alert | `alerts:acknowledge` |
| GET | `/api/v1/alert-rules` | List alert rules | `alerts:configure` |
| POST | `/api/v1/alert-rules` | Create alert rule | `alerts:configure` |
| PUT | `/api/v1/alert-rules/{id}` | Update alert rule | `alerts:configure` |

#### 2.5.2 Reporting & Dashboard

**12 Standard Reports:**

| Report | Description | Audience |
|---|---|---|
| Stock Balance Summary | Current stock at all stores by lot | All managers |
| Lot Lifecycle Report | Full traceability of a lot from GRN to consumption | Auditors, Managers |
| Item Chain-of-Custody | Full history of a single bag (QR lookup) | Auditors |
| Stock Movement Summary | All receipts, issues, transfers by period | Managers |
| Transfer Reconciliation | STO vs. TDN vs. GRD quantity comparison | Store Managers |
| Consumption Analytics | Dosage rates, operator patterns, trend analysis | Plant Supervisors, Ops Manager |
| Anomaly History | All consumption anomaly flags and resolutions | Ops Manager, Director |
| Physical Count Results | Count vs. ledger variance history | Managers, Auditor |
| Supplier Performance | On-time, quantity accuracy, quality rate by supplier | Procurement Manager |
| Loss & Write-Off Summary | Write-offs by category, store, period | Ops Manager, Director |
| Procurement Pipeline | Open PRs, pending POs, expected deliveries | Procurement Manager |
| Executive Dashboard | System-wide KPIs, alerts, stock health | Director |

**Executive Dashboard KPIs:**
- System-Wide Stock Health (gauge: total stock vs. combined ROP)
- Active Alerts by severity (Critical / Significant / Minor)
- Pending Approvals (PRs, POs, STOs awaiting action)
- In-Transit Summary (bags in transit + overdue count)
- Consumption This Month (total kg + vs. last month)
- Anomaly Rate (% of consumption entries flagged this month)
- Loss Rate (MTD write-offs as % of received stock)
- Supplier Performance (average scorecard)

**Report API:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/reports/stock-summary` | Current balances all stores | `reports:view` |
| GET | `/api/v1/reports/lot-lifecycle/{lotId}` | Full lot traceability | `reports:view` |
| GET | `/api/v1/reports/item-history/{itemId}` | Full bag chain-of-custody | `reports:view` |
| GET | `/api/v1/reports/consumption-analytics` | Dosage analytics + trends | `reports:view` |
| GET | `/api/v1/reports/transfer-reconciliation` | STO vs. TDN vs. GRD reconciliation | `reports:view` |
| GET | `/api/v1/reports/supplier-performance` | Scorecard by supplier | `reports:view` |
| GET | `/api/v1/reports/loss-summary` | Write-offs by period and category | `reports:view` |

**Real-Time Hubs (SignalR):**
| Hub | Path | Purpose |
|---|---|---|
| Stock Dashboard | `/hubs/stock-dashboard` | Live stock balance updates per store |
| Alerts | `/hubs/alerts` | Real-time anomaly and variance alerts |
| Transfers | `/hubs/transfers` | Live transfer status (In Transit notifications) |
| Weighbridge | `/hubs/weighbridge` | Live weighbridge session updates |

#### 2.5.3 Audit Trail

See Section 4 (Database Schema) for the redesigned audit hash chain specification with per-store chains, canonical JSON serializer, and TRIGGER-based enforcement.

**Audit API:**
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/audit/events` | Audit trail with filters | `audit:view` |
| GET | `/api/v1/audit/verify-chain` | Hash chain integrity check | `audit:verify` |
| GET | `/api/v1/audit/verify-chain/{storeId}` | Per-store chain verification | `audit:verify` |
| GET | `/api/v1/audit/export` | Export audit events | `audit:export` |

---

## 3. Actor Definitions & RBAC

The system has **19 actors** organised across **4 tiers**. A foundational principle applies without exception: **no single actor can both initiate and approve any transaction** (segregation of duties — enforced at API middleware level, not just policy).

### 3.1 Tier 1 — Governance & Administration

**Actor 1: System Administrator**
- **Who:** Designated IT officer (HUBUK or internal). Maximum 2 at any time.
- **Does:** User management; system configuration (stores, ROPs, dosage rates, thresholds); hardware registration; audit log integrity checks; device registration/deregistration.
- **Can Approve:** User accounts only.
- **Cannot:** Approve any supply chain document; create, modify, or delete any inventory transaction; override any business process.
- **Sees:** Everything (read-only for operational data); system configuration; user activity logs.

**Actor 2: Director of Operations**
- **Who:** Senior leadership — Director of Water Supply, General Manager, or equivalent.
- **Does:** Reviews executive dashboard; acts on critical escalations (losses > 20 bags, critical anomalies, unresolved variances); approves critical write-offs; endorses external audit triggers.
- **Can Approve:** Write-offs > 20 bags; critical physical count variances (> 5%).
- **Cannot:** Create any operational transaction; modify any record; approve their own escalations.
- **Sees:** System-wide read-only dashboard; all pending escalations; all historical reports.

**Actor 3: Auditor**
- **Who:** Internal or external audit officer. Zero-write access.
- **Does:** Accesses complete audit trail; verifies hash chain integrity; runs reconciliation reports; traces full lot/bag lifecycle; cross-references consumption against dosage analytics.
- **Can Approve:** Nothing.
- **Cannot:** Create, modify, or approve anything in the system.
- **Sees:** Everything — all modules, all stores, all audit events, all approval chains.

### 3.2 Tier 2 — Procurement Actors

**Actor 4: Procurement Officer**
- **Who:** Designated Procurement Department officer.
- **Does:** Reviews and submits draft PRs; raises manual PRs; creates and submits POs; initiates supplier registrations; monitors PO status; communicates with suppliers.
- **Can Approve:** Nothing — initiates only.
- **Cannot:** Approve their own PRs or POs; approve suppliers; access inventory or distribution records.
- **Modules:** M1 (create supplier requests), M2 (submit PRs), M3 (create POs).

**Actor 5: Procurement Manager**
- **Who:** Head of Procurement or designated senior officer.
- **Does:** Reviews and approves/rejects PRs; reviews and approves/rejects POs (Manager stage); approves/rejects supplier registrations; manages supplier status (suspend/deactivate); reviews procurement pipeline.
- **Can Approve:** PRs; POs (Manager / Stage 1); supplier registrations.
- **Cannot:** Create PRs or POs; provide Finance-stage PO approval; access inventory operations.
- **Modules:** M1 (approve suppliers), M2 (approve PRs), M3 (Stage 1 PO approval).

**Actor 6: Finance Officer / Finance Manager**
- **Who:** Finance Department representative.
- **Does:** Reviews Manager-approved POs for budget and price compliance; approves/rejects POs (Finance stage); performs three-way invoice match (PO + GRN + Invoice).
- **Can Approve:** POs (Finance / Stage 2).
- **Cannot:** Create PRs or POs; provide Manager-stage approval; access inventory or distribution.
- **Modules:** M3 (Stage 2 PO approval), M6 (read GRN quantities for invoice matching).

### 3.3 Tier 3 — Warehouse & Store Operations

**Actor 7: Weighbridge Operator**
- **Who:** Dedicated officer stationed at the weighbridge entry point.
- **Does:** Matches arriving trucks to Issued POs; records Weighbridge Tickets; captures gross/tare weights; prints tickets and obtains driver signatures; escalates variance flags.
- **Can Approve:** Weighbridge Tickets within tolerance.
- **Cannot:** Override variances; create GRNs; access inventory, procurement, or distribution records.
- **Modules:** M5 (Weighbridge operations).

**Actor 8: Weighbridge Supervisor**
- **Who:** Senior logistics officer (often the Central Store Manager). On-call during delivery windows.
- **Does:** Reviews variance-flagged Weighbridge Tickets; investigates discrepancies; overrides with mandatory written justification or rejects delivery.
- **Can Approve:** Weighbridge variance overrides.
- **Cannot:** Initiate a Weighbridge Ticket; serve as both Operator and Supervisor.
- **Modules:** M5 (variance override authority).

**Actor 9: Quality Inspector**
- **Who:** Chemist or technical officer within the Water Board.
- **Does:** Receives Quality Sampling notifications when truck arrives; collects and tests samples at the gate; records inspection findings; submits Pass/Fail results.
- **Can Approve:** Inspection outcomes (Pass/Fail).
- **Cannot:** Create or approve PRs/POs; access stock ledger; modify a submitted inspection record.
- **Modules:** M4 (primary actor — pre-weighbridge quality sampling).

**Actor 10: Central Store Keeper**
- **Who:** Custodian of the Central Store. Multiple staff possible — each transaction tied to the individual.
- **Does:** Creates GRNs against passed Weighbridge Tickets; initiates Lot creation and QR printing after quality clearance; attaches and scans labels; assigns bin locations; scans bags out during STO dispatch; raises damage/loss reports; participates in cycle counts.
- **Can Approve:** Nothing — executes only.
- **Cannot:** Approve GRNs or STOs; access procurement records beyond GRN reference; edit ledger entries; access Unit or User Store records.
- **Modules:** M6 (GRN), M7 (Lot + QR), M8 (put-away), M10 (counter), M12 (dispatch scan-out), M16 (loss reports).

**Actor 11: Central Store Manager**
- **Who:** Supervising officer over the Central Store.
- **Does:** Approves/rejects STOs from Central to Unit Stores; manages cycle count schedule; approves minor physical count variances; investigates TDN shortage reports.
- **Can Approve:** Central→Unit STOs; physical count adjustments (minor variances); write-offs 6–20 bags (Central Store).
- **Cannot:** Create STOs; physically scan bags; access procurement records; approve their own STO.
- **Modules:** M9 (read), M10 (count orders + variance approval), M11 (STO approval), M12 (shortage alerts), M13 (shortage notifications), M16 (write-offs 6–20).

**Actor 12: Unit Store Keeper**
- **Who:** Custodian of a Unit Store. One per Unit Store.
- **Does:** Scans inbound bags from Central Store and submits GRD; manages Unit Store inventory; initiates replenishment requests; scans bags out for Unit→User Store STOs; participates in physical counts; raises loss reports.
- **Can Approve:** Nothing — executes only.
- **Modules:** M11 (initiate requests), M12 (dispatch scan-out), M13 (inbound GRD), M10 (counter), M16 (loss reports).

**Actor 13: Unit Store Manager**
- **Who:** Supervisory officer over one or more Unit Stores.
- **Does:** Approves/rejects STOs from Unit to User Stores; reviews replenishment requests upward; approves minor write-offs; receives shortage and excess alerts.
- **Can Approve:** Unit→User STOs; write-offs 1–5 bags (Unit Store).
- **Cannot:** Create STOs; approve Central→Unit STOs; access procurement or User Store consumption records.
- **Modules:** M10 (count orders + variance), M11 (STO approval), M13 (shortage escalations), M16 (write-offs 1–5).

### 3.4 Tier 4 — Treatment Plant Operations

**Actor 14: User Store Keeper (Treatment Plant)**
- **Who:** Inventory custodian at a Treatment Plant.
- **Does:** Scans inbound bags from Unit Store and submits GRD; manages User Store inventory; submits replenishment requests; participates in physical counts; raises loss/damage reports.
- **Can Approve:** Nothing — executes only.
- **Modules:** M11 (initiate requests), M13 (inbound GRD), M14 (stock visibility), M10 (counter), M16 (loss reports).

**Actor 15: Treatment Plant Operator**
- **Who:** Water treatment technician who physically doses Alum.
- **Does:** Opens Consumption Entries; enters volume of water being treated; retrieves and scans bags; records actual quantity consumed; submits consumption entries; records partial bag usage.
- **Can Approve:** Nothing — records only.
- **Cannot:** Modify or delete a submitted entry; access any module outside M14; change dosage rate parameters.
- **Modules:** M14 (primary actor).

**Actor 16: Plant Supervisor / Chemist**
- **Who:** Senior technical officer at the Treatment Plant.
- **Does:** Recommends standard dosage rate for their plant; receives and acts on anomaly alerts; provides mandatory acknowledgment on flagged consumption entries; investigates operator-level discrepancies; approves minor write-offs at User Store level.
- **Can Approve:** Anomaly acknowledgments; write-offs 1–5 bags (User Store); dosage rate recommendations.
- **Modules:** M14 (receives escalations), M15 (anomaly review + dosage config), M16 (write-offs 1–5).

**Actor 17: Operations Manager**
- **Who:** Senior Water Board manager with cross-site visibility.
- **Does:** Receives and investigates significant escalations (losses 6–20 bags, elevated anomalies, unresolved transit shortages); approves significant write-offs; investigates cross-site patterns; approves significant physical count variances.
- **Can Approve:** Significant physical count variances (1–5%); write-offs 6–20 bags.
- **Cannot:** Create any operational transaction; approve POs or STOs; modify any record.
- **Modules:** M10 (significant variances), M13 (unresolved shortage escalations), M15 (elevated anomaly alerts), M16 (write-offs 6–20).

**Actor 18: Driver / Transporter (External Actor)**
- **Who:** Vehicle driver employed by transport contractor or supplier. No system login.
- **Does:** Presents ID at gate and weighbridge; signs printed Weighbridge Tickets and TDNs physically; confirms receipt of load via PIN at dispatch.
- **Can Approve:** Nothing.
- **System Interaction:** Identity recorded in DVRs, Weighbridge Tickets, and TDNs. Transit windows monitored. Named party in custody chain without system credentials.

**Actor 19: Gate / Security Officer** *(NEW in v3.0)*
- **Who:** Security personnel stationed at the facility entrance gate.
- **Does:** Stops incoming trucks; creates Driver Visit Records (DVR); verifies driver identity; searches for matching POs; controls facility access (admits or blocks trucks); instructs rejected trucks to depart.
- **Can Approve:** Nothing — creates DVR and controls physical access only.
- **Cannot:** Modify POs, inspections, or any other record; access inventory or distribution systems.
- **Modules:** M4 (DVR creation, gate access control).

### 3.5 Actor & Module Cross-Reference Matrix

| Actor | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | M13 | M14 | M15 | M16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. System Admin | C | — | — | — | — | — | C | — | R | — | — | — | — | — | C | — |
| 2. Director | — | — | — | — | — | — | — | — | R | R | — | — | — | — | R | A |
| 3. Auditor | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R | R |
| 4. Proc. Officer | C | C/S | C | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 5. Proc. Manager | A | A | A | — | — | — | — | — | — | — | — | — | — | — | — | — |
| 6. Finance Officer | — | — | A | — | — | R | — | — | — | — | — | — | — | — | — | — |
| 7. WB Operator | — | — | R | — | C | — | — | — | — | — | — | — | — | — | — | — |
| 8. WB Supervisor | — | — | — | — | A | — | — | — | — | — | — | — | — | — | — | — |
| 9. Quality Inspector | — | — | — | C/A | — | — | — | — | — | — | — | — | — | — | — | — |
| 10. CS Keeper | — | — | — | — | — | C | C | C | — | E | — | E | — | — | — | C |
| 11. CS Manager | — | — | — | — | — | — | — | R | R | A | A | R | R | — | — | A |
| 12. US Keeper | — | — | — | — | — | — | — | — | — | E | C | E | C | R | — | C |
| 13. US Manager | — | — | — | — | — | — | — | — | — | A | A | — | R | — | — | A |
| 14. User SK | — | — | — | — | — | — | — | — | — | E | C | — | C | R | — | C |
| 15. Plant Operator | — | — | — | — | — | — | — | — | — | — | — | — | — | C | — | — |
| 16. Plant Supervisor | — | — | — | — | — | — | — | — | — | — | — | — | — | R/A | A | A |
| 17. Ops Manager | — | — | — | — | — | — | — | — | — | A | — | — | R | — | R | A |
| 18. Driver | — | — | — | — | S | — | — | — | — | — | — | S | — | — | — | — |
| 19. Gate Officer | — | — | — | C | — | — | — | — | — | — | — | — | — | — | — | — |

Key: C = Create, S = Sign/Submit, A = Approve, R = Read, E = Execute

### 3.6 Segregation of Duties — Enforcement Rules

These rules are enforced at the API middleware level (not just policy). The system MUST reject requests that violate any of these constraints, returning HTTP 403.

| Operation | Who Initiates | Who Approves | Enforcement |
|---|---|---|---|
| Supplier Registration | Procurement Officer | Procurement Manager | `created_by ≠ approved_by` |
| Purchase Requisition | Proc. Officer / System | Procurement Manager | `raised_by ≠ approved_by` |
| Purchase Order (Stage 1) | Procurement Officer | Procurement Manager | `requested_by ≠ manager_approved_by` |
| Purchase Order (Stage 2) | — | Finance Officer | `manager_approved_by ≠ finance_approved_by` AND `requested_by ≠ finance_approved_by` |
| Weighbridge Override | WB Operator (flags) | WB Supervisor | `operator_id ≠ override_by` |
| STO: Central→Unit | Store Keeper / System | Central Store Manager | `requested_by ≠ authorised_by` |
| STO: Unit→User | Unit Store Keeper / System | Unit Store Manager | `requested_by ≠ authorised_by` |
| Physical Count vs Recount | Counter 1 | Counter 2 (then Manager approves) | `assigned_to(count1) ≠ assigned_to(count2)` |
| Consumption Anomaly | Plant Operator (triggers) | Plant Supervisor | `operator_id ≠ supervisor_ack_by` |
| Write-Off | Store Keeper (raises) | Manager/Supervisor/Director | `raised_by ≠ approved_by` |

### 3.7 Multi-Store Permission Scoping

Actors are scoped to specific stores. The system enforces:

- A Unit Store Manager may manage **one or more** Unit Stores (configured via `user_store_assignments` — M:M relationship)
- A Store Keeper can only see and operate on inventory at **their assigned store**
- A Plant Operator can only record consumption at **their assigned User Store**
- Cross-store visibility is reserved for:
  - Tier 1 actors (System Admin, Director, Auditor) — system-wide
  - Operations Manager — system-wide read
  - Store Managers — their assigned stores only

### 3.8 Permission Constants

```
# Supplier Management
suppliers:create, suppliers:read, suppliers:approve

# Procurement
pr:create, pr:read, pr:approve
po:create, po:read, po:approve:manager, po:approve:finance

# Quality & Gate
dvr:create, dvr:read
inspection:submit, inspection:read

# Weighbridge
weighbridge:record, weighbridge:read, weighbridge:override

# Inventory
grn:create, grn:read
lots:read, labels:print, items:read, items:label, items:putaway
locations:read, locations:manage
ledger:read

# Stock Count
stockcount:create, stockcount:read, stockcount:execute, stockcount:approve

# Distribution
sto:create, sto:read, sto:approve:central_unit, sto:approve:unit_user
transfer:dispatch, transfer:receive, transfer:read

# Consumption
consumption:record, consumption:read, consumption:acknowledge
dosage:read, dosage:configure

# Write-Offs
writeoff:raise, writeoff:read
writeoff:approve:minor, writeoff:approve:significant, writeoff:approve:critical

# Reporting & Audit
reports:view, audit:view, audit:verify, audit:export

# Alerts
alerts:read, alerts:acknowledge, alerts:configure

# Administration
users:manage, system:configure, devices:manage

# Biometric
biometric:enroll, biometric:verify
```

---

## 4. Database Schema

Two separate PostgreSQL 16 databases: **Primary Database** (writable, full CRUD) and **Audit Database** (append-only, INSERT only, separate instance).

### 4.1 Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Cryptographic functions for hash chain
```

### 4.2 Custom ENUM Types

```sql
CREATE TYPE store_tier AS ENUM ('CentralStore', 'UnitStore', 'UserStore');
CREATE TYPE supplier_status AS ENUM ('PendingApproval', 'Active', 'Suspended', 'Deactivated', 'Rejected');
CREATE TYPE pr_status AS ENUM ('Draft', 'Submitted', 'Approved', 'Rejected', 'ConvertedToPO', 'Expired');
CREATE TYPE pr_trigger AS ENUM ('AutoReorderPoint', 'Manual');
CREATE TYPE po_status AS ENUM ('Draft', 'Submitted', 'ManagerApproved', 'Issued', 'AwaitingDelivery',
    'PartiallyReceived', 'FullyReceived', 'Closed', 'ManagerRejected', 'FinanceRejected',
    'AmendmentPending', 'Cancelled');
CREATE TYPE dvr_status AS ENUM ('PendingPOMatch', 'Active', 'QualityCleared', 'QualityFailed');
CREATE TYPE inspection_result AS ENUM ('Pass', 'Fail');
CREATE TYPE weighbridge_status AS ENUM ('InProgress', 'Pass', 'Flagged', 'OverrideApproved', 'Rejected');
CREATE TYPE grn_status AS ENUM ('Draft', 'Accepted', 'PartiallyAccepted');
CREATE TYPE lot_status AS ENUM ('PendingLabelling', 'Active', 'Depleted', 'Quarantined');
CREATE TYPE item_status AS ENUM ('PendingLabelling', 'InStock', 'Reserved', 'InTransit',
    'PartiallyConsumed', 'Consumed', 'Quarantined', 'Damaged', 'Lost', 'Returned');
CREATE TYPE ledger_entry_type AS ENUM ('Receipt', 'Issue', 'TransferReceipt', 'Consumption',
    'Adjustment', 'WriteOff', 'SupplierReturn');
CREATE TYPE count_type AS ENUM ('CycleCount', 'FullCount', 'SpotCount');
CREATE TYPE count_status AS ENUM ('Open', 'InProgress', 'PendingRecount', 'PendingApproval',
    'Approved', 'Closed');
CREATE TYPE sto_status AS ENUM ('Draft', 'Submitted', 'Authorised', 'InTransit',
    'PartiallyReceived', 'FullyReceived', 'Closed', 'Rejected', 'Cancelled');
CREATE TYPE sto_trigger AS ENUM ('AutoReorderPoint', 'ManualRequest');
CREATE TYPE tdn_status AS ENUM ('Generated', 'InTransit', 'Completed', 'ShortDelivery', 'Investigating');
CREATE TYPE consumption_status AS ENUM ('Submitted', 'Confirmed', 'PendingAcknowledgment', 'Closed');
CREATE TYPE anomaly_level AS ENUM ('Normal', 'LowConsumption', 'Elevated', 'HighAnomaly', 'Unconfigured');
CREATE TYPE writeoff_category AS ENUM ('PhysicalDamage', 'QualityDegradation', 'TransitLoss',
    'UnexplainedShortage', 'SupplierReturn');
CREATE TYPE writeoff_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE alert_severity AS ENUM ('Info', 'Warning', 'Significant', 'Critical');
CREATE TYPE alert_status AS ENUM ('Open', 'Acknowledged', 'Closed');
CREATE TYPE notification_channel AS ENUM ('InApp', 'SMS', 'Email');
CREATE TYPE notification_status AS ENUM ('Pending', 'Sent', 'Failed', 'Retrying');
CREATE TYPE investigation_status AS ENUM ('Open', 'InProgress', 'Closed', 'Escalated');
CREATE TYPE return_order_status AS ENUM ('Draft', 'Shipped', 'CreditReceived', 'Closed');
CREATE TYPE season_type AS ENUM ('Dry', 'Wet', 'Transition');
```

### 4.3 Tables — Identity & Configuration

#### `stores` (with parent hierarchy)

```sql
CREATE TABLE stores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    tier            store_tier NOT NULL,
    parent_store_id UUID REFERENCES stores(id),  -- NEW: enforces hierarchy
    address         TEXT,
    gps_latitude    DECIMAL(10,8),
    gps_longitude   DECIMAL(11,8),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    CONSTRAINT chk_hierarchy CHECK (
        (tier = 'CentralStore' AND parent_store_id IS NULL) OR
        (tier = 'UnitStore' AND parent_store_id IS NOT NULL) OR
        (tier = 'UserStore' AND parent_store_id IS NOT NULL)
    )
);
CREATE INDEX idx_stores_parent ON stores(parent_store_id);
CREATE INDEX idx_stores_tier ON stores(tier);
```

#### `store_balances` (concurrency-safe balance tracking)

```sql
CREATE TABLE store_balances (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID NOT NULL REFERENCES stores(id),
    lot_id          UUID NOT NULL REFERENCES lots(id),
    current_balance INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, lot_id),
    CONSTRAINT chk_non_negative CHECK (current_balance >= 0)
);
CREATE INDEX idx_store_balances_store ON store_balances(store_id);
```

#### `storage_locations`

```sql
CREATE TABLE storage_locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID NOT NULL REFERENCES stores(id),
    location_code   VARCHAR(50) NOT NULL,
    zone            VARCHAR(50) NOT NULL,
    row             VARCHAR(50),
    position        VARCHAR(50),
    max_capacity_kg DECIMAL(18,2),
    current_bags    INT NOT NULL DEFAULT 0,
    current_weight_kg DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(store_id, location_code)
);
```

#### `roles`

```sql
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `users`

```sql
CREATE TABLE users (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username              VARCHAR(100) NOT NULL UNIQUE,
    email                 VARCHAR(200) NOT NULL UNIQUE,
    password_hash         VARCHAR(500) NOT NULL,
    first_name            VARCHAR(100) NOT NULL,
    last_name             VARCHAR(100) NOT NULL,
    phone_number          VARCHAR(50),
    store_id              UUID REFERENCES stores(id),
    biometric_template    BYTEA,
    is_active             BOOLEAN NOT NULL DEFAULT true,
    last_login_at         TIMESTAMPTZ,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_end           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by            UUID REFERENCES users(id)
);
```

#### `user_roles`

```sql
CREATE TABLE user_roles (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);
```

#### `user_store_assignments` (multi-store scoping)

```sql
CREATE TABLE user_store_assignments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id    UUID NOT NULL REFERENCES stores(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(user_id, store_id)
);
```

#### `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id),
    token            VARCHAR(500) NOT NULL UNIQUE,
    device_id        VARCHAR(100),
    expires_at       TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at       TIMESTAMPTZ,
    replaced_by_token VARCHAR(500),
    revoked_reason   VARCHAR(200)
);
```

#### `system_configurations` (NEW)

```sql
CREATE TABLE system_configurations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key  VARCHAR(200) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  UUID REFERENCES users(id)
);
-- Seed data:
-- ('weighbridge_variance_tolerance_pct', '2.0')
-- ('pr_expiry_days', '30')
-- ('consumption_backdate_window_hours', '24')
-- ('dispatch_weight_tolerance_pct', '1.0')
-- ('transit_overdue_hours', '2')
-- ('max_failed_logins', '5')
-- ('writeoff_threshold_minor', '5')
-- ('writeoff_threshold_significant', '20')
-- ('loss_rate_warning_pct', '0.5')
-- ('loss_rate_significant_pct', '1.0')
-- ('loss_rate_critical_pct', '2.0')
```

#### `reorder_point_configs` (NEW)

```sql
CREATE TABLE reorder_point_configs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id        UUID NOT NULL REFERENCES stores(id) UNIQUE,
    reorder_point   INT NOT NULL,  -- bags
    max_stock_level INT NOT NULL,  -- bags
    safety_stock    INT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID REFERENCES users(id)
);
```

### 4.4 Tables — Procurement

#### `suppliers`

```sql
CREATE TABLE suppliers (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                   VARCHAR(200) NOT NULL,
    registration_number    VARCHAR(100),
    address                TEXT,
    contact_person         VARCHAR(200),
    contact_phone          VARCHAR(50),
    contact_email          VARCHAR(200),
    bank_name              VARCHAR(200),
    bank_account_number    VARCHAR(50),
    bank_account_name      VARCHAR(200),
    tax_id                 VARCHAR(50),
    status                 supplier_status NOT NULL DEFAULT 'PendingApproval',
    approved_by            UUID REFERENCES users(id),
    approved_at            TIMESTAMPTZ,
    rejection_reason       TEXT,
    delivery_count         INT NOT NULL DEFAULT 0,
    on_time_delivery_rate  DECIMAL(5,2),
    quantity_accuracy_rate DECIMAL(5,2),
    quality_acceptance_rate DECIMAL(5,2),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by             UUID REFERENCES users(id),
    last_modified_at       TIMESTAMPTZ,
    last_modified_by       UUID REFERENCES users(id)
);
```

#### `purchase_requisitions`

```sql
CREATE TABLE purchase_requisitions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_number               VARCHAR(50) NOT NULL UNIQUE,
    trigger_type            pr_trigger NOT NULL,
    status                  pr_status NOT NULL DEFAULT 'Draft',
    store_id                UUID NOT NULL REFERENCES stores(id),
    requested_quantity      INT NOT NULL,
    requested_weight_kg     DECIMAL(18,2) NOT NULL,
    stock_balance_at_pr     DECIMAL(18,2) NOT NULL,
    justification           TEXT,
    requested_delivery_date DATE,
    expires_at              TIMESTAMPTZ,
    raised_by               UUID NOT NULL REFERENCES users(id),
    raised_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by             UUID REFERENCES users(id),
    approved_at             TIMESTAMPTZ,
    rejection_reason        TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `purchase_orders`

```sql
CREATE TABLE purchase_orders (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number                VARCHAR(50) NOT NULL UNIQUE,
    pr_id                    UUID NOT NULL REFERENCES purchase_requisitions(id),
    supplier_id              UUID NOT NULL REFERENCES suppliers(id),
    destination_store_id     UUID NOT NULL REFERENCES stores(id),
    status                   po_status NOT NULL DEFAULT 'Draft',
    currency                 VARCHAR(3) NOT NULL DEFAULT 'NGN',
    total_amount             DECIMAL(18,2) NOT NULL,
    expected_delivery_date   DATE,
    actual_delivery_date     DATE,
    notes                    TEXT,
    requested_by             UUID NOT NULL REFERENCES users(id),
    requested_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    manager_approved_by      UUID REFERENCES users(id),
    manager_approved_at      TIMESTAMPTZ,
    manager_rejection_reason TEXT,
    finance_approved_by      UUID REFERENCES users(id),
    finance_approved_at      TIMESTAMPTZ,
    finance_rejection_reason TEXT,
    issued_at                TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by               UUID REFERENCES users(id),
    last_modified_at         TIMESTAMPTZ,
    last_modified_by         UUID REFERENCES users(id)
);
```

#### `purchase_order_lines`

```sql
CREATE TABLE purchase_order_lines (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id                 UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_number           INT NOT NULL,
    product_specification VARCHAR(200) NOT NULL,
    quantity_bags         INT NOT NULL,
    standard_weight_kg    DECIMAL(10,4) NOT NULL,
    total_weight_kg       DECIMAL(18,2) NOT NULL,
    unit_price            DECIMAL(18,2) NOT NULL,
    line_total            DECIMAL(18,2) NOT NULL,
    UNIQUE(po_id, line_number)
);
```

#### `driver_visit_records` (NEW)

```sql
CREATE TABLE driver_visit_records (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dvr_number         VARCHAR(50) NOT NULL UNIQUE,
    po_id              UUID REFERENCES purchase_orders(id),
    supplier_id        UUID REFERENCES suppliers(id),
    driver_name        VARCHAR(200) NOT NULL,
    driver_id_number   VARCHAR(100),
    driver_phone       VARCHAR(50),
    vehicle_reg        VARCHAR(50) NOT NULL,
    status             dvr_status NOT NULL DEFAULT 'PendingPOMatch',
    quality_cleared_at TIMESTAMPTZ,
    quality_failed_at  TIMESTAMPTZ,
    gate_officer_id    UUID NOT NULL REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dvr_po ON driver_visit_records(po_id);
CREATE INDEX idx_dvr_status ON driver_visit_records(status);
```

#### `quality_inspections` (updated for pre-weighbridge sampling)

```sql
CREATE TABLE quality_inspections (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_number   VARCHAR(50) NOT NULL UNIQUE,
    dvr_id              UUID NOT NULL REFERENCES driver_visit_records(id),
    po_id               UUID NOT NULL REFERENCES purchase_orders(id),
    result              inspection_result,
    bags_sampled        INT NOT NULL DEFAULT 0,
    visual_check_notes  TEXT,
    physical_state_notes TEXT,
    purity_test_result  TEXT,
    rejection_reason    TEXT,
    photo_urls          JSONB,
    inspector_id        UUID NOT NULL REFERENCES users(id),
    inspected_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `weighbridge_tickets` (updated for Gross→Tare sequence)

```sql
CREATE TABLE weighbridge_tickets (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number    VARCHAR(50) NOT NULL UNIQUE,
    po_id            UUID NOT NULL REFERENCES purchase_orders(id),
    dvr_id           UUID NOT NULL REFERENCES driver_visit_records(id),
    supplier_id      UUID NOT NULL REFERENCES suppliers(id),
    driver_name      VARCHAR(200) NOT NULL,
    driver_id_number VARCHAR(100),
    driver_phone     VARCHAR(50),
    vehicle_reg      VARCHAR(50) NOT NULL,
    gross_weight_kg  DECIMAL(18,4),
    gross_weight_at  TIMESTAMPTZ,
    gross_manual     BOOLEAN NOT NULL DEFAULT false,
    tare_weight_kg   DECIMAL(18,4),
    tare_weight_at   TIMESTAMPTZ,
    tare_manual      BOOLEAN NOT NULL DEFAULT false,
    net_weight_kg    DECIMAL(18,4) GENERATED ALWAYS AS (gross_weight_kg - tare_weight_kg) STORED,
    po_quantity_kg   DECIMAL(18,4) NOT NULL,
    variance_pct     DECIMAL(8,4) GENERATED ALWAYS AS (
        ABS(gross_weight_kg - tare_weight_kg - po_quantity_kg) / NULLIF(po_quantity_kg, 0) * 100
    ) STORED,
    status           weighbridge_status NOT NULL DEFAULT 'InProgress',
    override_by      UUID REFERENCES users(id),
    override_reason  TEXT,
    override_at      TIMESTAMPTZ,
    operator_id      UUID NOT NULL REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `goods_received_notes` (updated — no longer depends on quality inspection)

```sql
CREATE TABLE goods_received_notes (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number            VARCHAR(50) NOT NULL UNIQUE,
    po_id                 UUID NOT NULL REFERENCES purchase_orders(id),
    weighbridge_ticket_id UUID NOT NULL REFERENCES weighbridge_tickets(id),
    dvr_id                UUID NOT NULL REFERENCES driver_visit_records(id),
    store_id              UUID NOT NULL REFERENCES stores(id),
    status                grn_status NOT NULL DEFAULT 'Draft',
    bags_on_truck         INT NOT NULL,
    bags_damaged          INT NOT NULL DEFAULT 0,
    bags_accepted         INT,
    condition_notes       TEXT,
    photo_urls            JSONB,
    received_by           UUID NOT NULL REFERENCES users(id),
    witness_id            UUID REFERENCES users(id),
    received_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.5 Tables — Inventory

#### `lots`

```sql
CREATE TABLE lots (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_number       VARCHAR(50) NOT NULL UNIQUE,
    grn_id           UUID NOT NULL REFERENCES goods_received_notes(id),
    po_id            UUID NOT NULL REFERENCES purchase_orders(id),
    supplier_id      UUID NOT NULL REFERENCES suppliers(id),
    store_id         UUID NOT NULL REFERENCES stores(id),
    receipt_date     TIMESTAMPTZ NOT NULL,
    standard_weight_kg DECIMAL(10,4) NOT NULL,
    total_bags       INT NOT NULL,
    bags_in_stock    INT NOT NULL DEFAULT 0,
    bags_reserved    INT NOT NULL DEFAULT 0,
    bags_in_transit  INT NOT NULL DEFAULT 0,
    bags_consumed    INT NOT NULL DEFAULT 0,
    bags_written_off INT NOT NULL DEFAULT 0,
    fifo_sequence    BIGSERIAL,
    status           lot_status NOT NULL DEFAULT 'PendingLabelling',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by       UUID REFERENCES users(id)
);
CREATE INDEX idx_lots_store ON lots(store_id);
CREATE INDEX idx_lots_fifo ON lots(fifo_sequence);
```

#### `items` (individual bags — with `current_store_id`)

```sql
CREATE TABLE items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code         VARCHAR(100) NOT NULL UNIQUE,
    qr_code           VARCHAR(500) NOT NULL UNIQUE,
    lot_id            UUID NOT NULL REFERENCES lots(id),
    location_id       UUID REFERENCES storage_locations(id),
    current_store_id  UUID REFERENCES stores(id),  -- NEW: tracks which store the bag is at
    status            item_status NOT NULL DEFAULT 'PendingLabelling',
    standard_weight_kg DECIMAL(10,4) NOT NULL,
    remaining_weight_kg DECIMAL(10,4),
    labelled_at       TIMESTAMPTZ,
    labelled_by       UUID REFERENCES users(id),
    put_away_at       TIMESTAMPTZ,
    put_away_by       UUID REFERENCES users(id),
    reserved_at       TIMESTAMPTZ,
    reserved_by_sto   UUID REFERENCES stock_transfer_orders(id),  -- FK added
    dispatched_at     TIMESTAMPTZ,
    dispatched_by     UUID REFERENCES users(id),
    received_at_dest  TIMESTAMPTZ,
    received_by       UUID REFERENCES users(id),
    consumed_at       TIMESTAMPTZ,
    consumed_by       UUID REFERENCES users(id),
    consumption_id    UUID REFERENCES consumption_records(id),  -- FK added
    written_off_at    TIMESTAMPTZ,
    written_off_by    UUID REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_items_lot ON items(lot_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_location ON items(location_id);
CREATE INDEX idx_items_qr ON items(qr_code);
CREATE INDEX idx_items_store ON items(current_store_id);
```

#### `stock_ledger`

```sql
CREATE TABLE stock_ledger (
    id               BIGSERIAL PRIMARY KEY,
    entry_number     VARCHAR(50) NOT NULL UNIQUE,
    entry_type       ledger_entry_type NOT NULL,
    store_id         UUID NOT NULL REFERENCES stores(id),
    lot_id           UUID NOT NULL REFERENCES lots(id),
    quantity_bags    INT NOT NULL,  -- positive = in, negative = out
    weight_kg        DECIMAL(18,4) NOT NULL,
    balance_before   INT NOT NULL,
    balance_after    INT NOT NULL,
    reference_type   VARCHAR(100) NOT NULL,
    reference_id     UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_system BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT chk_balance_non_negative CHECK (balance_after >= 0)
);
CREATE INDEX idx_ledger_store ON stock_ledger(store_id);
CREATE INDEX idx_ledger_lot ON stock_ledger(lot_id);
CREATE INDEX idx_ledger_created ON stock_ledger(created_at);
CREATE INDEX idx_ledger_ref ON stock_ledger(reference_id);
```

### 4.6 Tables — Stock Count

#### `stock_count_orders`

```sql
CREATE TABLE stock_count_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count_number    VARCHAR(50) NOT NULL UNIQUE,
    count_type      count_type NOT NULL,
    store_id        UUID NOT NULL REFERENCES stores(id),
    location_ids    JSONB,  -- specific locations, null = all
    status          count_status NOT NULL DEFAULT 'Open',
    frozen_balance  JSONB,  -- ledger snapshot at count time
    assigned_to     UUID NOT NULL REFERENCES users(id),
    recount_assigned_to UUID REFERENCES users(id),
    created_by      UUID NOT NULL REFERENCES users(id),
    scheduled_date  DATE NOT NULL,
    completed_at    TIMESTAMPTZ,
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    approval_notes  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `stock_count_lines`

```sql
CREATE TABLE stock_count_lines (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count_order_id UUID NOT NULL REFERENCES stock_count_orders(id),
    lot_id         UUID NOT NULL REFERENCES lots(id),
    location_id    UUID REFERENCES storage_locations(id),
    ledger_qty     INT NOT NULL,
    counted_qty    INT,
    variance_qty   INT GENERATED ALWAYS AS (COALESCE(counted_qty, 0) - ledger_qty) STORED,
    variance_pct   DECIMAL(8,4),
    notes          TEXT,
    counted_by     UUID REFERENCES users(id),
    counted_at     TIMESTAMPTZ
);
```

### 4.7 Tables — Distribution

#### `stock_transfer_orders`

```sql
CREATE TABLE stock_transfer_orders (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sto_number            VARCHAR(50) NOT NULL UNIQUE,
    trigger_type          sto_trigger NOT NULL,
    status                sto_status NOT NULL DEFAULT 'Draft',
    source_store_id       UUID NOT NULL REFERENCES stores(id),
    destination_store_id  UUID NOT NULL REFERENCES stores(id),
    requested_bags        INT NOT NULL,
    authorised_bags       INT,
    source_balance_at_auth INT,
    requested_by          UUID NOT NULL REFERENCES users(id),
    requested_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    authorised_by         UUID REFERENCES users(id),
    authorised_at         TIMESTAMPTZ,
    rejection_reason      TEXT,
    requested_delivery    DATE,
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `sto_items`

```sql
CREATE TABLE sto_items (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sto_id  UUID NOT NULL REFERENCES stock_transfer_orders(id),
    item_id UUID NOT NULL REFERENCES items(id),
    UNIQUE(sto_id, item_id)
);
```

#### `transfer_dispatch_notes`

```sql
CREATE TABLE transfer_dispatch_notes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tdn_number          VARCHAR(50) NOT NULL UNIQUE,
    sto_id              UUID NOT NULL REFERENCES stock_transfer_orders(id),
    dispatched_bags     INT NOT NULL,
    dispatched_weight_kg DECIMAL(18,4) NOT NULL,
    driver_name         VARCHAR(200) NOT NULL,
    driver_phone        VARCHAR(50),
    vehicle_reg         VARCHAR(50) NOT NULL,
    departure_at        TIMESTAMPTZ NOT NULL,
    expected_arrival_at TIMESTAMPTZ,
    dispatching_officer UUID NOT NULL REFERENCES users(id),
    consignment_qr      VARCHAR(500),
    status              tdn_status NOT NULL DEFAULT 'InTransit',
    short_shipment      BOOLEAN NOT NULL DEFAULT false,
    short_reason        TEXT,
    short_approved_by   UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `goods_receipt_at_destination`

```sql
CREATE TABLE goods_receipt_at_destination (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grd_number        VARCHAR(50) NOT NULL UNIQUE,
    tdn_id            UUID NOT NULL REFERENCES transfer_dispatch_notes(id),
    sto_id            UUID NOT NULL REFERENCES stock_transfer_orders(id),
    received_bags     INT NOT NULL,
    received_weight_kg DECIMAL(18,4) NOT NULL,
    shortage_bags     INT NOT NULL DEFAULT 0,
    excess_bags       INT NOT NULL DEFAULT 0,
    damaged_bags      INT NOT NULL DEFAULT 0,
    arrival_at        TIMESTAMPTZ NOT NULL,
    receiving_officer UUID NOT NULL REFERENCES users(id),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.8 Tables — Consumption

#### `consumption_records`

```sql
CREATE TABLE consumption_records (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumption_number   VARCHAR(50) NOT NULL UNIQUE,
    store_id             UUID NOT NULL REFERENCES stores(id),
    operator_id          UUID NOT NULL REFERENCES users(id),
    treatment_session_ref VARCHAR(100),
    volume_treated_m3    DECIMAL(18,4) NOT NULL,
    standard_dosage_rate DECIMAL(10,6) NOT NULL,
    seasonal_multiplier  DECIMAL(6,4) NOT NULL DEFAULT 1.0,
    suggested_qty_kg     DECIMAL(18,4) NOT NULL,
    actual_qty_bags      INT NOT NULL,
    actual_qty_kg        DECIMAL(18,4) NOT NULL,
    deviation_pct        DECIMAL(8,4),
    efficiency_ratio     DECIMAL(8,4),
    status               consumption_status NOT NULL DEFAULT 'Submitted',
    anomaly_level        anomaly_level,
    supervisor_ack_by    UUID REFERENCES users(id),
    supervisor_ack_at    TIMESTAMPTZ,
    supervisor_ack_notes TEXT,
    recorded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `consumption_items`

```sql
CREATE TABLE consumption_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumption_id    UUID NOT NULL REFERENCES consumption_records(id),
    item_id           UUID NOT NULL REFERENCES items(id),
    weight_consumed_kg DECIMAL(10,4) NOT NULL,
    is_partial        BOOLEAN NOT NULL DEFAULT false,
    remaining_weight_kg DECIMAL(10,4),
    scanned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `dosage_rate_configurations` (NEW)

```sql
CREATE TABLE dosage_rate_configurations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id            UUID NOT NULL REFERENCES stores(id) UNIQUE,
    standard_rate_kg_m3 DECIMAL(10,6) NOT NULL,
    acceptable_variance_pct DECIMAL(5,2) NOT NULL DEFAULT 15.0,
    normal_low_pct      DECIMAL(5,2) NOT NULL DEFAULT 85.0,
    normal_high_pct     DECIMAL(5,2) NOT NULL DEFAULT 115.0,
    elevated_high_pct   DECIMAL(5,2) NOT NULL DEFAULT 130.0,
    dry_season_multiplier DECIMAL(6,4) NOT NULL DEFAULT 0.9,
    wet_season_multiplier DECIMAL(6,4) NOT NULL DEFAULT 1.3,
    dry_season_start    DATE NOT NULL,  -- e.g., Nov 1
    dry_season_end      DATE NOT NULL,  -- e.g., Mar 31
    wet_season_start    DATE NOT NULL,  -- e.g., Jun 1
    wet_season_end      DATE NOT NULL,  -- e.g., Sep 30
    -- Transition periods use multiplier 1.0
    configured_by       UUID NOT NULL REFERENCES users(id),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.9 Tables — Write-Offs & Loss Management

#### `write_off_requests`

```sql
CREATE TABLE write_off_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number  VARCHAR(50) NOT NULL UNIQUE,
    store_id        UUID NOT NULL REFERENCES stores(id),
    category        writeoff_category NOT NULL,
    bags_count      INT NOT NULL,
    weight_kg       DECIMAL(18,4) NOT NULL,
    description     TEXT NOT NULL,
    photo_urls      JSONB,
    status          writeoff_status NOT NULL DEFAULT 'Pending',
    raised_by       UUID NOT NULL REFERENCES users(id),
    raised_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    approval_notes  TEXT,
    rejection_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `write_off_items`

```sql
CREATE TABLE write_off_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES write_off_requests(id),
    item_id    UUID REFERENCES items(id),  -- nullable if QR not scannable
    lot_id     UUID REFERENCES lots(id),
    notes      TEXT
);
```

#### `return_orders` (NEW)

```sql
CREATE TABLE return_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number   VARCHAR(50) NOT NULL UNIQUE,
    writeoff_id     UUID NOT NULL REFERENCES write_off_requests(id),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    po_id           UUID NOT NULL REFERENCES purchase_orders(id),
    bags_count      INT NOT NULL,
    weight_kg       DECIMAL(18,4) NOT NULL,
    status          return_order_status NOT NULL DEFAULT 'Draft',
    shipped_at      TIMESTAMPTZ,
    credit_received_at TIMESTAMPTZ,
    credit_amount   DECIMAL(18,2),
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `investigation_records` (NEW)

```sql
CREATE TABLE investigation_records (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_type    VARCHAR(100) NOT NULL,  -- 'StockCount', 'TransitShortage', 'ConsumptionAnomaly'
    reference_id      UUID NOT NULL,
    store_id          UUID NOT NULL REFERENCES stores(id),
    status            investigation_status NOT NULL DEFAULT 'Open',
    findings          TEXT,
    evidence_urls     JSONB,
    opened_by         UUID NOT NULL REFERENCES users(id),
    opened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_to       UUID REFERENCES users(id),
    closed_by         UUID REFERENCES users(id),
    closed_at         TIMESTAMPTZ,
    outcome           TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.10 Tables — Alerts & Notifications (NEW)

#### `alerts`

```sql
CREATE TABLE alerts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type          VARCHAR(100) NOT NULL,
    severity            alert_severity NOT NULL,
    title               VARCHAR(500) NOT NULL,
    message             TEXT NOT NULL,
    entity_type         VARCHAR(100),
    entity_id           UUID,
    store_id            UUID REFERENCES stores(id),
    status              alert_status NOT NULL DEFAULT 'Open',
    acknowledged_by     UUID REFERENCES users(id),
    acknowledged_at     TIMESTAMPTZ,
    acknowledgment_notes TEXT,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alerts_store ON alerts(store_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
```

#### `alert_rules` (NEW)

```sql
CREATE TABLE alert_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name       VARCHAR(200) NOT NULL UNIQUE,
    module          VARCHAR(50) NOT NULL,
    condition_type  VARCHAR(100) NOT NULL,
    threshold_value JSONB NOT NULL,
    severity        alert_severity NOT NULL,
    notify_roles    JSONB NOT NULL,  -- ['CentralStoreManager', 'OperationsManager']
    channels        JSONB NOT NULL DEFAULT '["InApp"]'::jsonb,  -- ['InApp', 'SMS', 'Email']
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID REFERENCES users(id)
);
```

#### `notifications` (NEW — delivery tracking)

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id        UUID REFERENCES alerts(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    channel         notification_channel NOT NULL,
    recipient       VARCHAR(200) NOT NULL,  -- phone number or email
    message         TEXT NOT NULL,
    status          notification_status NOT NULL DEFAULT 'Pending',
    sent_at         TIMESTAMPTZ,
    retry_count     INT NOT NULL DEFAULT 0,
    max_retries     INT NOT NULL DEFAULT 3,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
```

### 4.11 Audit Database (Separate Instance — Append-Only)

#### `audit_events` (redesigned — per-store chains)

```sql
CREATE TABLE audit_events (
    id              BIGSERIAL PRIMARY KEY,
    event_id        UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    event_type      VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID NOT NULL,
    event_data      JSONB NOT NULL,
    actor_id        UUID NOT NULL,
    actor_name      VARCHAR(200) NOT NULL,
    actor_role      VARCHAR(100),
    device_id       VARCHAR(100),
    ip_address      INET,
    store_id        UUID,  -- NEW: enables per-store hash chains
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Per-store chain fields (eliminates global sequence bottleneck)
    store_sequence  BIGINT NOT NULL,  -- per-store sequence number
    previous_hash   CHAR(64) NOT NULL,
    current_hash    CHAR(64) NOT NULL,
    UNIQUE(store_id, store_sequence)
);
CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_store ON audit_events(store_id);
CREATE INDEX idx_audit_store_seq ON audit_events(store_id, store_sequence);
```

#### Append-Only Enforcement (TRIGGER replaces RULE)

```sql
-- TRIGGER-based enforcement (raises error instead of silently dropping)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Modification of audit_events is prohibited. Operation: %', TG_OP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_update_audit
    BEFORE UPDATE ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_no_delete_audit
    BEFORE DELETE ON audit_events
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();
```

#### Canonical JSON Serializer

The hash chain uses a **deterministic JSON serializer** to prevent non-deterministic key ordering from breaking hash verification:

```
Hash Formula:
    CurrentHash = SHA256(EventId + CanonicalJSON(EventData) + PreviousHash)

Canonical JSON Rules:
    1. Keys sorted alphabetically (recursive)
    2. No whitespace between separators
    3. Null values included (not omitted)
    4. Numbers rendered without trailing zeros
    5. Dates in ISO 8601 UTC format

Genesis Hash (per store):
    0000000000000000000000000000000000000000000000000000000000000000
```

#### Per-Store Chain Tracking

```sql
CREATE TABLE audit_chain_state (
    store_id        UUID PRIMARY KEY,
    last_sequence   BIGINT NOT NULL DEFAULT 0,
    last_hash       CHAR(64) NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.12 Mobile Local Database (SQLite via Drift)

Each mobile device maintains a local SQLite database (`kamats_local.db`) with:

| Table | Purpose |
|---|---|
| `local_items` | Cached item data for the device's assigned store |
| `local_lots` | Cached lot data |
| `local_storage_locations` | Cached location data |
| `local_users` | Cached user data for validation |
| `offline_transactions` | Pending operations queue (not yet synced) |
| `sync_metadata` | Last sync timestamp, device ID, pending count |
| `local_dosage_config` | Cached dosage configuration for the store |

---

## 5. API Specification

### 5.1 General Conventions

- **Base URL:** `https://api.kamats.kanostate.gov.ng/api/v1/`
- **Authentication:** Bearer JWT token in `Authorization` header
- **Content-Type:** `application/json`
- **Custom Headers:**
  - `X-Device-Id` — required for mobile clients (device identification for sync and session binding)
  - `X-Request-Id` — optional idempotency key
- **Pagination:** `?page=1&pageSize=20` (default: page 1, 20 items)
- **Filtering:** Query parameters specific to each endpoint
- **Sorting:** `?sortBy=created_at&sortDir=desc`
- **Date Format:** ISO 8601 UTC (`2026-03-12T14:30:00Z`)

### 5.2 Error Response Format

```json
{
    "status": 422,
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "errors": [
        { "field": "quantity", "message": "Must be greater than zero" }
    ],
    "traceId": "abc-123"
}
```

**Standard Error Codes:**

| HTTP | Code | Meaning |
|---|---|---|
| 400 | BAD_REQUEST | Malformed request |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions or segregation of duties violation |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate resource or state conflict |
| 422 | VALIDATION_ERROR | Business rule violation |
| 429 | RATE_LIMITED | Too many requests |
| 503 | SERVICE_UNAVAILABLE | Serialization failure after retries |

### 5.3 Complete Endpoint Registry

All endpoints listed per module are detailed in Section 2 (Module Specifications). Below is the consolidated registry.

#### Authentication & Administration

| Method | Endpoint | Purpose | Rate Limit |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Login (username + password) | 10/min/IP |
| POST | `/api/v1/auth/refresh` | Refresh JWT token | 30/min/user |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) | 30/min/user |
| POST | `/api/v1/auth/biometric/enroll` | Enroll biometric template | 5/min/user |
| POST | `/api/v1/auth/biometric/verify` | Verify biometric | 30/min/user |
| POST | `/api/v1/auth/pin/verify` | Verify PIN (for driver, offline fallback) | 10/min/IP |
| GET | `/api/v1/admin/users` | List users | 60/min |
| POST | `/api/v1/admin/users` | Create user | 30/min |
| PUT | `/api/v1/admin/users/{id}` | Update user | 30/min |
| PATCH | `/api/v1/admin/users/{id}/deactivate` | Deactivate user | 10/min |
| PATCH | `/api/v1/admin/users/{id}/unlock` | Unlock locked account | 10/min |
| POST | `/api/v1/admin/users/{id}/store-assignments` | Assign user to store | 30/min |
| DELETE | `/api/v1/admin/users/{id}/store-assignments/{storeId}` | Remove store assignment | 30/min |
| GET | `/api/v1/admin/stores` | List stores | 60/min |
| POST | `/api/v1/admin/stores` | Create store | 10/min |
| PUT | `/api/v1/admin/stores/{id}` | Update store | 30/min |
| GET | `/api/v1/admin/configuration` | List system configs | 60/min |
| PUT | `/api/v1/admin/configuration/{key}` | Update config value | 10/min |
| POST | `/api/v1/admin/devices` | Register device | 10/min |
| DELETE | `/api/v1/admin/devices/{id}` | Deregister device | 10/min |
| GET | `/api/v1/admin/devices` | List registered devices | 60/min |

#### Procurement (M1–M3)

| Method | Endpoint | Purpose | Rate Limit |
|---|---|---|---|
| POST | `/api/v1/suppliers` | Register supplier | 30/min |
| GET | `/api/v1/suppliers` | List suppliers | 60/min |
| GET | `/api/v1/suppliers/{id}` | Get supplier + scorecard | 60/min |
| PATCH | `/api/v1/suppliers/{id}/approve` | Approve supplier | 30/min |
| PATCH | `/api/v1/suppliers/{id}/reject` | Reject supplier | 30/min |
| PATCH | `/api/v1/suppliers/{id}/suspend` | Suspend supplier | 10/min |
| PATCH | `/api/v1/suppliers/{id}/deactivate` | Deactivate supplier | 10/min |
| PATCH | `/api/v1/suppliers/{id}/reactivate` | Reactivate supplier | 10/min |
| GET | `/api/v1/suppliers/{id}/scorecard` | Scorecard history | 60/min |
| POST | `/api/v1/purchase-requisitions` | Create PR | 30/min |
| GET | `/api/v1/purchase-requisitions` | List PRs | 60/min |
| GET | `/api/v1/purchase-requisitions/{id}` | Get PR details | 60/min |
| PATCH | `/api/v1/purchase-requisitions/{id}/submit` | Submit PR | 30/min |
| PATCH | `/api/v1/purchase-requisitions/{id}/approve` | Approve PR | 30/min |
| PATCH | `/api/v1/purchase-requisitions/{id}/reject` | Reject PR | 30/min |
| POST | `/api/v1/purchase-orders` | Create PO | 30/min |
| GET | `/api/v1/purchase-orders` | List POs | 60/min |
| GET | `/api/v1/purchase-orders/{id}` | Get PO details | 60/min |
| PATCH | `/api/v1/purchase-orders/{id}/submit` | Submit PO | 30/min |
| PATCH | `/api/v1/purchase-orders/{id}/approve-manager` | Manager approval | 30/min |
| PATCH | `/api/v1/purchase-orders/{id}/reject-manager` | Manager rejection | 30/min |
| PATCH | `/api/v1/purchase-orders/{id}/approve-finance` | Finance approval | 30/min |
| PATCH | `/api/v1/purchase-orders/{id}/reject-finance` | Finance rejection | 30/min |
| POST | `/api/v1/purchase-orders/{id}/amendments` | Request amendment | 10/min |
| PATCH | `/api/v1/purchase-orders/{id}/amendments/{aId}/approve-manager` | Approve amendment (Mgr) | 10/min |
| PATCH | `/api/v1/purchase-orders/{id}/amendments/{aId}/approve-finance` | Approve amendment (Fin) | 10/min |

#### Quality, Weighbridge, GRN (M4–M6)

| Method | Endpoint | Purpose | Rate Limit |
|---|---|---|---|
| POST | `/api/v1/driver-visit-records` | Create DVR | 30/min |
| GET | `/api/v1/driver-visit-records` | List DVRs | 60/min |
| GET | `/api/v1/driver-visit-records/{id}` | Get DVR | 60/min |
| PATCH | `/api/v1/driver-visit-records/{id}/link-po` | Link DVR to PO | 30/min |
| POST | `/api/v1/quality-inspections` | Create inspection | 30/min |
| PATCH | `/api/v1/quality-inspections/{id}/submit-result` | Submit result | 30/min |
| GET | `/api/v1/quality-inspections/{id}` | Get inspection | 60/min |
| POST | `/api/v1/weighbridge-tickets` | Create WB session | 30/min |
| PATCH | `/api/v1/weighbridge-tickets/{id}/gross-weight` | Record gross weight | 30/min |
| PATCH | `/api/v1/weighbridge-tickets/{id}/tare-weight` | Record tare weight | 30/min |
| PATCH | `/api/v1/weighbridge-tickets/{id}/override` | Supervisor override | 10/min |
| PATCH | `/api/v1/weighbridge-tickets/{id}/reject` | Reject delivery | 10/min |
| GET | `/api/v1/weighbridge-tickets` | List tickets | 60/min |
| GET | `/api/v1/weighbridge-tickets/{id}` | Get ticket | 60/min |
| POST | `/api/v1/goods-received-notes` | Create GRN | 30/min |
| PATCH | `/api/v1/goods-received-notes/{id}/record-count` | Record bag count | 30/min |
| PATCH | `/api/v1/goods-received-notes/{id}/submit` | Submit GRN | 30/min |
| GET | `/api/v1/goods-received-notes` | List GRNs | 60/min |
| GET | `/api/v1/goods-received-notes/{id}` | Get GRN | 60/min |

#### Inventory (M7–M10)

| Method | Endpoint | Purpose | Rate Limit |
|---|---|---|---|
| GET | `/api/v1/lots` | List lots | 60/min |
| GET | `/api/v1/lots/{id}` | Get lot + items | 60/min |
| POST | `/api/v1/lots/{id}/generate-labels` | Generate QR labels | 10/min |
| PATCH | `/api/v1/items/{id}/scan-label` | Confirm label affixed | 120/min |
| GET | `/api/v1/items/{qrCode}` | Lookup by QR | 120/min |
| GET | `/api/v1/items/{id}` | Get item details | 120/min |
| GET | `/api/v1/items/{id}/lifecycle` | Item lifecycle history | 60/min |
| PATCH | `/api/v1/items/{id}/put-away` | Assign bin location | 120/min |
| GET | `/api/v1/storage-locations` | List locations | 60/min |
| POST | `/api/v1/storage-locations` | Create location | 10/min |
| PATCH | `/api/v1/storage-locations/{id}` | Update location | 30/min |
| GET | `/api/v1/storage-locations/{id}/contents` | Bin contents | 60/min |
| GET | `/api/v1/stores/{storeId}/warehouse-map` | Warehouse map | 60/min |
| POST | `/api/v1/internal-transfers` | Internal location move | 30/min |
| GET | `/api/v1/stock-ledger/{storeId}` | Current balance | 60/min |
| GET | `/api/v1/stock-ledger/{storeId}/entries` | Ledger entries | 60/min |
| GET | `/api/v1/stock-ledger/{storeId}/balance-history` | Balance history | 60/min |
| POST | `/api/v1/stock-counts` | Create count order | 30/min |
| GET | `/api/v1/stock-counts` | List count orders | 60/min |
| GET | `/api/v1/stock-counts/{id}` | Get count order | 60/min |
| PATCH | `/api/v1/stock-counts/{id}/submit-result` | Submit count | 30/min |
| POST | `/api/v1/stock-counts/{id}/recount` | Order recount | 10/min |
| PATCH | `/api/v1/stock-counts/{id}/approve-variance` | Approve variance | 10/min |
| PATCH | `/api/v1/stock-counts/{id}/reject-variance` | Reject variance | 10/min |

#### Distribution (M11–M13)

| Method | Endpoint | Purpose | Rate Limit |
|---|---|---|---|
| POST | `/api/v1/stock-transfer-orders` | Create STO | 30/min |
| GET | `/api/v1/stock-transfer-orders` | List STOs | 60/min |
| GET | `/api/v1/stock-transfer-orders/{id}` | Get STO + items | 60/min |
| PATCH | `/api/v1/stock-transfer-orders/{id}/submit` | Submit STO | 30/min |
| PATCH | `/api/v1/stock-transfer-orders/{id}/authorise` | Authorise STO | 10/min |
| PATCH | `/api/v1/stock-transfer-orders/{id}/reject` | Reject STO | 10/min |
| PATCH | `/api/v1/stock-transfer-orders/{id}/cancel` | Cancel STO | 10/min |
| POST | `/api/v1/transfer-dispatch` | Begin dispatch | 30/min |
| PATCH | `/api/v1/transfer-dispatch/{id}/scan-item` | Scan bag out | 120/min |
| PATCH | `/api/v1/transfer-dispatch/{id}/record-weight` | Record weight | 30/min |
| PATCH | `/api/v1/transfer-dispatch/{id}/approve-short` | Approve short shipment | 10/min |
| PATCH | `/api/v1/transfer-dispatch/{id}/complete` | Generate TDN | 10/min |
| GET | `/api/v1/transfer-dispatch/{id}` | Get dispatch session | 60/min |
| POST | `/api/v1/transfer-receipt` | Begin receipt | 30/min |
| PATCH | `/api/v1/transfer-receipt/{id}/scan-item` | Scan bag in | 120/min |
| PATCH | `/api/v1/transfer-receipt/{id}/report-damage` | Mark damage | 30/min |
| PATCH | `/api/v1/transfer-receipt/{id}/complete` | Generate GRD | 10/min |
| GET | `/api/v1/transfer-receipt/{id}` | Get receipt session | 60/min |
| GET | `/api/v1/transfer-receipt/{id}/shortage-report` | Get shortage report | 60/min |

#### Consumption (M14–M16)

| Method | Endpoint | Purpose | Rate Limit |
|---|---|---|---|
| POST | `/api/v1/consumption` | Create entry | 30/min |
| PATCH | `/api/v1/consumption/{id}/scan-item` | Scan bag | 120/min |
| PATCH | `/api/v1/consumption/{id}/submit` | Submit entry | 30/min |
| PATCH | `/api/v1/consumption/{id}/acknowledge-anomaly` | Supervisor ack | 10/min |
| GET | `/api/v1/consumption` | List records | 60/min |
| GET | `/api/v1/consumption/{id}` | Get details | 60/min |
| GET | `/api/v1/dosage-configurations` | List configs | 60/min |
| GET | `/api/v1/dosage-configurations/{storeId}` | Get store config | 60/min |
| POST | `/api/v1/dosage-configurations` | Create config | 10/min |
| PUT | `/api/v1/dosage-configurations/{id}` | Update config | 10/min |
| GET | `/api/v1/consumption-analytics/{storeId}` | Analytics dashboard | 60/min |
| GET | `/api/v1/consumption-analytics/{storeId}/trends` | Trend data | 60/min |
| GET | `/api/v1/consumption-analytics/{storeId}/operator-patterns` | Operator patterns | 60/min |
| POST | `/api/v1/write-offs` | Raise write-off | 30/min |
| GET | `/api/v1/write-offs` | List write-offs | 60/min |
| GET | `/api/v1/write-offs/{id}` | Get details | 60/min |
| PATCH | `/api/v1/write-offs/{id}/approve` | Approve write-off | 10/min |
| PATCH | `/api/v1/write-offs/{id}/reject` | Reject write-off | 10/min |
| GET | `/api/v1/write-offs/loss-summary` | Loss monitoring | 60/min |
| POST | `/api/v1/return-orders` | Create return order | 10/min |
| PATCH | `/api/v1/return-orders/{id}/ship` | Record return shipment | 10/min |
| PATCH | `/api/v1/return-orders/{id}/confirm-credit` | Confirm credit note | 10/min |

#### Sync, Alerts, Reports, Audit

See Sections 2.5 (Cross-Cutting), 6 (Offline Sync), and the Module Specifications for full details. Endpoints are consolidated in those sections.

### 5.4 Rate Limiting Strategy

| Endpoint Category | Limit | Window |
|---|---|---|
| Authentication (login) | 10 requests | per minute per IP |
| QR scan operations | 120 requests | per minute per user |
| Approval/rejection operations | 10 requests | per minute per user |
| Standard read operations | 60 requests | per minute per user |
| Standard write operations | 30 requests | per minute per user |
| Configuration changes | 10 requests | per minute per user |
| Report generation | 10 requests | per minute per user |

Rate limiting is implemented at the API Gateway (Traefik) level. Exceeded limits return HTTP 429 with `Retry-After` header.

---

## 6. Offline Sync Protocol

### 6.1 Strategy

All mobile operations (store keeping, weighbridge, consumption recording) must function fully without internet connectivity. The system uses a **local-first, sync-on-reconnect** architecture.

### 6.2 Operations Permitted Offline

| Operation | Offline? | Notes |
|---|---|---|
| Weighbridge Ticket Recording | Yes | Syncs when online; delivery held pending sync |
| QR Label Scanning (put-away) | Yes | Queued locally |
| Transfer Dispatch (scan-out) | Yes | TDN generated locally; syncs when online |
| Transfer Receipt (scan-in) | Yes | GRD generated locally; syncs when online |
| Consumption Recording | Yes | Queued; dosage validation runs on server sync |
| Physical Stock Count | Yes | Count results queued locally |
| DVR Creation | Yes | DVR queued; PO matching deferred |
| STO Approval | **No** | Requires real-time server confirmation (online-only) |
| Stock Balance (real-time) | **No** | Read from last-synced local cache (marked as "offline data") |
| Reports / Dashboard | **No** | Requires connectivity |

### 6.3 Sync Protocol (Push-Pull)

**On Reconnect:**

```
1. CONNECTIVITY CHECK
   Device detects network available → ping /api/v1/sync/health

2. PUSH — Upload Pending Operations
   POST /api/v1/sync/push
   Body: {
       deviceId: "device-123",
       deviceTimestamp: "2026-03-12T14:30:00Z",
       transactions: [
           {
               localId: "local-uuid-1",
               transactionType: "ConsumptionRecord",
               payloadJson: { ... full consumption entry ... },
               createdAt: "2026-03-12T10:00:00Z",
               retryCount: 0
           },
           ...
       ]
   }

   Server processes EACH operation:
   - Validates business rules (same as online path)
   - Applies to primary database
   - Returns per-operation result

   Response: {
       processedCount: 5,
       failedCount: 1,
       serverTimestamp: "2026-03-12T14:30:05Z",
       results: [
           { localId: "local-uuid-1", serverId: "server-uuid-1", status: "success" },
           { localId: "local-uuid-2", status: "failed",
             errorCode: "NEGATIVE_BALANCE",
             errorMessage: "Would result in negative balance at User Store A",
             isRetryable: false }
       ]
   }

3. HANDLE REJECTED OPERATIONS
   Non-retryable failures are returned to the operator with explanation.
   Operator must acknowledge the rejection and take corrective action.
   Physical reality cannot be rolled back — if bags were already consumed,
   the system records the consumption but flags it for investigation.

4. PULL — Download Server Updates (Delta Sync)
   GET /api/v1/sync/pull?lastSyncTimestamp={ts}&deviceId={id}&storeId={sid}

   Server returns ONLY changes since lastSyncTimestamp for the device's store:
   Response: {
       serverTimestamp: "2026-03-12T14:30:05Z",
       items: [ ... changed items ... ],
       lots: [ ... changed lots ... ],
       users: [ ... changed users ... ],
       storageLocations: [ ... changed locations ... ],
       dosageConfig: { ... if changed ... },
       inboundSTOs: [ ... new STOs for this store ... ],
       alerts: [ ... new alerts ... ],
       hasMoreData: false,
       continuationToken: null
   }

   If hasMoreData = true: client must call again with continuationToken

5. UPDATE LOCAL STATE
   - Apply server updates to local SQLite
   - Update lastSyncTimestamp
   - Clean up synced transactions from offline queue
   - Update sync status indicator in UI
```

### 6.4 Conflict Resolution

**Strategy:** Server timestamp wins for same-entity conflicts, with these rules:

| Conflict Type | Resolution |
|---|---|
| Same bag scanned by two offline devices | First-to-sync wins; second device gets rejection with explanation |
| Consumption submitted offline, bag already consumed on server | Rejection: "Bag already consumed" — operator must re-record with correct bags |
| STO items modified while offline dispatch in progress | Server state wins; offline dispatch rejected if items are no longer reserved |
| Balance goes negative after offline operations sync | Operations accepted but flagged; investigation triggered |
| Dosage config changed while offline consumption pending | Server config used for validation; offline entry re-validated |

**Post-Sync Rejection Handling:**
- Physical operations that have already occurred (bags consumed, bags moved) cannot be rolled back
- The system records the operation with a `SyncConflict` flag
- An investigation record is automatically created
- The store manager is alerted to reconcile the physical state with the system state

### 6.5 Data Partitioning per Device

Each device only syncs data relevant to its assigned store:

| Device Type | Data Cached Locally |
|---|---|
| Central Store Keeper | Items at Central Store, lots, locations, pending STOs (outbound) |
| Unit Store Keeper | Items at Unit Store, inbound/outbound STOs, lot data |
| User Store Keeper | Items at User Store, inbound STOs |
| Treatment Plant Operator | Items at User Store, dosage config, consumption history (last 30 days) |
| Weighbridge Operator | POs in `AwaitingDelivery`, DVR data, weighbridge ticket history (last 7 days) |

### 6.6 Offline Data Size Estimates

| Data Type | Estimated Size per Store | Refresh Frequency |
|---|---|---|
| Item records (500 bags) | ~500 KB | Delta on each sync |
| Lot records (20 lots) | ~50 KB | Delta on each sync |
| Storage locations (50 bins) | ~25 KB | Rarely changes |
| User records (5 users) | ~10 KB | Rarely changes |
| Dosage config | ~2 KB | Rarely changes |
| Pending operations queue | ~10 KB per pending op | Cleared after sync |
| **Total per device** | **~1–2 MB baseline** | — |

### 6.7 Sync API Endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/sync/health` | Check connectivity | Any authenticated |
| POST | `/api/v1/sync/push` | Push offline operations | Any authenticated |
| GET | `/api/v1/sync/pull` | Pull delta updates | Any authenticated |
| GET | `/api/v1/sync/status` | Get sync status for device | Any authenticated |
| POST | `/api/v1/sync/conflicts/{conflictId}/resolve` | Resolve sync conflict | `system:configure` |
| POST | `/api/v1/sync/force-full` | Force full re-sync for device | `system:configure` |

### 6.8 Incremental Delivery Plan

Sync is NOT deferred to Phase 4. Instead:

| Phase | Sync Capability |
|---|---|
| Phase 1 (Mo 1–3) | Sync framework skeleton, offline queue architecture, local SQLite schema |
| Phase 2 (Mo 4–6) | Sync for procurement + inventory modules (weighbridge, GRN, QR scanning) |
| Phase 3 (Mo 7–9) | Sync for distribution + consumption modules (dispatch, receipt, consumption) |
| Phase 4 (Mo 10–12) | Full sync stress testing, conflict resolution refinement, edge case handling |

---

## 7. Security Specification

### 7.1 Authentication

**JWT Configuration:**
- Signing algorithm: HMAC-SHA256
- Access token expiry: 8 hours (one working shift, configurable)
- Refresh token expiry: 7 days
- Refresh token rotation: old token revoked on refresh
- Clock skew tolerance: 1 minute
- Session binding: tokens bound to `device_id` — rejected if presented from unexpected device

**Account Lockout:**
- After 5 failed login attempts → account locked
- Lockout duration: indefinite (requires System Administrator to unlock)
- DoS prevention: lockout applies per-account, not per-IP (prevents legitimate IP-based lockout at shared locations)
- Admin unlock endpoint: `PATCH /api/v1/admin/users/{id}/unlock`

**Biometric Strategy:**
- **Device-local biometric** (`local_auth`): Used for convenience authentication — proves the user owns the phone but NOT that they're the specific KAMATS user
- **Server-side PIN**: Required for high-security operations (STO approval, TDN generation, GRD confirmation, consumption submission) — proves identity against server-stored credential
- **Combined approach**: Biometric unlocks the app; PIN confirms identity for critical operations
- Biometric enrollment: `POST /api/v1/auth/biometric/enroll` — stores template locally with server acknowledgment

### 7.2 CORS Policy

```
Allowed Origins:
  - https://dashboard.kamats.kanostate.gov.ng  (web dashboard)
  - https://admin.kamats.kanostate.gov.ng       (admin panel)

Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type, X-Device-Id, X-Request-Id
Credentials: true
Max Age: 86400 (24 hours)
```

Mobile apps communicate directly (no CORS required).

### 7.3 JSONB Schema Validation

All JSONB fields must conform to defined schemas. Validation is enforced at the application layer (FluentValidation):

| Table.Column | Expected Schema |
|---|---|
| `roles.permissions` | Array of permission strings from Section 3.8 |
| `quality_inspections.photo_urls` | Array of { url: string, caption: string, uploadedAt: datetime } |
| `write_off_requests.photo_urls` | Same as above |
| `stock_count_orders.frozen_balance` | Object: { lots: [{ lotId, qty, weight }] } |
| `stock_count_orders.location_ids` | Array of UUID strings |
| `alert_rules.threshold_value` | Object: { operator: "gt"\|"lt"\|"eq", value: number } |
| `alert_rules.notify_roles` | Array of role name strings |
| `alert_rules.channels` | Array of notification_channel enum values |
| `system_configurations.config_value` | Varies by key — schema per config key |

Unknown keys or malformed JSONB → HTTP 422.

### 7.4 Photo Upload Security

- **Max file size:** 5 MB per photo
- **Allowed types:** JPEG, PNG only (validated by magic bytes, not just extension)
- **Max photos per request:** 10
- **Storage:** Server-side file storage with UUID-based filenames (no user-controlled paths)
- **Virus scanning:** ClamAV scan on upload (reject if infected)
- **No direct URL access:** Photos served through authenticated API endpoint only
- **Metadata stripping:** EXIF data stripped on upload (privacy)

### 7.5 Device Registration Lifecycle

1. **Registration:** System Administrator registers device → `POST /api/v1/admin/devices` → device receives unique `device_id`
2. **Binding:** First login on device binds the JWT to that `device_id`
3. **Active use:** All subsequent requests must include matching `X-Device-Id` header
4. **Deregistration:** Admin deregisters device → `DELETE /api/v1/admin/devices/{id}` → all active sessions on that device are revoked immediately
5. **Replacement:** Lost/stolen device → deregister old → register new → user re-enrolls

### 7.6 Data Integrity Rules

- All weight calculations (net weight, variance %) are **server-computed** — clients submit raw values only
- Balance calculations are **server-computed** from the ledger — clients never submit balances
- Timestamps are **server-side authoritative** — client timestamps recorded for reference
- Consumption entries cannot be backdated beyond configurable window (default: 24 hours)
- QR codes encode a URL (not raw data) — URL resolution happens server-side

### 7.7 OWASP Top 10 Coverage

| Risk | Mitigation |
|---|---|
| A01: Broken Access Control | RBAC with per-endpoint permission checks; segregation of duties middleware |
| A02: Cryptographic Failures | SHA256 hash chain; HTTPS everywhere; passwords hashed with bcrypt |
| A03: Injection | Parameterised queries via EF Core; FluentValidation on all inputs |
| A04: Insecure Design | Segregation of duties; dual confirmation; audit trail |
| A05: Security Misconfiguration | Hardened Docker containers (non-root); no default credentials; Swagger disabled in production |
| A06: Vulnerable Components | Dependabot; regular dependency updates; CI vulnerability scanning |
| A07: Auth Failures | Account lockout; refresh token rotation; device binding |
| A08: Data Integrity Failures | Hash-chained audit log; server-computed calculations; immutable ledger |
| A09: Logging Failures | Serilog structured logging; Seq aggregation; 30-day Prometheus retention |
| A10: SSRF | No user-controlled URLs processed server-side; file uploads stored with UUID names |

---

## 8. Hardware Integration

### 8.1 Weighbridge Scale

**Communication Protocols (by vendor):**
- **RS-232 Serial:** Most common for industrial scales. USB-to-serial adapter for modern hardware
- **Modbus RTU/TCP:** For programmable industrial scales
- **TCP/IP direct:** Network-connected scales with built-in Ethernet

**Integration Specification:**
- Stable reading: weight variance < 0.01 kg over 3 consecutive readings
- Timeout: 30 seconds for auto-capture; prompt manual entry if exceeded
- Manual entry flag: permanently recorded in Weighbridge Ticket (`gross_manual` / `tare_manual`)
- Manual entry requires Supervisor PIN confirmation

**Flutter USB Serial Integration (Android):**
```
Package: usb_serial 0.5.x
Service: ScaleService → provides weightStream (Stream<WeightReadingEvent>)
Method: waitForStableWeight(timeoutSeconds: 30)
Returns: WeightReadingEvent { weightKg: double, isStable: bool }
```

**Server-Side Scale API (for network scales):**
- Endpoint per plant: `https://wb-{plant-code}.kamats.local/api`
- `GET /current-weight` returns: `{ weight: decimal, unit: "kg", stable: bool, vehiclePresent: bool }`
- API key authentication per plant

### 8.2 QR Label Printer

**Printer Requirements:**
- Thermal transfer or direct thermal label printer
- Minimum resolution: 300 DPI (for QR readability at 30cm scan distance)
- Interface: USB or network (Ethernet/WiFi)
- Print language: ZPL (Zebra), EPL, or TSPL

**Label Specification:**
- Size: 100mm × 50mm (standard logistics label)
- Content: QR code (large, centre), Item Code, Lot Number, Standard Weight, Receipt Date, PO Reference, KSWB logo
- QR format: URL encoding (`https://kamats.kanostate.gov.ng/item/{itemCode}`)
- Error correction: Level M (15% recovery)
- Labels generated as PDF batch (PdfSharp/MigraDoc): 3 columns × 10 rows per A4 page

**Adhesive Requirements:**
- Industrial-grade adhesive suitable for:
  - Rough woven polypropylene bags (standard Alum packaging)
  - Dusty/powdery environment
  - Warehouse temperature range (20–45°C)
- Recommended: Permanent acrylic adhesive, not removable

### 8.3 Mobile QR Scanner

**Package:** `mobile_scanner` 3.x (Flutter)
**Supported formats:** QR Code (primary), Code 128, Code 39 (fallback)
**Scan validation:** Item status check on every scan — rejected with reason if wrong status
**Batch scanning mode:** Camera stays open; items scanned in quick succession without re-opening

### 8.4 Hardware Requirements Summary

| Hardware | Quantity | Location | Priority |
|---|---|---|---|
| Weighbridge scale (+ USB serial adapter) | 1 | Central Store gate | Phase 2 |
| Thermal label printer | 1+ | Central Store | Phase 2 |
| Android tablets (store keepers) | 1 per store | All stores | Phase 2–3 |
| Android phones (operators) | 1 per plant operator | Treatment plants | Phase 3 |
| UPS (battery backup) | 1 per device location | All stores | Phase 2–3 |
| Spare equipment (scale, printer) | 1 set | Central Store | Phase 3 |

> **NOTE:** Specific vendor models for weighbridge scale and label printer must be selected during Phase 1 hardware evaluation. Prototype integration testing required before procurement.

---

## 9. Revised Phase Plan

### Phase 1: Foundation + Hardware Selection + Sync Framework (Months 1–3)

| Week | Milestone | Deliverables |
|---|---|---|
| 1–2 | Project Setup | Repository, CI/CD, dev environment, coding standards, database schema finalised |
| 3–4 | Core Domain | All entities, enums, value objects, domain events coded |
| 5–6 | Authentication | JWT, biometric enrollment, RBAC — all 19 roles configured, segregation of duties middleware |
| 7–8 | Store & Location Setup | Store hierarchy (with `parent_store_id`), location management, `system_configurations`, `reorder_point_configs` |
| 9–10 | Basic API + Sync Skeleton | CRUD for core entities, validation, error handling; offline queue architecture, local SQLite schema, sync push/pull skeleton |
| 11–12 | Mobile Shell + Hardware Eval | App skeleton, local SQLite, navigation; weighbridge scale + label printer vendor selection and prototype testing |

**Key Outputs:** Working API with authentication; three-tier store hierarchy; mobile app foundation with offline-first skeleton; CI/CD pipeline; hardware vendors selected.

### Phase 2: Procurement & Inventory + Sync (Months 4–6)

| Week | Milestone | Deliverables |
|---|---|---|
| 13–14 | Supplier Management | Module 1 complete — registration, approval, scorecard |
| 15–16 | Procurement Workflow | Modules 2 & 3 — PR, PO, two-stage approval, PO amendment cycle |
| 17–18 | Gate + Quality + Weighbridge | Modules 4 & 5 — DVR, pre-weighbridge sampling, weighbridge (Gross→Tare), scale integration |
| 19–20 | GRN & Lot Registration | Modules 6 & 7 — GRN workflow, Lot creation, QR generation, label printing, scan-in |
| 21–22 | Warehouse & Ledger | Modules 8 & 9 — bin locations, put-away, stock ledger engine (with concurrency), reorder point triggers |
| 23–24 | Sync for Phase 2 Modules | Offline weighbridge, QR scanning, GRN; sync testing for procurement + inventory |

**Key Outputs:** Full procurement lifecycle from PR to stock-on-shelf; QR label system operational; stock ledger live; weighbridge integration working; sync for procurement modules tested.

### Phase 3: Distribution & Consumption + Sync (Months 7–9)

| Week | Milestone | Deliverables |
|---|---|---|
| 25–26 | Stock Transfer Orders | Module 11 — STO creation, FIFO pre-selection, approval workflow |
| 27–28 | Transfer Dispatch | Module 12 — scan-out, TDN generation, custody handover, dual authentication |
| 29–30 | Transfer Receipt | Module 13 — scan-in, GRD, shortage/excess handling, transit monitoring |
| 31–32 | Consumption Recording | Module 14 — treatment session workflow, QR scan, partial bags |
| 33–34 | Dosage Validation & Analytics | Module 15 — dynamic thresholds, seasonal factors, trend analytics, anomaly alerts |
| 35–36 | Physical Count + Write-Offs + Sync | Modules 10 & 16 — count orders, reconciliation, write-off workflow; sync for all Phase 3 modules |

**Key Outputs:** Full distribution chain operational; consumption recording active; dynamic dosage validation live; complete lifecycle closure working; sync for distribution + consumption tested.

### Phase 4: Alerts, Dashboard, Full Sync Testing (Months 10–12)

| Week | Milestone | Deliverables |
|---|---|---|
| 37–38 | Alert System | All module alerts, SMS/email notifications (Africa's Talking integration), alert rules configuration, escalation chains |
| 39–40 | Full Sync Stress Testing | Offline conflict scenarios, multi-device sync, rejected-after-sync handling, edge cases |
| 41–42 | Reporting Engine | All 12 standard reports, export functions, investigation records |
| 43–44 | Executive Dashboard | Real-time dashboard, KPI widgets, SignalR live updates |
| 45–48 | Integration Testing | End-to-end testing, segregation of duties verification, performance benchmarks, security testing |

**Key Outputs:** Complete alert and escalation system; all reports operational; executive dashboard live; sync fully tested; security audit complete.

### Phase 5: Pilot (Months 13–15)

| Week | Milestone | Deliverables |
|---|---|---|
| 49–52 | Pilot Deployment | Central Store + 1 Unit Store + 1 User Store deployed |
| 53–56 | UAT | User acceptance testing with actual store keepers and operators |
| 57–60 | Refinement | Bug fixes, UX improvements, performance tuning based on feedback |

**Key Outputs:** One full supply chain path (Central → Unit → Plant) fully operational and validated by real users. Parallel paper process maintained.

### Phase 6: Full Rollout (Months 16–21)

| Week | Milestone | Deliverables |
|---|---|---|
| 61–68 | All Unit Stores | Deployment and training for all Unit Stores |
| 69–76 | All User Stores | Deployment and training for all Treatment Plants |
| 77–84 | Completion | Full documentation, knowledge transfer, support team handover |

**Key Outputs:** All stores and plants operational; complete documentation; staff fully trained; HUBUK support team ready for handover.

**Total Project Duration:** 21 months

### Team Structure

| Role | Count | Key Responsibilities |
|---|---|---|
| Project Manager | 1 | Delivery, stakeholder management, risk mitigation |
| Technical Lead | 1 | Architecture, code reviews, technical decisions |
| Senior Backend Developer | 2 | ASP.NET Core API, database, business logic |
| Backend Developer | 1 | API features, hardware service integration |
| Senior Mobile Developer | 1 | Flutter, offline sync, USB scale, BLoC |
| Mobile Developer | 1 | Mobile features, QR scanning, UI |
| Senior Frontend Developer | 1 | React dashboard, SignalR |
| Frontend Developer | 1 | Dashboard features, report visualisations |
| DevOps Engineer | 1 | Infrastructure, CI/CD, Docker, monitoring |
| QA Lead | 1 | Test strategy, automation, security testing |
| QA Engineer | 1 | Manual and automated testing |
| UI/UX Designer | 1 | Mobile and web UX |
| Technical Writer | 1 | API docs, user guides, training materials |
| Business Analyst | 1 | Requirements, stakeholder liaison, UAT |
| Hardware Technician | 2 | Scale, weighbridge, label printer installation |
| Network Engineer | 1 | Connectivity, VPN |
| Training Specialist | 1 | Role-specific training, change management |
| Support Engineer | 2 | Post-deployment support, helpdesk |

**Total:** 21 members (15 core + 6 support)

---

## 10. Verification & Testing Strategy

### 10.1 Module-Level Acceptance Criteria

Each module must pass these categories before sign-off:

| Category | Criteria |
|---|---|
| Functional | All process steps from Section 2 execute correctly |
| Segregation | All duty separation rules from Section 3.6 are enforced (tested with violation attempts) |
| Business Rules | All constraints listed per module are enforced |
| Error Paths | All error paths listed per module return correct HTTP codes and messages |
| Audit | Every state change creates an audit event in the hash chain |
| Offline | Modules marked as offline-capable function correctly without connectivity |
| Performance | QR scan operations < 500ms; ledger operations < 1s; report generation < 10s |

### 10.2 Edge Case Test Scenarios

These scenarios test the specific gaps identified in the v2.0 review:

| # | Scenario | Expected Behaviour |
|---|---|---|
| 1 | Truck arrives with no matching PO | DVR created, truck BLOCKED at gate, Procurement Officer notified |
| 2 | Quality sampling FAIL | Truck turned away, goods never enter facility, PO stays AwaitingDelivery |
| 3 | Weighbridge variance > 2% | Ticket blocked, Supervisor required for override or rejection |
| 4 | Manual weight entry without Supervisor PIN | Blocked — manual entry requires Supervisor confirmation |
| 5 | Same user creates and approves a PO | HTTP 403 — segregation of duties violation |
| 6 | Same user performs initial count and recount | HTTP 403 — different counter required |
| 7 | Bag scanned that's not on STO list | Scan REJECTED with alert, bag not loaded |
| 8 | Transit overdue by 2+ hours | Automated alert to both source and destination Store Managers |
| 9 | Consumption entry > 130% expected | Entry blocked until Supervisor acknowledges with investigation |
| 10 | Negative balance attempt | Transaction BLOCKED, HTTP 422, alert raised |
| 11 | Concurrent ledger writes to same store/lot | Serializable isolation handles correctly; retry on conflict |
| 12 | Offline consumption → bag already consumed on server | Sync rejection with explanation; investigation record created |
| 13 | Dosage validation with wet season multiplier | Adjusted threshold correctly applied to expected calculation |
| 14 | Write-off > 20 bags without investigation report | HTTP 422 — investigation report required |
| 15 | Photo upload > 5 MB | HTTP 413 — file too large |
| 16 | Audit event UPDATE attempt | PostgreSQL TRIGGER raises exception (not silent drop) |
| 17 | PO amendment after issue | Amendment cycle with two-stage re-approval |
| 18 | Supplier with pending deliveries suspended | Allowed, but all pending POs flagged with alert |
| 19 | Excess bags at transfer receipt | BLOCKED — cannot receive bags not on TDN |
| 20 | Device not registered attempting API call | HTTP 403 — unregistered device |

### 10.3 Integration Test Requirements

| Test Suite | Coverage |
|---|---|
| Procurement E2E | PR → PO → DVR → Quality → Weighbridge → GRN → Lot → QR → Put-Away |
| Distribution E2E | STO → Dispatch → Transit → Receipt → Ledger both ends |
| Consumption E2E | Consumption → Dosage Validation → Anomaly → Supervisor Ack |
| Loss E2E | Damage → Write-Off → Approval → Ledger Adjustment → Cumulative Monitoring |
| Sync E2E | Offline operations → Reconnect → Push → Conflict → Resolution |
| Audit Chain | 1000 events → Verify chain integrity → Attempt modification → Detect |
| Concurrency | 10 concurrent ledger writes → No negative balance → No lost updates |
| RBAC | All 19 actors → Verify access to correct modules only |
| Segregation | All critical pairs → Verify both same-user and different-user paths |

### 10.4 Performance Benchmarks

| Operation | Target | Measurement |
|---|---|---|
| QR scan lookup | < 200ms | API response time (95th percentile) |
| QR scan in batch mode | < 500ms per scan | Consecutive scan throughput |
| Ledger entry creation | < 1s | Including balance update with locking |
| Stock balance query | < 500ms | Per-store balance with lot breakdown |
| Report generation | < 10s | Most complex report (Lot Lifecycle) |
| Sync push (100 operations) | < 30s | Full push cycle |
| Sync pull (500 item delta) | < 15s | Full pull cycle |
| Dashboard load | < 3s | All KPI widgets loaded |
| Concurrent users (per store) | 5 simultaneous | No degradation |
| Concurrent users (system-wide) | 50 simultaneous | No degradation |

### 10.5 Security Testing

| Test | Method |
|---|---|
| Penetration testing | External pen test before go-live (Phase 4) |
| SQL injection | Automated scanner (SQLMap) against all endpoints |
| XSS | Input fuzzing on all text fields |
| Authentication bypass | Token manipulation, expired tokens, device spoofing |
| Authorization bypass | Attempt to access endpoints without required permissions |
| Rate limiting | Verify all endpoint categories enforce configured limits |
| Audit integrity | Attempt to modify audit events at database level |
| File upload | Oversized files, wrong types, executable uploads, path traversal |

### 10.6 Offline Sync Test Scenarios

| # | Scenario | Expected Behaviour |
|---|---|---|
| 1 | Single device offline for 24 hours with 50 operations | All operations sync successfully on reconnect |
| 2 | Two devices offline, both scan same bag | First-to-sync wins; second gets clear rejection |
| 3 | Offline consumption with changed dosage config | Server config used for validation; entry re-validated |
| 4 | Network drops mid-sync | Sync resumes from last successful operation on reconnect |
| 5 | Device storage full | Graceful error; user alerted to sync before continuing |
| 6 | 30 days offline (max) | All data within retention; sync succeeds |
| 7 | Offline dispatch + offline receipt at different stores | Both sync independently; system reconciles STO status |

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| Alum | Aluminium Sulphate — chemical used in water treatment for coagulation |
| CAC | Corporate Affairs Commission (Nigerian company registration body) |
| COA | Certificate of Analysis (supplier's quality certificate) |
| DVR | Driver Visit Record — created at gate for every delivery attempt |
| FIFO | First In, First Out — oldest stock consumed/distributed first |
| GRD | Goods Receipt at Destination — confirms transfer arrival |
| GRN | Goods Received Note — confirms physical receipt at Central Store |
| INS | Inspection Record — quality sampling result |
| KSWB | Kano State Water Board |
| Lot | A group of bags from a single delivery, sharing the same GRN |
| PO | Purchase Order — formal order to supplier |
| PR | Purchase Requisition — internal demand signal |
| ROP | Reorder Point — stock level that triggers replenishment |
| STO | Stock Transfer Order — authorizes inter-store movement |
| TDN | Transfer Dispatch Note — documents what left the source store |
| WT | Weighbridge Ticket — weight verification record |
| WO | Write-Off — formal loss/damage/return record |

---

*End of KAMATS Unified Specification v3.0*
*Document Reference: HUBUK/KN-WTP/2026/SPEC-003*
*Prepared by: HUBUK Technology Limited*
*March 2026*
