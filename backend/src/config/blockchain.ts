import { ethers } from "ethers";
import { env } from "./env";

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
  }
  return provider;
}

export function getSigner(): ethers.Wallet {
  if (!signer) {
    const p = getProvider();
    signer = new ethers.Wallet(env.DEPLOYER_PRIVATE_KEY, p);
  }
  return signer;
}

export async function isBlockchainConnected(): Promise<boolean> {
  try {
    const p = getProvider();
    await p.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}
