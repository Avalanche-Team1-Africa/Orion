import {
  Lucid,
  Blockfrost,
  NativeScript,
  getAddressDetails,
  fromText,
} from "lucid-cardano-nextjs";
import invariant from "tiny-invariant";
import "dotenv/config";

const MINTER_SEED = process.env.MINTER_SEED!;
const BLOCKFROST_APIKEY = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_PREPROD!;
const OWNER_KEY = process.env.OWNER_KEY!;

if (!MINTER_SEED || !BLOCKFROST_APIKEY || !OWNER_KEY) {
  throw new Error("Missing environment variables");
}
export const loadLucid = async (wallet: string, blockfrostApiKey: string) => {
    try {
        const network = blockfrostApiKey.substring(0, 7);
        invariant(network);
        const lucid = await Lucid.new(
            new Blockfrost(
                `https://cardano-preprod.blockfrost.io/api/v0`,
                blockfrostApiKey
            ),
            "Preprod"
        );

    if (wallet.includes(" ")) {
      lucid.selectWalletFromSeed(wallet);
    } else {
      lucid.selectWalletFromPrivateKey(wallet);
    }
    return lucid;
  } catch (error) {
    console.error("Error loading Lucid", error);
    throw error;
  }
};

const getKeyHash = (address: string) => {
  try {
    const { paymentCredential } = getAddressDetails(address);
    invariant(paymentCredential);
    return paymentCredential.hash;
  } catch (error) {
    console.error("Error getting key hash", error);
    throw error;
  }
};
const loadMintingPolicy = async (ownerHash: string, minter: Lucid) => {
  // linting fix
  console.log(minter);
  try {
    const jsonData: NativeScript = {
      type: "all",
      scripts: [
        // {
        //     "type": "before",
        //     "slot": Number(minter.utils.unixTimeToSlot(Date.now() + 3600 * 1000))
        // },
        {
          type: "sig",
          keyHash: ownerHash,
        },
      ],
    };
    return jsonData;
  } catch (error) {
    console.error("Error loading minting policy", error);
    throw error;
  }
};
export const mintAsset = async (assetName: string, amount: number) => {
  try {
    const minter = await loadLucid(MINTER_SEED, BLOCKFROST_APIKEY);
    const owner = await loadLucid(OWNER_KEY, BLOCKFROST_APIKEY);
    const [address, ownerUtxos, utxos, minterAddress] = await Promise.all([
      owner.wallet.address(),
      owner.wallet.getUtxos(),
      minter.wallet.getUtxos(),
      minter.wallet.address(),
    ]);

        invariant(utxos.length, `${minterAddress} needs to be funded`);
        invariant(ownerUtxos.length, `${address} needs to be funded`);
        const ownerHash = getKeyHash(address);
        const mintingPolicy = await loadMintingPolicy(ownerHash, minter);
        const script = minter.utils.nativeScriptFromJson(mintingPolicy);
        const policyId = minter.utils.mintingPolicyToId(script);
        const fullAssetName = policyId + fromText(assetName);
        const tx = await minter
            .newTx()
            .mintAssets({
                [fullAssetName]: BigInt(amount),
            })
            .payToAddress(minterAddress, {
                [fullAssetName]: BigInt(amount), lovelace: BigInt(1000000)
            })
            .addSignerKey(ownerHash)
            .attachMintingPolicy(script)
            .complete()
        const signedTx = await tx
            .signWithPrivateKey(OWNER_KEY)
            .sign()
            .complete();

        await signedTx.submit();
        return fullAssetName;
    }
    catch (error) {
        console.error("Error minting token:", error);
        throw error;
    }

}
