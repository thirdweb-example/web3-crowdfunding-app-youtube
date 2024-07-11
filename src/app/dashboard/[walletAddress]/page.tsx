'use client';
import { client } from "@/app/client";
import { MyCampaignCard } from "@/components/MyCampaignCard";
import { useState } from "react";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { deployPublishedContract } from "thirdweb/deploys";
import { useActiveAccount, useReadContract } from "thirdweb/react"

export default function DashboardPage() {
    const account = useActiveAccount();
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const contract = getContract({
        client: client,
        chain: baseSepolia,
        address: "0x0Db0C14e714c66D7a5E6647Beda888D0E6a6081A",
    });

    // Get Campaigns
    const { data: myCampaigns, isLoading: isLoadingMyCampaigns, refetch } = useReadContract({
        contract: contract,
        method: "function getUserCampaigns(address _user) external view returns (address[] memory)",
        params: [account?.address as string]
    });
    
    return (
        <div className="mx-auto max-w-7xl px-4 mt-4 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center mb-8">
                <p className="text-4xl font-semibold">Dashboard</p>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => setIsModalOpen(true)}
                >Create Campaign</button>
            </div>
            <p className="text-2xl font-semibold mb-4">My Campaigns:</p>
            <div className="grid grid-cols-3 gap-4">
                {!isLoadingMyCampaigns && (
                    myCampaigns && myCampaigns.length > 0 ? (
                        myCampaigns.map((campaign, index) => (
                            <MyCampaignCard
                                key={index}
                                contractAddress={campaign}
                            />
                        ))
                    ) : (
                        <p>No campaigns</p>
                    )
                )}
            </div>
            
            {isModalOpen && (
                <CreateCampaignModal
                    setIsModalOpen={setIsModalOpen}
                    refetch={refetch}
                />
            )}
        </div>
    )
}

type CreateCampaignModalProps = {
    setIsModalOpen: (value: boolean) => void
    refetch: () => void
}

const CreateCampaignModal = (
    { setIsModalOpen, refetch }: CreateCampaignModalProps
) => {
    const account = useActiveAccount();
    const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);
    const [campaignName, setCampaignName] = useState<string>("");
    const [campaignGoal, setCampaignGoal] = useState<number>(0);
    
    // Deploy contract from CrowdfundingFactory
    const handleDeployContract = async () => {
        setIsDeployingContract(true);
        try {
            console.log("Deploying contract...");
            const contractAddress = await deployPublishedContract({
                client: client,
                chain: baseSepolia,
                account: account!,
                contractId: "Crowdfunding",
                contractParams: [
                    campaignName,
                    campaignGoal,
                ],
                publisher: "0xEe29620D0c544F00385032dfCd3Da3f99Affb8B2"
            });
        } catch (error) {
            console.error(error);
        } finally {
            alert("Contract deployed successfully!");
            setIsDeployingContract(false);
            setIsModalOpen(false);
            refetch
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
            <div className="w-1/4 bg-slate-900 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Create a Campaign</p>
                    <button
                        className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
                        onClick={() => setIsModalOpen(false)}
                    >Close</button>
                </div>
                <div className="flex flex-col">
                    <label>Campaign Name:</label>
                    <input 
                        type="text" 
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Campaign Name"
                        className="mb-4 px-4 py-2 bg-slate-800 text-white rounded-md"
                    />
                    <label>Campaign Goal:</label>
                    <input 
                        type="number"
                        value={campaignGoal}
                        onChange={(e) => setCampaignGoal(parseInt(e.target.value))}
                        className="mb-4 px-4 py-2 bg-slate-800 text-white rounded-md"
                    />
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={handleDeployContract}
                    >{
                        isDeployingContract ? "Creating Campaign..." : "Create Campaign"
                    }</button>
                </div>
            </div>
        </div>
    )
}