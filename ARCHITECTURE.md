# Architecture Documentation

# AI Procurement Bid Compliance Platform

## Overview

The AI Procurement Bid Compliance Platform is built to automate and manage the tender evaluation process using AI-driven requirement extraction and bidder evidence verification.

## Technology Stack

- **Frontend**: Next.js (App Router), React, Vanilla CSS
- **Language**: TypeScript
- **Backend/Database**: Supabase, PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## System Conventions

### Database Naming Conventions

- Tables: `snake_case`, plural (e.g., `tender_documents`)
- Columns: `snake_case`
- Primary Keys: UUID named `id`
- Foreign Keys: `table_name_id`
- Timestamps: `created_at`, `updated_at`

### API Conventions

- Standard Next.js Route Handlers (`app/api/...`)
- Responses format:
  - Success: `{ data: { ... } }`
  - Error: `{ error: { message: "...", code: "..." } }`

### Error Handling Conventions

- Always return standard error objects.
- Log server-side errors before responding.
- Client-side handles errors via Toast notifications and structured Error boundaries.

### AI-Output Validation Rules

- All AI responses must be structured as JSON.
- Validate using Zod schemas before interacting with the database.
- Keep original AI extracted results immutable. Officer decisions must be stored separately from AI findings.
