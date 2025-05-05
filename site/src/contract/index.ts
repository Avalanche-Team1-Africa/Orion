
import { Errors, MyError } from "@/constants/errors";
import "../../envConfig";
import Web3 from "web3";
import {CONTRACT_ABI, CONTRACT_ADDRESS} from "./abi/constants";

import 'dotenv/config'
interface CreateStockTokenArgs {
    symbol: string;
    name: string;
    totalShares: number;
}
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
        if (!process.env.PRIVATEKEY) {
            console.error("Set PRIVATEKEY in env");
            throw new MyError(Errors.INVALID_SETUP);
        }

        this.web3 = new Web3("https://rpc.ankr.com/avalanche_fuji");
        this.account = this.web3.eth.accounts.wallet.add(process.env.PRIVATEKEY);
        this.avalancheContract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    }

    async createStock(args: CreateStockTokenArgs): Promise<string> {
        console.log(args); 
        // const client: Client = Client.forTestnet();
        try {
            //     // Your account ID and private key from string value
            //     const MY_ACCOUNT_ID = AccountId.fromString(this.accountID);
            //     const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(this.privateKey);
            //     //Set the operator with the account ID and private key
            //     client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
            //     //Create the transaction and freeze for manual signing
            //     const txTokenCreate = new TokenCreateTransaction()
            //         .setTokenName(args.name)
            //         .setTokenSymbol(args.symbol)
            //         .setTokenType(TokenType.FungibleCommon)
            //         .setTreasuryAccountId(MY_ACCOUNT_ID)
            //         .setFreezeDefault(false)
            //         .setInitialSupply(args.totalShares)
            //         .freezeWith(client);
            //     //Sign the transaction with the token treasury account private key
            //     const signTxTokenCreate = await txTokenCreate.sign(MY_PRIVATE_KEY);
            //     //Sign the transaction with the client operator private key and submit to a Hedera network
            //     const txTokenCreateResponse = await signTxTokenCreate.execute(client);
            //     //Get the receipt of the transaction
            //     const receiptTokenCreateTx = await txTokenCreateResponse.getReceipt(client);
            //     //Get the token ID from the receipt
            //     const tokenId = receiptTokenCreateTx.tokenId!;
            //     return tokenId.toString()
            throw new MyError("Not Implemented");
        }
        catch (error) {
            console.error("Error creating stock token:", error);
            throw error;
        }
        finally {
            // if (client) client.close();
        }
    }

    async buyStock(args: BuyTokenArgs): Promise<string> {
        console.log(args);
        try {
            const txReceipt = await this.avalancheContract.methods.buyShare(

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
