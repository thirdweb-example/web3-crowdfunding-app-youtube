import Link from "next/link";

type Campaign = {
    campaignAddress: string;
    owner: string;
    name: string;
};

type CampaignCardProps = {
    campaign: Campaign;
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
    return (
        <Link
            href={`/campaign/${campaign.campaignAddress}`}
            passHref={true}
        >
            <div
                className="border border-gray-200 rounded-md p-4 cursor-pointer mb-4"
            >
                <h2>{campaign.name}</h2>
                <p>Address: {campaign.campaignAddress}</p>
            </div>
        </Link>
    )
};