import { z } from 'zod';

export const TokenSchema = z.object({
    assetName: z.string(),
    supply: z.number(),
})