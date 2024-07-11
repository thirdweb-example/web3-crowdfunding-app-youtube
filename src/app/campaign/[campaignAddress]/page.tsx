'use client';
import { client } from "@/app/client";
import { TierCard } from "@/components/TierCard";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";

export default function CampaignPage() {
    const account = useActiveAccount();
    const { campaignAddress } = useParams();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

    // Get owner of the campaign
    const { data: owner, isLoading: isLoadingOwner } = useReadContract({
        contract: contract,
        method: "function owner() view returns (address)",
        params: [],
    });
    
    return (
        <div className="mx-auto max-w-7xl px-2 mt-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center">
                {!isLoadingName && (
                    <p className="text-4xl font-semibold">{name}</p>
                )}
                {owner === account?.address && (
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={() => setIsEditing(!isEditing)}
                    >{isEditing ? "Done" : "Edit"}</button>
                )}
            </div>
            
            <div className="my-4">
                <p className="text-lg font-semibold">Description:</p>
                <p>This is where the campaign description can go. Right now this data is not being stored in the contract though.</p>
            </div>
            {!isLoadingBalance && (
                <div className="mb-4">
                    <p className="text-lg font-semibold">Campaign Goal:</p>
                    <div className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="h-6 bg-blue-600 rounded-full dark:bg-blue-500 text-right" style={{ width: `${balance?.toString()}%`}}>
                            <p className="text-white dark:text-white text-xs p-1">${balance?.toString()}</p>
                        </div>
                        <p className="absolute top-0 right-0 text-white dark:text-white text-xs p-1">${goal?.toString()}</p>
                    </div>
                </div>
                
            )}
            <div>
                <p className="text-lg font-semibold">Tiers:</p>
                <div className="grid grid-cols-3 gap-4">
                    {isLoadingTiers ? (
                        <p >Loading...</p>
                    ) : (
                        tiers && tiers.length > 0 ? (
                            tiers.map((tier, index) => (
                                <TierCard
                                    key={index}
                                    tier={tier}
                                    index={index}
                                    contract={contract}
                                />
                            ))
                        ) : (
                            !isEditing && (
                                <p>No tiers available</p>
                            )
                        )
                    )}
                    {isEditing && (
                        // Add a button card with text centered in the middle
                        <div
                            className="max-w-sm max-h-100 flex justify-center items-center"
                        >
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                onClick={() => setIsModalOpen(true)}
                            >+ Add Tier</button>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                    contract={contract}
                />
            )}
        </div>
    );
}

type CreateTierModalProps = {
    setIsModalOpen: (value: boolean) => void
    contract: ThirdwebContract
}

const CreateCampaignModal = (
    { setIsModalOpen, contract }: CreateTierModalProps
) => {
    const [tierName, setTierName] = useState<string>("");
    const [tierAmount, setTierAmount] = useState<bigint>(0n);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/4 bg-slate-900 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Create a Funding Tier</p>
                    <button
                        className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col">
                    <label>Tier Name:</label>
                    <input 
                        type="text" 
                        value={tierName}
                        onChange={(e) => setTierName(e.target.value)}
                        placeholder="Tier Name"
                        className="mb-4 px-4 py-2 bg-slate-800 text-white rounded-md"
                    />
                    <label>Tier Cost:</label>
                    <input 
                        type="number"
                        value={parseInt(tierAmount.toString())}
                        onChange={(e) => setTierAmount(BigInt(e.target.value))}
                        className="mb-4 px-4 py-2 bg-slate-800 text-white rounded-md"
                    />
                    <TransactionButton
                        transaction={() => prepareContractCall({
                            contract: contract,
                            method: "function addTier(string _tierName, uint256 _amount)",
                            params: [tierName, tierAmount]
                        })}
                        onTransactionConfirmed={async () => {
                            alert("Tier added successfully!")
                            setIsModalOpen(false)
                        }}
                        onError={(error) => alert(`Error: ${error.message}`)}
                    >Add Tier</TransactionButton>
                </div>
            </div>
        </div>
    )
}