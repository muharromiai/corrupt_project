import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("========================================");
  console.log("  Deploying Corruption Killer Contracts");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy BudgetManager
  console.log("1. Deploying BudgetManager...");
  const BudgetManager = await ethers.getContractFactory("BudgetManager");
  const budgetManager = await BudgetManager.deploy();
  await budgetManager.waitForDeployment();
  const budgetManagerAddress = await budgetManager.getAddress();
  console.log("   BudgetManager deployed to:", budgetManagerAddress);

  // Deploy TransactionManager
  console.log("2. Deploying TransactionManager...");
  const TransactionManager = await ethers.getContractFactory("TransactionManager");
  const transactionManager = await TransactionManager.deploy();
  await transactionManager.waitForDeployment();
  const transactionManagerAddress = await transactionManager.getAddress();
  console.log("   TransactionManager deployed to:", transactionManagerAddress);

  // Deploy AuditTrail
  console.log("3. Deploying AuditTrail...");
  const AuditTrail = await ethers.getContractFactory("AuditTrail");
  const auditTrail = await AuditTrail.deploy();
  await auditTrail.waitForDeployment();
  const auditTrailAddress = await auditTrail.getAddress();
  console.log("   AuditTrail deployed to:", auditTrailAddress);

  console.log("\n========================================");
  console.log("  All Contracts Deployed Successfully!");
  console.log("========================================\n");

  // Save addresses to JSON file
  const addresses = {
    BudgetManager: budgetManagerAddress,
    TransactionManager: transactionManagerAddress,
    AuditTrail: auditTrailAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("Contract addresses saved to:", outputPath);

  // Save ABI files for backend usage
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const contracts = [
    { name: "BudgetManager", path: "contracts/BudgetManager.sol/BudgetManager.json" },
    { name: "TransactionManager", path: "contracts/TransactionManager.sol/TransactionManager.json" },
    { name: "AuditTrail", path: "contracts/AuditTrail.sol/AuditTrail.json" },
  ];

  for (const contract of contracts) {
    const artifactPath = path.join(__dirname, "..", "artifacts", contract.path);
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
      fs.writeFileSync(
        path.join(abiDir, `${contract.name}.json`),
        JSON.stringify({ abi: artifact.abi, address: addresses[contract.name as keyof typeof addresses] }, null, 2)
      );
      console.log(`ABI saved: abi/${contract.name}.json`);
    }
  }

  console.log("\n========================================");
  console.log("  Update your backend .env file:");
  console.log("========================================");
  console.log(`BUDGET_MANAGER_ADDRESS="${budgetManagerAddress}"`);
  console.log(`TRANSACTION_MANAGER_ADDRESS="${transactionManagerAddress}"`);
  console.log(`AUDIT_TRAIL_ADDRESS="${auditTrailAddress}"`);
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
