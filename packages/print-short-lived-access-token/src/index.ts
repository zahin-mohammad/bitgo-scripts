import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import { BitGoAPI } from "@bitgo/sdk-api";

const envSchema = z.object({
  USERNAME: z.string().min(1),
  PASSWORD: z.string().min(1),
  ENV: z.union([z.literal("test"), z.literal("staging"), z.literal("prod")]),
  OTP: z.string().optional(),
});

const env = envSchema.parse(process.env);

async function main() {
  const bitgo = new BitGoAPI({ env: env.ENV });
  console.log(
    await bitgo.authenticate({
      username: env.USERNAME,
      password: env.PASSWORD,
      otp: env.OTP,
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
