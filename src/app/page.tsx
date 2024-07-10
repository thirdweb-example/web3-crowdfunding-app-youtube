'use client';
import Image from "next/image";
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { deployPublishedContract } from "thirdweb/deploys";
import { baseSepolia } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { useState } from "react";
import { CampaignCard } from "@/components/CampaignCard";

export default function Home() {
  const account = useActiveAccount();
  const [isDeployingContract, setIsDeployingContract] = useState<boolean>(false);
  const [verifiedContracts, setVerifiedContracts] = useState<string[]>([]);

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
          "Test Crowdfunding",
          100,
        ],
        publisher: "0xEe29620D0c544F00385032dfCd3Da3f99Affb8B2"
      });
    } catch (error) {
      console.error(error);
    } finally {
      alert("Contract deployed successfully!");
      setIsDeployingContract(false);
      refetchCampaigns();
    }
  };

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
  console.log(campaigns);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
          />
          <button
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleDeployContract}
          >{
            isDeployingContract ? "Deploying Contract..." : "Deploy Contract"
          }</button>
        </div>

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
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Crowdfunding App
      </h1>
    </header>
  );
}
