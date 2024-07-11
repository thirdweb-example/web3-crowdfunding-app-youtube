'use client';
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { baseSepolia } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { CampaignCard } from "@/components/CampaignCard";

export default function Home() {
  // Get CrowdfundingFactory contract
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: "0x0Db0C14e714c66D7a5E6647Beda888D0E6a6081A",
  });

  // Get all campaigns deployed with CrowdfundingFactory
  const {data: campaigns, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useReadContract({
    contract: contract,
    method: "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name)[])",
    params: []
  });

  return (
    <main className="pb-10 min-h-[90vh] flex items-start justify-start container max-w-screen-lg mx-auto">
      <div className="py-10">
        <div className="grid grid-cols-3 gap-4">
          {!isLoadingCampaigns && campaigns && (
            campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaignAddress}
                  campaign={campaign}
                />
              ))
            ) : (
              <p>No Campaigns</p>
            )
          )}
        </div>
      </div>
    </main>
  );
}
