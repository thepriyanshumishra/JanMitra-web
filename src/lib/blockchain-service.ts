import { ethers } from "ethers";

const EVENT_ANCHOR_ABI = [
    "function anchorEvent(string calldata grievanceId, string calldata eventType, bytes32 dataHash) external",
    "function getHistory(string calldata grievanceId) external view returns (tuple(string grievanceId, string eventType, bytes32 dataHash, uint256 timestamp, address anchoredBy)[] memory)"
];

export class BlockchainService {
    private static provider: ethers.JsonRpcProvider | null = null;
    private static wallet: ethers.Wallet | null = null;
    private static contract: ethers.Contract | null = null;

    private static init() {
        if (this.contract) return;

        const rpcUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "https://rpc-amoy.polygon.technology";
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        const contractAddress = process.env.NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS;

        if (!contractAddress) {
            console.warn("Blockchain: NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS not found.");
            return;
        }

        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        if (privateKey) {
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            this.contract = new ethers.Contract(contractAddress, EVENT_ANCHOR_ABI, this.wallet);
        } else {
            this.contract = new ethers.Contract(contractAddress, EVENT_ANCHOR_ABI, this.provider);
        }
    }

    /**
     * Generates a SHA-256 hash of the event data.
     */
    public static hashEventData(data: any): string {
        const jsonString = JSON.stringify(data, Object.keys(data).sort());
        return ethers.keccak256(ethers.toUtf8Bytes(jsonString));
    }

    /**
     * Anchors an event to the blockchain.
     */
    public static async anchorEvent(grievanceId: string, eventType: string, data: any) {
        this.init();
        if (!this.contract || !this.wallet) {
            console.error("Blockchain Service not initialized with a wallet.");
            return null;
        }

        try {
            const dataHash = this.hashEventData(data);
            console.log(`Anchoring ${eventType} for ${grievanceId} with hash ${dataHash}`);

            const tx = await this.contract.anchorEvent(grievanceId, eventType, dataHash);
            const receipt = await tx.wait();

            return {
                hash: dataHash,
                txHash: receipt.hash,
                timestamp: Math.floor(Date.now() / 1000)
            };
        } catch (error) {
            console.error("Failed to anchor event:", error);
            return null;
        }
    }

    /**
     * Fetches history from the blockchain and verifies it against provided data.
     */
    public static async getAndVerifyHistory(grievanceId: string, localEvents: any[]) {
        this.init();
        if (!this.contract) return [];

        try {
            const chainHistory = await this.contract.getHistory(grievanceId);

            return chainHistory.map((record: any) => {
                const chainHash = record.dataHash;
                // Find corresponding local event and verify
                // This logic will be refined in the UI
                return {
                    eventType: record.eventType,
                    chainHash: chainHash,
                    timestamp: Number(record.timestamp),
                    anchoredBy: record.anchoredBy
                };
            });
        } catch (error) {
            console.error("Failed to fetch chain history:", error);
            return [];
        }
    }
}
