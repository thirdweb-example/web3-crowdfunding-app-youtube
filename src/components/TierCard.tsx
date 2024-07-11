import { prepareContractCall, ThirdwebContract } from "thirdweb";
import { TransactionButton } from "thirdweb/react";

type Tier = {
    name: string;
    amount: bigint;
    backers: bigint;
};

type TierCardProps = {
    tier: Tier;
    index: number;
    contract: ThirdwebContract
}

export const TierCard: React.FC<TierCardProps> = ({ tier, index, contract }) => {
    return (
        <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-row justify-between items-center">
                <p className="text-2xl font-semibold">{tier.name}</p>
                <p className="text-2xl font-semibold">${tier.amount.toString()}</p>
            </div>
            <p className="py-4">This is where a description of the funding tier is added. Information about what the users are picking can be shown here. This is not part of the contract currently.</p>
            <div className="flex flex-row justify-between items-end">
                <p>Total Backers: {tier.backers.toString()}</p>
                <TransactionButton
                    transaction={() => prepareContractCall({
                        contract: contract,
                        method: "function fund(uint256 _tierIndex) payable",
                        params: [BigInt(index)],
                        value: tier.amount,
                    })}
                    onError={(error) => alert(`Error: ${error.message}`)}
                    onTransactionConfirmed={async () => alert("Funded successfully!")}
                    style={{
                        marginTop: "1rem",
                        backgroundColor: "#2563EB",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                    }}
                >Select</TransactionButton>
            </div>
        </div>
    )
};