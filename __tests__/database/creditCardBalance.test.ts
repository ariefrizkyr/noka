import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  setupCreditCardTest,
  getTestDate,
  type TestSetup 
} from '../utils/testSetup';
import { 
  createTestTransaction,
  getAccountBalance,
  getBalanceLedgerEntries 
} from '../utils/testDatabase';

describe('Credit Card Balance Logic', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await setupCreditCardTest();
  });

  afterEach(async () => {
    if (testSetup) {
      await testSetup.cleanup();
    }
  });

  describe('Credit Card Expense Transactions', () => {
    test('should increase balance (debt) for new credit card purchase', async () => {
      // Initial balance should be 0
      let balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(0);

      // Make a $100 purchase
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        100.00,
        'Test purchase',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Balance should now be $100 (debt increased)
      balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(100.00);
    });

    test('should increase debt on credit card with existing balance', async () => {
      // Create initial debt of $500
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        500.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Verify initial balance
      let balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(500.00);

      // Make another $50 purchase
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        50.00,
        'Additional purchase',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Balance should now be $550 (debt increased)
      balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(550.00);
    });

    test('should handle negative expense amounts (refunds) correctly', async () => {
      // Create initial debt of $200
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        200.00,
        'Initial purchase',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Verify initial balance
      let balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(200.00);

      // Process a $50 refund (negative expense)
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        -50.00,
        'Refund',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Balance should be $150 (debt decreased by refund)
      balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(150.00);
    });

    test('should handle large refund that creates credit balance', async () => {
      // Create initial debt of $100
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        100.00,
        'Initial purchase',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Process a $150 refund (larger than debt)
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        -150.00,
        'Large refund',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Balance should be -$50 (credit balance)
      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(-50.00);
    });
  });

  describe('Credit Card Payment Transactions (Income)', () => {
    test('should decrease balance (debt) for credit card payment', async () => {
      // Create initial debt of $500
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        500.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Make a $200 payment
      await createTestTransaction(
        testSetup.user.id,
        'income',
        200.00,
        'Payment',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.incomeCategory.id
      );

      // Balance should now be $300 (debt decreased)
      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(300.00);
    });

    test('should handle full payment of credit card debt', async () => {
      // Create initial debt of $300
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        300.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Make full payment
      await createTestTransaction(
        testSetup.user.id,
        'income',
        300.00,
        'Full payment',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.incomeCategory.id
      );

      // Balance should be $0 (no debt)
      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(0.00);
    });

    test('should handle overpayment creating credit balance', async () => {
      // Create initial debt of $200
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        200.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Make overpayment of $250
      await createTestTransaction(
        testSetup.user.id,
        'income',
        250.00,
        'Overpayment',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.incomeCategory.id
      );

      // Balance should be -$50 (credit balance)
      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(-50.00);
    });

    test('should handle negative income amounts correctly', async () => {
      // Create initial debt of $100
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        100.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Process negative income (payment reversal)
      await createTestTransaction(
        testSetup.user.id,
        'income',
        -50.00,
        'Payment reversal',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.incomeCategory.id
      );

      // Balance should be $150 (debt increased)
      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(150.00);
    });
  });

  describe('Credit Card Transfer Scenarios', () => {
    test('transfers TO credit card should decrease balance (payments)', async () => {
      // Create initial debt of $400
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        400.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Transfer $150 from bank account to credit card (payment)
      await createTestTransaction(
        testSetup.user.id,
        'transfer',
        150.00,
        'Payment transfer',
        getTestDate(),
        undefined,
        undefined,
        testSetup.bankAccount.id,
        testSetup.creditCardAccount.id
      );

      // Credit card balance should decrease to $250
      const ccBalance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(ccBalance).toBe(250.00);

      // Bank account balance should decrease to $850
      const bankBalance = await getAccountBalance(testSetup.bankAccount.id);
      expect(bankBalance).toBe(850.00);
    });

    test('transfers FROM credit card should increase balance (cash advance)', async () => {
      // Start with zero debt
      let ccBalance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(ccBalance).toBe(0.00);

      // Transfer $200 from credit card to bank account (cash advance)
      await createTestTransaction(
        testSetup.user.id,
        'transfer',
        200.00,
        'Cash advance',
        getTestDate(),
        undefined,
        undefined,
        testSetup.creditCardAccount.id,
        testSetup.bankAccount.id
      );

      // Credit card balance should increase to $200 (debt)
      ccBalance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(ccBalance).toBe(200.00);

      // Bank account balance should increase to $1200
      const bankBalance = await getAccountBalance(testSetup.bankAccount.id);
      expect(bankBalance).toBe(1200.00);
    });

    test('credit card to credit card transfer', async () => {
      // Create a second credit card with $300 debt
      const secondCreditCard = await require('../utils/testDatabase').createTestAccount(
        testSetup.user.id,
        'Second Credit Card',
        'credit_card',
        300.00
      );

      // Transfer $100 from first credit card to second credit card
      await createTestTransaction(
        testSetup.user.id,
        'transfer',
        100.00,
        'CC to CC transfer',
        getTestDate(),
        undefined,
        undefined,
        testSetup.creditCardAccount.id,
        secondCreditCard.id
      );

      // First credit card balance should increase to $100 (debt)
      const firstCcBalance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(firstCcBalance).toBe(100.00);

      // Second credit card balance should decrease to $200 (debt decreased)
      const secondCcBalance = await getAccountBalance(secondCreditCard.id);
      expect(secondCcBalance).toBe(200.00);
    });
  });

  describe('Balance Ledger Accuracy', () => {
    test('should create accurate ledger entries for expense transactions', async () => {
      // Make a $100 purchase
      const transaction = await createTestTransaction(
        testSetup.user.id,
        'expense',
        100.00,
        'Test purchase',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Check ledger entries
      const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
      expect(ledgerEntries).toHaveLength(1);

      const entry = ledgerEntries[0];
      expect(entry.transaction_id).toBe(transaction.id);
      expect(entry.balance_before).toBe(0.00);
      expect(entry.balance_after).toBe(100.00);
      expect(entry.change_amount).toBe(100.00);
    });

    test('should create accurate ledger entries for payment transactions', async () => {
      // Create initial debt
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        200.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Make a payment
      const paymentTransaction = await createTestTransaction(
        testSetup.user.id,
        'income',
        75.00,
        'Payment',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.incomeCategory.id
      );

      // Check ledger entries
      const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
      expect(ledgerEntries).toHaveLength(2);

      // Check the payment entry (second entry)
      const paymentEntry = ledgerEntries[1];
      expect(paymentEntry.transaction_id).toBe(paymentTransaction.id);
      expect(paymentEntry.balance_before).toBe(200.00);
      expect(paymentEntry.balance_after).toBe(125.00);
      expect(paymentEntry.change_amount).toBe(-75.00); // Negative for credit card payments (debt reduction)
    });

    test('should create accurate ledger entries for transfer transactions', async () => {
      // Create initial debt on credit card
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        300.00,
        'Initial debt',
        getTestDate(-1),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Transfer from bank to credit card (payment)
      const transferTransaction = await createTestTransaction(
        testSetup.user.id,
        'transfer',
        150.00,
        'Payment transfer',
        getTestDate(),
        undefined,
        undefined,
        testSetup.bankAccount.id,
        testSetup.creditCardAccount.id
      );

      // Check credit card ledger entries
      const ccLedgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
      expect(ccLedgerEntries).toHaveLength(2);

      const transferEntry = ccLedgerEntries[1];
      expect(transferEntry.transaction_id).toBe(transferTransaction.id);
      expect(transferEntry.balance_before).toBe(300.00);
      expect(transferEntry.balance_after).toBe(150.00);
      expect(transferEntry.change_amount).toBe(-150.00); // Negative for credit card payments (debt reduction)

      // Check bank account ledger entries
      const bankLedgerEntries = await getBalanceLedgerEntries(testSetup.bankAccount.id);
      expect(bankLedgerEntries).toHaveLength(1);

      const bankTransferEntry = bankLedgerEntries[0];
      expect(bankTransferEntry.transaction_id).toBe(transferTransaction.id);
      expect(bankTransferEntry.balance_before).toBe(1000.00);
      expect(bankTransferEntry.balance_after).toBe(850.00);
      expect(bankTransferEntry.change_amount).toBe(-150.00);
    });

    test('should maintain balance consistency across multiple transactions', async () => {
      const transactions = [
        { type: 'expense' as const, amount: 250.00, desc: 'Purchase 1' },
        { type: 'expense' as const, amount: 75.00, desc: 'Purchase 2' },
        { type: 'income' as const, amount: 100.00, desc: 'Payment 1' },
        { type: 'expense' as const, amount: -25.00, desc: 'Refund' },
        { type: 'income' as const, amount: 50.00, desc: 'Payment 2' },
      ];

      let expectedBalance = 0;
      for (const [index, txn] of transactions.entries()) {
        await createTestTransaction(
          testSetup.user.id,
          txn.type,
          txn.amount,
          txn.desc,
          getTestDate(index),
          testSetup.creditCardAccount.id,
          txn.type === 'expense' ? testSetup.expenseCategory.id : testSetup.incomeCategory.id
        );

        // Calculate expected balance for credit card
        if (txn.type === 'expense') {
          expectedBalance += txn.amount; // Expenses increase debt
        } else {
          expectedBalance -= txn.amount; // Income/payments decrease debt
        }

        // Verify balance after each transaction
        const actualBalance = await getAccountBalance(testSetup.creditCardAccount.id);
        expect(actualBalance).toBe(expectedBalance);
      }

      // Final balance should be: 250 + 75 - 100 + (-25) - 50 = 150
      const finalBalance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(finalBalance).toBe(150.00);

      // Verify all ledger entries are consistent
      const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
      expect(ledgerEntries).toHaveLength(5);

      // Check that each entry's balance_after matches the next entry's balance_before
      for (let i = 1; i < ledgerEntries.length; i++) {
        expect(ledgerEntries[i].balance_before).toBe(ledgerEntries[i - 1].balance_after);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle zero amount transactions', async () => {
      // Create zero amount expense
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        0.00,
        'Zero amount transaction',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      // Balance should remain 0
      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(0.00);

      // Should create ledger entry with zero change
      const ledgerEntries = await getBalanceLedgerEntries(testSetup.creditCardAccount.id);
      expect(ledgerEntries).toHaveLength(1);
      expect(ledgerEntries[0].change_amount).toBe(0.00);
    });

    test('should handle very small amounts (precision test)', async () => {
      // Create transaction with 2 decimal places
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        10.99,
        'Precision test',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(10.99);
    });

    test('should handle very large amounts', async () => {
      // Create transaction with large amount
      const largeAmount = 99999.99;
      await createTestTransaction(
        testSetup.user.id,
        'expense',
        largeAmount,
        'Large amount test',
        getTestDate(),
        testSetup.creditCardAccount.id,
        testSetup.expenseCategory.id
      );

      const balance = await getAccountBalance(testSetup.creditCardAccount.id);
      expect(balance).toBe(largeAmount);
    });
  });
});