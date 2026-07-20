# Design Document: Payment Integration

## Overview

This design implements a comprehensive payment processing system for Examerit, an exam preparation platform. The system supports multiple payment gateways (Razorpay, Stripe, UPI, and wallet payments), subscription management for tiered plans (Free, Basic, Premium, Elite), one-time payments for mentorship sessions and premium tests, payment history tracking, invoice generation, and webhook handling for asynchronous payment status updates. The architecture follows a modular approach with clear separation between payment gateway adapters, business logic, and data persistence layers, ensuring scalability, security, and maintainability. The implementation prioritizes PCI DSS compliance, idempotent operations, secure webhook verification, and comprehensive audit logging for all payment transactions.

## Architecture

### System Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        A[React Frontend]
        B[Payment UI Components]
    end
    
    subgraph "API Gateway Layer"
        C[Express API Server]
        D[Payment Routes]
        E[Webhook Handler]
    end
    
    subgraph "Business Logic Layer"
        F[Payment Service]
        G[Subscription Service]
        H[Invoice Service]
        I[Webhook Processor]
    end
    
    subgraph "Payment Gateway Adapters"
        J[Razorpay Adapter]
        K[Stripe Adapter]
        L[UPI Gateway Adapter]
        M[Wallet Gateway Adapter]
    end
    
    subgraph "Data Layer"
        N[(PostgreSQL)]
        O[Payment Transactions]
        P[Subscriptions]
        Q[Invoices]
        R[Webhook Events]
    end
    
    subgraph "External Services"
        S[Razorpay API]
        T[Stripe API]
        U[UPI Gateway]
        V[Wallet APIs]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    D --> F
    D --> G
    D --> H
    E --> I
    F --> J
    F --> K
    F --> L
    F --> M
    G --> N
    H --> N
    I --> N
    J --> S
    K --> T
    L --> U
    M --> V
    F --> N
```

### Payment Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant PS as Payment Service
    participant PG as Payment Gateway
    participant DB as Database
    participant WH as Webhook Handler
    
    U->>FE: Select Plan/Item
    FE->>API: POST /api/payments/create-order
    API->>PS: createPaymentOrder()
    PS->>DB: Store pending transaction
    PS->>PG: Create payment order
    PG-->>PS: Order ID + Payment details
    PS-->>API: Return order details
    API-->>FE: Order details
    FE->>FE: Open payment gateway UI
    U->>PG: Complete payment
    PG->>WH: Send webhook (async)
    WH->>WH: Verify signature
    WH->>DB: Update transaction status
    WH->>PS: Process payment success
    PS->>DB: Update subscription/access
    PS->>API: Trigger notification
    PG-->>FE: Payment success callback
    FE->>API: GET /api/payments/verify/{orderId}
    API->>DB: Check transaction status
    DB-->>API: Transaction details
    API-->>FE: Confirmation
    FE->>U: Show success message
```

### Subscription Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant SS as Subscription Service
    participant DB as Database
    participant PG as Payment Gateway
    
    U->>FE: Upgrade/Downgrade Plan
    FE->>API: POST /api/subscriptions/change
    API->>SS: changeSubscription()
    SS->>DB: Get current subscription
    SS->>SS: Calculate prorated amount
    SS->>PG: Process payment/refund
    PG-->>SS: Confirmation
    SS->>DB: Update subscription
    SS->>DB: Log transaction
    SS-->>API: Success response
    API-->>FE: Confirmation
    FE->>U: Show updated plan
```

## Components and Interfaces

### Component 1: Payment Gateway Adapter (Abstract)