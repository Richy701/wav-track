# Supabase Database Changes

This directory contains migration files to fix database structure issues and add missing relationships.

## How to Apply Changes

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in the following order:
   - `20240403000000_fix_database_structure.sql`
   - `20240403000001_insert_test_data.sql`
   - `20240403000002_fix_session_goals_relationship.sql`

## Migration Files

### 1. Fix Database Structure (`20240403000000_fix_database_structure.sql`)

This migration:
- Adds the missing date column to category_progress
- Rebuilds the user_preferences, user_metrics, and category_progress tables with the correct structure
- Enables Row Level Security (RLS) on these tables
- Creates RLS policies to allow users to access their own data

### 2. Insert Test Data (`20240403000001_insert_test_data.sql`)

This migration inserts test data into the tables. **Important**: Replace the UUID with a valid auth user ID from your Supabase dashboard.

### 3. Fix Session Goals Relationship (`20240403000002_fix_session_goals_relationship.sql`)

This migration adds a foreign key constraint between the sessions and session_goals tables, allowing the frontend to use the join syntax in queries.

## Troubleshooting

If you encounter any issues after applying these changes:

1. Check the Supabase logs for error messages
2. Verify that the tables were created correctly by inspecting them in the Supabase dashboard
3. Ensure that the RLS policies are working by testing queries with different user accounts 