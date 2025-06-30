-- Categories Seed Script for Noka Financial Tracker
-- This file contains comprehensive category definitions with icons and budget templates
-- Organized by category type with realistic budget amounts for different income levels

-- =============================================================================
-- INCOME CATEGORIES WITH BUDGET TEMPLATES
-- =============================================================================

-- Primary Income Sources
INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
-- Regular employment income
('Salary', 'income', '💰', 5000.00, 'monthly', true),
('Hourly Wages', 'income', '⏰', 3000.00, 'monthly', true),
('Overtime Pay', 'income', '💪', 500.00, 'monthly', true),
('Commission', 'income', '🎯', 1000.00, 'monthly', true),
('Tips', 'income', '💸', 300.00, 'monthly', true),

-- Business and freelance income
('Freelance Work', 'income', '💼', 1500.00, 'monthly', true),
('Business Income', 'income', '🏢', 2000.00, 'monthly', true),
('Consulting', 'income', '🤝', 2500.00, 'monthly', true),
('Contract Work', 'income', '📋', 1800.00, 'monthly', true),
('Self Employment', 'income', '👨‍💼', 3000.00, 'monthly', true),

-- Investment and passive income
('Investment Returns', 'income', '📈', 500.00, 'monthly', true),
('Dividends', 'income', '💎', 200.00, 'monthly', true),
('Interest Income', 'income', '🏦', 100.00, 'monthly', true),
('Rental Income', 'income', '🏠', 800.00, 'monthly', true),
('Royalties', 'income', '👑', 300.00, 'monthly', true),
('Capital Gains', 'income', '📊', 1000.00, 'monthly', true),

-- Side income and gigs
('Side Hustle', 'income', '💻', 600.00, 'monthly', true),
('Gig Economy', 'income', '🚗', 400.00, 'monthly', true),
('Online Sales', 'income', '🛒', 300.00, 'monthly', true),
('Tutoring', 'income', '📚', 250.00, 'monthly', true),
('Pet Sitting', 'income', '🐕', 150.00, 'monthly', true),

-- Occasional and irregular income
('Bonus', 'income', '🎉', NULL, NULL, true),
('Tax Refund', 'income', '🧾', NULL, NULL, true),
('Gifts Received', 'income', '🎁', NULL, NULL, true),
('Inheritance', 'income', '👴', NULL, NULL, true),
('Lottery Winnings', 'income', '🍀', NULL, NULL, true),
('Cash Back', 'income', '💳', NULL, NULL, true),
('Rebates', 'income', '🔄', NULL, NULL, true),
('Insurance Claims', 'income', '🛡️', NULL, NULL, true),
('Alimony', 'income', '⚖️', NULL, NULL, true),
('Child Support', 'income', '👶', NULL, NULL, true),
('Government Benefits', 'income', '🏛️', NULL, NULL, true),
('Pension', 'income', '👴', NULL, NULL, true),
('Social Security', 'income', '📇', NULL, NULL, true),
('Other Income', 'income', '💵', NULL, NULL, true);

-- =============================================================================
-- EXPENSE CATEGORIES WITH REALISTIC BUDGETS
-- =============================================================================

-- Housing and Utilities (30-35% of income typically)
INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
('Rent/Mortgage', 'expense', '🏠', 1500.00, 'monthly', true),
('Property Tax', 'expense', '🏛️', 300.00, 'monthly', true),
('HOA Fees', 'expense', '🏘️', 150.00, 'monthly', true),
('Home Insurance', 'expense', '🛡️', 100.00, 'monthly', true),
('Electricity', 'expense', '💡', 120.00, 'monthly', true),
('Gas', 'expense', '🔥', 80.00, 'monthly', true),
('Water', 'expense', '💧', 60.00, 'monthly', true),
('Trash/Recycling', 'expense', '🗑️', 25.00, 'monthly', true),
('Internet', 'expense', '🌐', 60.00, 'monthly', true),
('Cable/TV', 'expense', '📺', 80.00, 'monthly', true),
('Home Maintenance', 'expense', '🔧', 150.00, 'monthly', true),
('Home Security', 'expense', '🔒', 40.00, 'monthly', true),

-- Transportation (10-15% of income typically)
('Car Payment', 'expense', '🚗', 400.00, 'monthly', true),
('Car Insurance', 'expense', '🚙', 150.00, 'monthly', true),
('Gasoline', 'expense', '⛽', 200.00, 'monthly', true),
('Car Maintenance', 'expense', '🔧', 100.00, 'monthly', true),
('Car Registration', 'expense', '📋', 20.00, 'monthly', true),
('Parking', 'expense', '🅿️', 50.00, 'monthly', true),
('Public Transit', 'expense', '🚌', 100.00, 'monthly', true),
('Rideshare/Taxi', 'expense', '🚕', 80.00, 'monthly', true),
('Tolls', 'expense', '🛣️', 30.00, 'monthly', true),

-- Food and Dining (10-15% of income typically)
('Groceries', 'expense', '🛒', 600.00, 'monthly', true),
('Dining Out', 'expense', '🍽️', 300.00, 'monthly', true),
('Fast Food', 'expense', '🍔', 150.00, 'monthly', true),
('Coffee', 'expense', '☕', 80.00, 'monthly', true),
('Alcohol', 'expense', '🍷', 100.00, 'monthly', true),
('Work Lunches', 'expense', '🥪', 120.00, 'monthly', true),

-- Healthcare (5-10% of income typically)
('Health Insurance', 'expense', '⚕️', 300.00, 'monthly', true),
('Doctor Visits', 'expense', '👨‍⚕️', 100.00, 'monthly', true),
('Dentist', 'expense', '🦷', 80.00, 'monthly', true),
('Prescription Drugs', 'expense', '💊', 60.00, 'monthly', true),
('Vision Care', 'expense', '👓', 40.00, 'monthly', true),
('Mental Health', 'expense', '🧠', 150.00, 'monthly', true),
('Alternative Medicine', 'expense', '🌿', 50.00, 'monthly', true),

-- Personal and Lifestyle
('Phone', 'expense', '📱', 80.00, 'monthly', true),
('Personal Care', 'expense', '💄', 100.00, 'monthly', true),
('Haircuts', 'expense', '💇', 50.00, 'monthly', true),
('Clothing', 'expense', '👕', 200.00, 'monthly', true),
('Shoes', 'expense', '👟', 80.00, 'monthly', true),
('Dry Cleaning', 'expense', '👔', 30.00, 'monthly', true),
('Laundry', 'expense', '🧺', 25.00, 'monthly', true),

-- Entertainment and Recreation (5-10% of income typically)
('Streaming Services', 'expense', '📺', 50.00, 'monthly', true),
('Movies', 'expense', '🎬', 40.00, 'monthly', true),
('Concerts/Events', 'expense', '🎵', 100.00, 'monthly', true),
('Hobbies', 'expense', '🎨', 150.00, 'monthly', true),
('Sports/Fitness', 'expense', '💪', 100.00, 'monthly', true),
('Gym Membership', 'expense', '🏋️', 50.00, 'monthly', true),
('Books/Magazines', 'expense', '📚', 30.00, 'monthly', true),
('Games', 'expense', '🎮', 60.00, 'monthly', true),
('Travel', 'expense', '✈️', 500.00, 'monthly', true),
('Vacation', 'expense', '🏖️', 300.00, 'monthly', true),

-- Financial and Insurance
('Life Insurance', 'expense', '👨‍👩‍👧‍👦', 100.00, 'monthly', true),
('Disability Insurance', 'expense', '🦽', 80.00, 'monthly', true),
('Loan Payments', 'expense', '🏦', 300.00, 'monthly', true),
('Credit Card Payments', 'expense', '💳', 500.00, 'monthly', true),
('Bank Fees', 'expense', '🏪', 25.00, 'monthly', true),
('Investment Fees', 'expense', '📈', 50.00, 'monthly', true),
('Tax Preparation', 'expense', '📊', 50.00, 'monthly', true),
('Legal Fees', 'expense', '⚖️', 100.00, 'monthly', true),
('Financial Advisor', 'expense', '💼', 200.00, 'monthly', true),

-- Family and Children
('Childcare', 'expense', '👶', 800.00, 'monthly', true),
('School Tuition', 'expense', '🏫', 500.00, 'monthly', true),
('School Supplies', 'expense', '📝', 50.00, 'monthly', true),
('Child Activities', 'expense', '⚽', 100.00, 'monthly', true),
('Pet Care', 'expense', '🐕', 80.00, 'monthly', true),
('Pet Food', 'expense', '🐾', 40.00, 'monthly', true),
('Vet Bills', 'expense', '🏥', 60.00, 'monthly', true),

-- Education and Professional Development
('Education', 'expense', '🎓', 200.00, 'monthly', true),
('Professional Development', 'expense', '📈', 100.00, 'monthly', true),
('Conferences', 'expense', '🎤', 150.00, 'monthly', true),
('Certifications', 'expense', '📜', 80.00, 'monthly', true),

-- Charitable and Social
('Charity', 'expense', '❤️', 100.00, 'monthly', true),
('Religious Donations', 'expense', '⛪', 200.00, 'monthly', true),
('Gifts Given', 'expense', '🎁', 150.00, 'monthly', true),
('Birthday Gifts', 'expense', '🎂', 100.00, 'monthly', true),
('Holiday Gifts', 'expense', '🎄', 200.00, 'monthly', true),

-- Emergency and Miscellaneous
('Emergency Expenses', 'expense', '🚨', 200.00, 'monthly', true),
('Medical Emergencies', 'expense', '🏥', 150.00, 'monthly', true),
('Car Repairs', 'expense', '🔧', 100.00, 'monthly', true),
('Home Repairs', 'expense', '🏠', 150.00, 'monthly', true),
('Miscellaneous', 'expense', '📋', 100.00, 'monthly', true),
('Other Expenses', 'expense', '❓', NULL, NULL, true);

-- =============================================================================
-- INVESTMENT CATEGORIES WITH TARGET ALLOCATIONS
-- =============================================================================

INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
-- Retirement Investments (10-15% of income recommended)
('401k Contribution', 'investment', '🏦', 800.00, 'monthly', true),
('IRA Contribution', 'investment', '🎯', 500.00, 'monthly', true),
('Roth IRA', 'investment', '💎', 500.00, 'monthly', true),
('Pension Contribution', 'investment', '👴', 300.00, 'monthly', true),

-- Stock Market Investments
('Individual Stocks', 'investment', '📊', 1000.00, 'monthly', true),
('Index Funds', 'investment', '📈', 800.00, 'monthly', true),
('Mutual Funds', 'investment', '📊', 600.00, 'monthly', true),
('ETFs', 'investment', '🔄', 700.00, 'monthly', true),
('Blue Chip Stocks', 'investment', '💙', 500.00, 'monthly', true),
('Growth Stocks', 'investment', '🚀', 400.00, 'monthly', true),
('Dividend Stocks', 'investment', '💰', 600.00, 'monthly', true),

-- Fixed Income Investments
('Government Bonds', 'investment', '🏛️', 300.00, 'monthly', true),
('Corporate Bonds', 'investment', '🏢', 400.00, 'monthly', true),
('Municipal Bonds', 'investment', '🏙️', 200.00, 'monthly', true),
('Treasury Bills', 'investment', '💵', 300.00, 'monthly', true),
('CDs', 'investment', '🏦', 500.00, 'monthly', true),

-- Alternative Investments
('Real Estate', 'investment', '🏘️', 2000.00, 'monthly', true),
('REITs', 'investment', '🏢', 400.00, 'monthly', true),
('Cryptocurrency', 'investment', '₿', 300.00, 'monthly', true),
('Commodities', 'investment', '🥇', 200.00, 'monthly', true),
('Precious Metals', 'investment', '💎', 250.00, 'monthly', true),
('Art/Collectibles', 'investment', '🎨', 500.00, 'monthly', true),

-- Savings and Emergency Funds
('Emergency Fund', 'investment', '🛡️', 500.00, 'monthly', true),
('High Yield Savings', 'investment', '💰', 800.00, 'monthly', true),
('Money Market', 'investment', '💹', 600.00, 'monthly', true),

-- Goal-based Savings
('House Down Payment', 'investment', '🏠', 1500.00, 'monthly', true),
('Car Fund', 'investment', '🚗', 300.00, 'monthly', true),
('Vacation Fund', 'investment', '✈️', 250.00, 'monthly', true),
('Wedding Fund', 'investment', '💒', 800.00, 'monthly', true),
('Education Fund', 'investment', '🎓', 400.00, 'monthly', true),
('Business Investment', 'investment', '💼', 1000.00, 'monthly', true),

-- Professional Investment Tools
('Robo Advisor', 'investment', '🤖', 500.00, 'monthly', true),
('Financial Advisor', 'investment', '👨‍💼', 200.00, 'monthly', true),
('Investment Platform', 'investment', '💻', 50.00, 'monthly', true);

-- =============================================================================
-- CATEGORY STATISTICS AND SUMMARY
-- =============================================================================

DO $$
DECLARE
    total_categories INTEGER;
    income_categories INTEGER;
    expense_categories INTEGER;
    investment_categories INTEGER;
    budgeted_categories INTEGER;
BEGIN
    SELECT count(*) INTO total_categories FROM categories;
    SELECT count(*) INTO income_categories FROM categories WHERE type = 'income';
    SELECT count(*) INTO expense_categories FROM categories WHERE type = 'expense';
    SELECT count(*) INTO investment_categories FROM categories WHERE type = 'investment';
    SELECT count(*) INTO budgeted_categories FROM categories WHERE budget_amount IS NOT NULL;
    
    RAISE NOTICE '=== CATEGORY SEED DATA SUMMARY ===';
    RAISE NOTICE 'Total categories: %', total_categories;
    RAISE NOTICE 'Income categories: %', income_categories;
    RAISE NOTICE 'Expense categories: %', expense_categories;
    RAISE NOTICE 'Investment categories: %', investment_categories;
    RAISE NOTICE 'Categories with budgets: %', budgeted_categories;
    RAISE NOTICE '';
    RAISE NOTICE 'Categories are organized with:';
    RAISE NOTICE '- Emoji icons for visual identification';
    RAISE NOTICE '- Realistic budget amounts based on income percentages';
    RAISE NOTICE '- Monthly frequency for most budget categories';
    RAISE NOTICE '- Comprehensive coverage of financial activities';
    RAISE NOTICE '================================';
END $$;