'use client';
import { client } from "@/app/client";
import { useParams } from "next/navigation";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { ConnectButton, TransactionButton, useReadContract } from "thirdweb/react";

export default function CampaignPage() {
    const { campaignAddress } = useParams();

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: campaignAddress as string,
    });

    // Name of the campaign
    const { data: name, isLoading: isLoadingName } = useReadContract({
        contract: contract,
        method: "function name() view returns (string)",
        params: [],
    });

    // Goal amount of the campaign
    const { data: goal, isLoading: isLoadingGoal } = useReadContract({
        contract: contract,
        method: "function goal() view returns (uint256)",
        params: [],
    });
    
    // Total funded balance of the campaign
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        contract: contract,
        method: "function getBalance() view returns (uint256)",
        params: [],
    });

    // Get tiers for the campaign
    const { data: tiers, isLoading: isLoadingTiers } = useReadContract({
        contract: contract,
        method: "function getTiers() view returns ((string name, uint256 amount, uint256 backers)[])",
        params: [],
    });
    
    return (
        <div>
            <ConnectButton 
                client={client}
            />
            {!isLoadingName && (
                <p>{name}</p>
            )}
            {!isLoadingGoal && (
                <p>Goal: {goal?.toString()}</p>
            )}
            {!isLoadingBalance && (
                <p>Balance: {balance?.toString()}</p>
            )}
            <div>
                {isLoadingTiers ? (
                    <p>Loading...</p>
                ) : (
                    tiers && tiers.length > 0 ? (
                        tiers.map((tier, index) => (
                            <div key={index}>
                                <p>{tier.name}</p>
                                <p>{tier.amount.toString()}</p>
                                <p>{tier.backers.toString()}</p>
                                <TransactionButton
                                    transaction={() => prepareContractCall({
                                        contract: contract,
                                        method: "function fund(uint256 _tierIndex) payable",
                                        params: [BigInt(index)],
                                        value: tier.amount,
                                    })}
                                    onError={(error) => alert(`Error: ${error.message}`)}
                                    onTransactionConfirmed={async () => alert("Funded successfully!")}
                                >Select</TransactionButton>
                            </div>
                        ))
                    ) : (
                        <p>No tiers available</p>
                    )
                )}
            </div>
            <div>
                <TransactionButton
                    transaction={() => prepareContractCall({
                        contract: contract,
                        method: "function addTier(string _tierName, uint256 _amount)",
                        params: ["Tier 1", 5n]
                    })}
                    onTransactionConfirmed={async () => alert("Tier added successfully!")}
                    onError={(error) => alert(`Error: ${error.message}`)}
                >Add Tier</TransactionButton>
            </div>
        </div>
    );
}