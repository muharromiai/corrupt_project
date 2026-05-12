import { expect } from "chai";
import { ethers } from "hardhat";
import { BudgetManager, TransactionManager, AuditTrail } from "../typechain-types";

describe("Corruption Killer Smart Contracts", function () {
  let budgetManager: BudgetManager;
  let transactionManager: TransactionManager;
  let auditTrail: AuditTrail;
  let deployer: any;
  let auditor: any;
  let operator: any;

  beforeEach(async function () {
    [deployer, auditor, operator] = await ethers.getSigners();

    const BudgetManager = await ethers.getContractFactory("BudgetManager");
    budgetManager = await BudgetManager.deploy();
    await budgetManager.waitForDeployment();

    const TransactionManager = await ethers.getContractFactory("TransactionManager");
    transactionManager = await TransactionManager.deploy();
    await transactionManager.waitForDeployment();

    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrail.deploy();
    await auditTrail.waitForDeployment();
  });

  // ============================================================
  // BUDGET MANAGER TESTS
  // ============================================================
  describe("BudgetManager", function () {
    const budgetId = "budget-001";
    const budgetName = "Anggaran Infrastruktur 2025";
    const category = "INFRASTRUCTURE";
    const totalAmount = ethers.parseUnits("500000000000", 0); // 500 milyar
    const fiscalYear = 2025;

    it("should create a new budget", async function () {
      const tx = await budgetManager.createBudget(budgetId, budgetName, category, totalAmount, fiscalYear);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;

      const budget = await budgetManager.getBudget(budgetId);
      expect(budget.name).to.equal(budgetName);
      expect(budget.category).to.equal(category);
      expect(budget.totalAmount).to.equal(totalAmount);
      expect(budget.fiscalYear).to.equal(fiscalYear);
      expect(budget.createdBy).to.equal(deployer.address);
    });

    it("should emit BudgetCreated event", async function () {
      await expect(budgetManager.createBudget(budgetId, budgetName, category, totalAmount, fiscalYear))
        .to.emit(budgetManager, "BudgetCreated")
        .withArgs(budgetId, budgetName, category, totalAmount, fiscalYear, deployer.address, await getTimestamp());
    });

    it("should not allow duplicate budget IDs", async function () {
      await budgetManager.createBudget(budgetId, budgetName, category, totalAmount, fiscalYear);
      await expect(
        budgetManager.createBudget(budgetId, "Another Budget", category, totalAmount, fiscalYear)
      ).to.be.revertedWith("Budget already exists");
    });

    it("should reject empty budget ID", async function () {
      await expect(
        budgetManager.createBudget("", budgetName, category, totalAmount, fiscalYear)
      ).to.be.revertedWith("Budget ID cannot be empty");
    });

    it("should reject zero amount", async function () {
      await expect(
        budgetManager.createBudget(budgetId, budgetName, category, 0, fiscalYear)
      ).to.be.revertedWith("Total amount must be greater than 0");
    });

    it("should update budget", async function () {
      await budgetManager.createBudget(budgetId, budgetName, category, totalAmount, fiscalYear);

      const newName = "Anggaran Infrastruktur Updated";
      const newAmount = ethers.parseUnits("600000000000", 0);

      await budgetManager.updateBudget(budgetId, newName, newAmount);

      const budget = await budgetManager.getBudget(budgetId);
      expect(budget.name).to.equal(newName);
      expect(budget.totalAmount).to.equal(newAmount);
    });

    it("should track total budgets", async function () {
      expect(await budgetManager.getTotalBudgets()).to.equal(0);

      await budgetManager.createBudget("b1", "Budget 1", "INFRA", 1000, 2025);
      await budgetManager.createBudget("b2", "Budget 2", "EDU", 2000, 2025);

      expect(await budgetManager.getTotalBudgets()).to.equal(2);
    });
  });

  // ============================================================
  // TRANSACTION MANAGER TESTS
  // ============================================================
  describe("TransactionManager", function () {
    const txId = "tx-001";
    const budgetId = "budget-001";
    const description = "Pembayaran tahap 1 proyek jalan";
    const amount = ethers.parseUnits("25000000000", 0); // 25 milyar
    const recipientName = "PT Hutama Karya";

    it("should create a new transaction", async function () {
      await transactionManager.connect(operator).createTransaction(txId, budgetId, description, amount, recipientName);

      const tx = await transactionManager.getTransaction(txId);
      expect(tx.budgetId).to.equal(budgetId);
      expect(tx.description).to.equal(description);
      expect(tx.amount).to.equal(amount);
      expect(tx.recipientName).to.equal(recipientName);
      expect(tx.status).to.equal(0); // PENDING
      expect(tx.createdBy).to.equal(operator.address);
    });

    it("should emit TransactionCreated event", async function () {
      await expect(
        transactionManager.connect(operator).createTransaction(txId, budgetId, description, amount, recipientName)
      )
        .to.emit(transactionManager, "TransactionCreated");
    });

    it("should approve a pending transaction", async function () {
      await transactionManager.connect(operator).createTransaction(txId, budgetId, description, amount, recipientName);

      await expect(transactionManager.connect(auditor).approveTransaction(txId))
        .to.emit(transactionManager, "TransactionStatusChanged")
        .withArgs(txId, 0, 1, auditor.address, await getTimestamp()); // PENDING -> APPROVED

      const status = await transactionManager.getTransactionStatus(txId);
      expect(status).to.equal(1); // APPROVED
    });

    it("should reject a pending transaction", async function () {
      await transactionManager.connect(operator).createTransaction(txId, budgetId, description, amount, recipientName);

      await transactionManager.connect(auditor).rejectTransaction(txId);

      const status = await transactionManager.getTransactionStatus(txId);
      expect(status).to.equal(2); // REJECTED
    });

    it("should not approve an already approved transaction", async function () {
      await transactionManager.connect(operator).createTransaction(txId, budgetId, description, amount, recipientName);
      await transactionManager.connect(auditor).approveTransaction(txId);

      await expect(
        transactionManager.connect(auditor).approveTransaction(txId)
      ).to.be.revertedWith("Transaction is not pending");
    });

    it("should not allow duplicate transaction IDs", async function () {
      await transactionManager.connect(operator).createTransaction(txId, budgetId, description, amount, recipientName);
      await expect(
        transactionManager.connect(operator).createTransaction(txId, budgetId, "Another tx", amount, recipientName)
      ).to.be.revertedWith("Transaction already exists");
    });

    it("should track transactions per budget", async function () {
      await transactionManager.createTransaction("tx1", budgetId, "Desc 1", 1000, "Vendor A");
      await transactionManager.createTransaction("tx2", budgetId, "Desc 2", 2000, "Vendor B");
      await transactionManager.createTransaction("tx3", "budget-002", "Desc 3", 3000, "Vendor C");

      expect(await transactionManager.getBudgetTransactionCount(budgetId)).to.equal(2);
      expect(await transactionManager.getBudgetTransactionCount("budget-002")).to.equal(1);
      expect(await transactionManager.getTotalTransactions()).to.equal(3);
    });
  });

  // ============================================================
  // AUDIT TRAIL TESTS
  // ============================================================
  describe("AuditTrail", function () {
    const auditId = "audit-001";
    const transactionId = "tx-001";
    const notes = "Dokumen pembebasan lahan valid. Harga sesuai HPS.";

    it("should record an audit entry", async function () {
      await auditTrail.connect(auditor).recordAudit(auditId, transactionId, 0, notes); // APPROVED

      const entry = await auditTrail.getAuditEntry(auditId);
      expect(entry.transactionId).to.equal(transactionId);
      expect(entry.action).to.equal(0); // APPROVED
      expect(entry.notes).to.equal(notes);
      expect(entry.auditor).to.equal(auditor.address);
    });

    it("should emit AuditRecorded event", async function () {
      await expect(auditTrail.connect(auditor).recordAudit(auditId, transactionId, 0, notes))
        .to.emit(auditTrail, "AuditRecorded");
    });

    it("should track audit summary", async function () {
      await auditTrail.connect(auditor).recordAudit("a1", "tx1", 0, "OK"); // APPROVED
      await auditTrail.connect(auditor).recordAudit("a2", "tx2", 0, "OK"); // APPROVED
      await auditTrail.connect(auditor).recordAudit("a3", "tx3", 1, "Not valid"); // REJECTED
      await auditTrail.connect(auditor).recordAudit("a4", "tx4", 2, "Reviewing"); // REVIEWED

      const summary = await auditTrail.getAuditSummary();
      expect(summary.approved).to.equal(2);
      expect(summary.rejected).to.equal(1);
      expect(summary.reviewed).to.equal(1);
      expect(summary.total).to.equal(4);
    });

    it("should not allow duplicate audit IDs", async function () {
      await auditTrail.connect(auditor).recordAudit(auditId, transactionId, 0, notes);
      await expect(
        auditTrail.connect(auditor).recordAudit(auditId, "tx-002", 1, "Rejected")
      ).to.be.revertedWith("Audit entry already exists");
    });

    it("should track audits per transaction", async function () {
      await auditTrail.connect(auditor).recordAudit("a1", transactionId, 2, "Initial review");
      await auditTrail.connect(auditor).recordAudit("a2", transactionId, 0, "Approved");

      const count = await auditTrail.getTransactionAuditCount(transactionId);
      expect(count).to.equal(2);

      const firstAuditId = await auditTrail.getTransactionAuditByIndex(transactionId, 0);
      expect(firstAuditId).to.equal("a1");
    });

    it("should emit AuditSummaryUpdated event", async function () {
      await expect(auditTrail.connect(auditor).recordAudit(auditId, transactionId, 0, notes))
        .to.emit(auditTrail, "AuditSummaryUpdated")
        .withArgs(1, 0, 0, await getTimestamp());
    });
  });

  // ============================================================
  // INTEGRATION TEST
  // ============================================================
  describe("Integration: Full Workflow", function () {
    it("should complete budget -> transaction -> audit flow", async function () {
      // Step 1: Create budget
      await budgetManager.createBudget("b1", "Anggaran Jalan", "INFRA", 100000, 2025);
      const budget = await budgetManager.getBudget("b1");
      expect(budget.name).to.equal("Anggaran Jalan");

      // Step 2: Create transaction
      await transactionManager.connect(operator).createTransaction(
        "tx1", "b1", "Pembayaran kontraktor", 50000, "PT ABC"
      );
      const tx = await transactionManager.getTransaction("tx1");
      expect(tx.status).to.equal(0); // PENDING

      // Step 3: Auditor reviews & approves
      await auditTrail.connect(auditor).recordAudit("audit1", "tx1", 0, "Dokumen lengkap, disetujui");
      await transactionManager.connect(auditor).approveTransaction("tx1");

      const txAfter = await transactionManager.getTransaction("tx1");
      expect(txAfter.status).to.equal(1); // APPROVED

      // Step 4: Verify audit trail
      const auditEntry = await auditTrail.getAuditEntry("audit1");
      expect(auditEntry.action).to.equal(0); // APPROVED
      expect(auditEntry.auditor).to.equal(auditor.address);

      const summary = await auditTrail.getAuditSummary();
      expect(summary.approved).to.equal(1);
      expect(summary.total).to.equal(1);
    });
  });
});

async function getTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block ? block.timestamp : 0;
}
