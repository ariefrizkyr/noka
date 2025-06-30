# Noka Database Seeding and Migration Guide

This directory contains comprehensive database seeding scripts and migration utilities for the Noka Financial Tracker application.

## Directory Structure

```
supabase/
├── config.toml              # Updated with multiple seed file paths
├── seed.sql                 # Main comprehensive seed file
├── seeds/                   # Specialized seed files
│   ├── categories.sql       # Detailed category definitions
│   ├── sample-accounts.sql  # Various account scenarios
│   └── test-transactions.sql # Realistic transaction patterns
├── scripts/                 # Migration and validation utilities
│   ├── deploy.sql          # Production deployment script
│   ├── rollback.sql        # Migration rollback procedures
│   ├── verify-migration.sql # Post-migration validation
│   ├── validate-schema.sql  # Comprehensive schema validation
│   └── test-functions.sql   # Database function testing
└── migrations/              # Database migration files
    └── [timestamp]_*.sql    # Individual migration files
```

## Quick Start

### 1. Reset Database with Seed Data
```bash
# Apply all migrations and simple seed data (recommended)
supabase db reset

# Apply migrations only (skip seeding)
supabase db reset --no-seed
```

**Note**: The default configuration uses `seed-simple.sql` which creates reference data that works with Row Level Security (RLS). This data won't be visible in the application until you create users and their associated data through the UI.

### 2. Deploy to Production
```bash
# Deploy all migrations to linked project
supabase db push

# Deploy with seed data (careful in production!)
supabase db push --include-seed
```

### 3. Validate Database State
```bash
# Connect to your database and run validation
psql -f supabase/scripts/validate-schema.sql

# Test database functions
psql -f supabase/scripts/test-functions.sql
```

## Seed Files Overview

### Simple Seed File (`seed-simple.sql`) - **DEFAULT**
- **Purpose**: Basic reference data that works with Row Level Security
- **Contains**: 
  - 42 essential categories with realistic budgets and emoji icons
  - 11 sample account templates for different account types
  - Reference data for development without RLS conflicts
- **Usage**: Perfect for initial development and as templates for real data

### Main Seed File (`seed.sql`) - **ADVANCED**
- **Purpose**: Comprehensive sample data for testing (requires user context)
- **Contains**: 
  - Complete financial scenarios with transactions
  - 6 months of realistic transaction patterns
  - Complex testing scenarios for dashboard functions
- **Usage**: For advanced testing when you need full transaction data

### Specialized Seed Files

#### `seeds/categories.sql`
- **Purpose**: Comprehensive category definitions with icons and budget templates
- **Contains**:
  - 34+ income categories (salary, freelance, investments, etc.)
  - 60+ expense categories (housing, food, transportation, etc.)
  - 25+ investment categories (stocks, bonds, crypto, retirement)
  - Realistic budget amounts based on income percentages
  - Emoji icons for visual identification

#### `seeds/sample-accounts.sql`
- **Purpose**: Various account scenarios for testing different financial situations
- **Contains**:
  - Young professional accounts (starting career)
  - Family accounts (children, education savings)
  - Pre-retirement accounts (high savings phase)
  - Small business owner accounts
  - Credit card scenarios (various balance situations)
  - Investment portfolio examples

#### `seeds/test-transactions.sql`
- **Purpose**: Realistic transaction patterns for comprehensive testing
- **Contains**:
  - 6 months of recurring income (salary, freelance, investments)
  - Weekly grocery shopping patterns
  - Monthly utility and subscription payments
  - Credit card purchase scenarios
  - Transfer patterns (savings, payments, investments)
  - Large irregular transactions (vacation, car maintenance)
  - Refunds and returns (negative amounts)

## Migration Scripts

### `scripts/deploy.sql`
Production deployment script that:
- Verifies database state and migration requirements
- Lists all migrations to be applied
- Provides deployment checklist
- Validates critical components after deployment

### `scripts/rollback.sql`
**⚠️ USE WITH CAUTION** - Rollback script that:
- Safely removes all database objects in reverse dependency order
- Includes safety checks to prevent accidental execution
- Preserves migration history for reapplication
- Suitable for development environments only

### `scripts/verify-migration.sql`
Post-migration validation that:
- Verifies all migrations have been applied correctly
- Checks for any missing or failed migrations
- Provides detailed status report
- Safe to run in any environment

## Validation Scripts

### `scripts/validate-schema.sql`
Comprehensive schema validation that checks:
- All required tables exist with correct structure
- All enums are defined with proper values
- All functions and triggers are installed
- Row Level Security is properly configured
- Indexes are created for performance
- Foreign key constraints are in place
- Data types and precision are correct

### `scripts/test-functions.sql`
Database function testing that validates:
- All dashboard functions exist and are callable
- Balance calculation function works correctly
- Trigger functions are properly installed
- Functions execute within acceptable time limits
- Functions work with both empty and populated data

## Usage Examples

### Development Workflow
```bash
# 1. Start fresh development database
supabase db reset

# 2. Verify everything is working
psql -f supabase/scripts/validate-schema.sql
psql -f supabase/scripts/test-functions.sql

# 3. Test your application with realistic data
npm run dev
```

### Production Deployment
```bash
# 1. Backup existing database
pg_dump $DATABASE_URL > backup.sql

# 2. Run deployment script for verification
psql -f supabase/scripts/deploy.sql

# 3. Apply migrations
supabase db push --linked

# 4. Validate deployment
psql -f supabase/scripts/verify-migration.sql
psql -f supabase/scripts/validate-schema.sql
```

### Switching Between Seed Files

To use different seed configurations, edit `supabase/config.toml`:

```toml
# Option 1: Simple seed (default, RLS-compatible)
sql_paths = ["./seed-simple.sql"]

# Option 2: Comprehensive seed (requires user context)
sql_paths = ["./seed.sql"]

# Option 3: Multiple specialized files
sql_paths = [
  "./seeds/categories.sql",
  "./seeds/sample-accounts.sql", 
  "./seeds/test-transactions.sql"
]

# Option 4: No seeding
sql_paths = []
```

### Manual Testing Scenarios
```bash
# Test with just categories
supabase db reset --no-seed
psql -f supabase/seeds/categories.sql

# Test with specific account scenarios  
psql -f supabase/seeds/sample-accounts.sql

# Test with transaction patterns
psql -f supabase/seeds/test-transactions.sql
```

## Configuration

The `config.toml` file has been updated to support multiple seed files:

```toml
[db.seed]
enabled = true
sql_paths = [
  "./seed.sql",                    # Main comprehensive seed file
  "./seeds/categories.sql",        # Detailed category definitions
  "./seeds/sample-accounts.sql",   # Various account scenarios
  "./seeds/test-transactions.sql"  # Realistic transaction patterns
]
```

### Customizing Seed Files

You can modify the seed file configuration based on your needs:

```toml
# Load only main seed file (fastest)
sql_paths = ["./seed.sql"]

# Load specific components
sql_paths = ["./seeds/categories.sql", "./seeds/sample-accounts.sql"]

# Load all files (most comprehensive)
sql_paths = ["./seed.sql", "./seeds/*.sql"]
```

## Seed Data Overview

### Financial Summary (Sample Data)
- **Categories**: 120+ comprehensive categories across all types
- **Accounts**: 60+ sample accounts covering various scenarios
- **Transactions**: 100+ realistic transactions over 6 months
- **Net Worth**: ~$500K+ in sample assets and investments
- **Monthly Income**: ~$7K+ from various sources
- **Monthly Expenses**: ~$5K+ across all categories

### Testing Scenarios Covered
- ✅ Young professional starting career
- ✅ Family with children and education savings
- ✅ Pre-retirement high savings phase
- ✅ Small business owner financial complexity
- ✅ Various credit card usage patterns
- ✅ Diverse investment portfolio types
- ✅ Emergency and goal-based savings
- ✅ Multiple income sources
- ✅ Realistic spending patterns

## Best Practices

### Development
- Always run `validate-schema.sql` after database changes
- Use `test-functions.sql` to verify function changes
- Reset database frequently to test migration scripts
- Use specialized seed files for focused testing

### Production
- **Never** use seed data in production with real users
- Always backup before running migration scripts
- Use validation scripts to verify deployments
- Monitor function performance after changes

### Customization
- Modify seed data to match your testing needs
- Create additional specialized seed files as needed
- Update budget amounts to reflect your user base
- Add new categories based on user feedback

## Troubleshooting

### Common Issues

1. **"function generate_transaction_date does not exist" Error**
   - **Solution**: Use `seed-simple.sql` (default configuration)
   - **Cause**: Function dependency issues between multiple seed files
   - **Alternative**: Edit `config.toml` to load only one seed file at a time

2. **Seed data not visible in application**
   - **Cause**: Row Level Security (RLS) blocks data without proper user context
   - **Solution**: This is expected behavior with `seed-simple.sql`
   - **Workaround**: Create users through the app, then create their data via UI
   - **For testing**: Temporarily disable RLS or use programmatic data creation

3. **Seed files fail to load**
   - Check file paths in `config.toml`
   - Verify files exist and have correct permissions
   - Check for SQL syntax errors in seed files
   - Ensure proper file dependency order

4. **Functions not working**
   - Run `test-functions.sql` to identify issues
   - Check that all migrations have been applied
   - Verify RLS policies allow function execution

5. **Performance issues**
   - Check that all indexes are created
   - Verify queries are using appropriate indexes
   - Monitor function execution times

6. **Data integrity problems**
   - Run `validate-schema.sql` to check constraints
   - Verify foreign key relationships
   - Check enum values and data types

### Getting Help

If you encounter issues:
1. Run the validation scripts to identify problems
2. Check the Supabase logs for detailed error messages
3. Verify your environment configuration
4. Review the migration history for any failed migrations

## Contributing

When adding new seed data or migration scripts:
1. Follow the existing file naming conventions
2. Add appropriate validation checks
3. Test with fresh database instances
4. Update this documentation
5. Include realistic data that covers edge cases

## Security Considerations

- Seed data is for development and testing only
- Never include real user data in seed files
- Be cautious with seed data in staging environments
- Remove or modify seed data for production deployments
- Ensure RLS policies protect against unauthorized access

---

*This seeding system provides a robust foundation for development, testing, and deployment of the Noka Financial Tracker database.*