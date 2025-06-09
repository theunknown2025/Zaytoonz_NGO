# Zaytoonz NGO Platform

This is a web application for connecting NGOs and individuals (Seekers).

## Features

- User authentication (sign up and sign in)
- Support for two user types: Personne (Individual) and NGO
- Elegant UI with responsive design
- Success notifications using toast messages

## Authentication System

The application uses Supabase as a backend database for authentication. The user data is stored in three tables:
- `users`: Stores basic user information
- `ngo_details`: Stores NGO-specific information
- `personne_details`: Stores individual-specific information

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set up Supabase

1. Create a Supabase account at [https://supabase.io](https://supabase.io)
2. Create a new project
3. Run the SQL script in `supabase-schema.sql` in the SQL editor to create the tables
4. Update the `supabaseUrl` and `supabaseAnonKey` in `app/lib/supabase.ts` with your project credentials

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Supabase](https://supabase.io) - Database and authentication
- [React Hot Toast](https://react-hot-toast.com/) - Toast notifications 

# Opportunity Process Management

This feature allows NGOs to select and apply process templates to their opportunities, providing structured workflows with multiple stages.

## Database Setup

Before using this feature, you need to set up the required database tables in your Supabase project:

1. Create the process templates and steps tables:
   - `process_templates` - Stores the main process definitions
   - `process_steps` - Stores the steps for each process template

2. Create the opportunity process tables:
   - `opportunity_processes` - Links opportunities to process templates
   - `opportunity_process_steps` - Tracks the status of each step for an opportunity

You can use the SQL file in `sql/opportunity_process_tables.sql` to create these tables.

## Feature Components

### Process Selection Component

The `OpportunityProcess` component in `app/ngo/opportunities/new/OpportunityProcess.tsx` allows users to:

- Select a process template from available templates
- Preview the process with its steps in a timeline view
- Save the selected process to the opportunity

### Process Management Service

The service files provide functions for managing processes:

- `processService.ts` - Handles process templates and steps
- `opportunityProcessService.ts` - Handles the association between opportunities and processes

## Usage

1. Import the `OpportunityProcess` component in your opportunity creation/edit flow
2. Pass the required props including the opportunity ID
3. Use the save functionality to associate a process with an opportunity

Example:

```tsx
<OpportunityProcess
  selectedProcess={selectedProcess}
  customStages={customStages}
  opportunityId={opportunityId}
  onProcessSelect={handleProcessSelect}
  onStageAdd={handleStageAdd}
  onStageRemove={handleStageRemove}
  onStageChange={handleStageChange}
  onPrevious={handlePrevious}
  onNext={handleNext}
/>
```

## Process Tracking

Once a process is associated with an opportunity, you can track the progress of each step and update their status using the provided service functions:

- `getOpportunityProcess` - Get the process and steps for an opportunity
- `updateOpportunityProcessStep` - Update the status of a step

## Row Level Security

For production use, you should enable Row Level Security (RLS) on the tables to control access based on user permissions. Example policies are provided in the SQL file as comments. 