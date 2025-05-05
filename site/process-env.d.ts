declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BLOCKFROST_APIKEY: string;
            MINTER_SEED: string;
            OWNER_KEY: string;
        }
    }
}