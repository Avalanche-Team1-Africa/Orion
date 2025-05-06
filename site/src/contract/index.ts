
import { Errors, MyError } from "@/constants/errors";
import "../../envConfig";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./abi/constants";

import 'dotenv/config'
import { CardanoToken } from "@/types/token";
import { mintAsset } from "@/cardano/serializer";

interface BuyTokenArgs {
    tokenId: string;
    userWalletAddress: string;
    amount: number;
}
export class SmartContract {
    private web3: Web3
    private account;
    private avalancheContract;
    // private accountID: string;
    // private privateKey: string;

    constructor() {
        if (!process.env.PRIVATEKEY || !process.env.RPC_URL) {
            console.error("Set PRIVATEKEY and RPC_URL in env");
            throw new MyError(Errors.INVALID_SETUP);
        }

        this.web3 = new Web3(process.env.RPC_URL);
        const account = this.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATEKEY);
        this.account = this.web3.eth.accounts.wallet.add(account);
        this.avalancheContract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    }

    // Creates stock in cardano
    async createStockOnCardano(args: CardanoToken): Promise<string> {
        try {
            const { assetName, supply } = args;
            const tokenId = await mintAsset(assetName, supply);
            //linting fix
            console.log("token id=>", tokenId);
            return tokenId;
        }
        catch (error) {
            console.error("Error creating stock token in Cardano:", error);
            throw error;
        }
    }

    async buyStockAvalanche(args: BuyTokenArgs): Promise<string> {
        console.log(args);
        try {
            const amount = BigInt(args.amount);
            const tokenID = BigInt(Number.parseInt(args.tokenId));
            
            const txReceipt = await this.avalancheContract.methods.buyShare(
                tokenID,
                amount,
                args.userWalletAddress
            ).send({
                from: this.account[0].address,
                gas: "1000000",
                gasPrice: '10000000000',
            });

            return txReceipt.transactionHash;
        }
        catch (error) {
            console.error("Error buying stock:", error);
            throw error;
        }
    }

    async transferAVAX(args: { userAddress: string, amount: number }) {
        try {
            const tx = {
                from: this.account[0].address,
                to: args.userAddress,
                value: this.web3.utils.toWei(args.amount.toString(), 'ether'),
            };

            // send the transaction
            const txReceipt = await this.web3.eth.sendTransaction(tx);
            return txReceipt.transactionHash;
        }
        catch (error) {
            console.error("Error transferring Hbar:", error);
            throw error;
        }
    }
}
const smartContract = new SmartContract();
export default smartContract;
