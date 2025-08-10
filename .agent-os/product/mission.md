# Product Mission

## Pitch

Noka is a comprehensive personal and family finance tracker that helps individuals and families gain control over their finances by providing intelligent budgeting, investment tracking, and collaborative financial management in one unified platform.

## Users

### Primary Customers

- **Individual Users**: People seeking better control over personal finances through budgeting and investment tracking
- **Families**: Households wanting to collaborate on financial goals, manage joint accounts, and track shared expenses

### User Personas

**Personal Finance Manager** (25-45 years old)
- **Role:** Working professional or entrepreneur
- **Context:** Managing personal income, expenses, and investments
- **Pain Points:** Lack of unified view of finances, difficulty tracking budgets, poor investment progress visibility
- **Goals:** Better financial control, automated tracking, clear progress visualization

**Family Financial Administrator** (30-50 years old)
- **Role:** Primary household financial manager
- **Context:** Managing both personal and family finances, coordinating with spouse/family members
- **Pain Points:** Difficulty coordinating family finances, no visibility into member contributions, separate tracking systems
- **Goals:** Unified family financial view, member contribution tracking, collaborative budgeting

## The Problem

### Fragmented Financial Management

Most people use multiple apps and spreadsheets to track different aspects of their finances, creating a fragmented view that makes it hard to understand their complete financial picture. This leads to poor financial decisions and missed opportunities for savings.

**Our Solution:** Unified platform combining personal budgeting, investment tracking, and account management.

### Limited Family Financial Collaboration

Families struggle to coordinate finances across multiple members, often using separate apps or manual methods that don't provide visibility into individual contributions or shared progress toward financial goals.

**Our Solution:** Built-in family sharing with role-based permissions, member contribution tracking, and joint account management.

### Lack of Actionable Financial Insights

Traditional financial apps show historical data but don't provide clear, actionable insights about budget progress, investment performance, or spending patterns that help users make better financial decisions.

**Our Solution:** Smart progress tracking with visual indicators, member breakdowns, and budget/investment goal monitoring.

## Differentiators

### Unified Personal + Family Financial Management

Unlike other personal finance apps that focus on individual users, Noka seamlessly integrates personal and family financial management without requiring context switching. This provides a complete financial picture for users who need both individual control and family collaboration.

### Intelligent Member Contribution Tracking

We provide detailed breakdowns of individual member contributions to shared family budgets and investments, giving transparency that other family finance tools lack. This creates accountability and helps families understand spending patterns.

### Code-First Development with Security Focus

Built with enterprise-grade security features including CSRF protection, input sanitization, and comprehensive Row Level Security policies, ensuring financial data remains secure while maintaining rapid development velocity.

## Key Features

### Core Features

- **Account Management:** Support for bank accounts, credit cards, and investment accounts with automated balance tracking
- **Transaction Management:** Full CRUD operations with transfer support and balance ledger maintenance
- **Category System:** Flexible income, expense, and investment categories with budgeting capabilities
- **Dashboard Analytics:** Financial summary with budget progress and investment performance tracking

### Authentication Features

- **Multi-Provider Auth:** Email/password and Google SSO via Supabase Auth
- **Secure Sessions:** Enterprise-grade session management with proper token handling
- **Onboarding Flow:** Guided setup for accounts, categories, and user preferences

### Family Collaboration Features

- **Family Management:** Create families, invite members with role-based permissions (Admin/Member)
- **Joint Accounts:** Shared bank accounts, credit cards, and investment accounts visible to all family members
- **Shared Categories:** Family-wide budgets and investment targets with member contribution tracking
- **Attribution Tracking:** All transactions show who logged them for transparency and accountability

### Security Features

- **Data Isolation:** Strict separation between personal and family data with comprehensive RLS policies
- **Input Validation:** Multi-layer validation using Zod schemas and server-side sanitization
- **CSRF Protection:** Built-in protection against cross-site request forgery attacks