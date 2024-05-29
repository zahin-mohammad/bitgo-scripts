import dotenv from "dotenv";
dotenv.config();
import { BitGoAPI } from "@bitgo-beta/sdk-api";
import { Hteth } from "@bitgo-beta/sdk-coin-eth";
import { z } from "zod";

const env = z
  .object({
    USERNAME: z.string().min(1),
    PASSWORD: z.string().min(1),
    ENV: z.union([z.literal("test"), z.literal("staging"), z.literal("prod")]),
    OTP: z.string().optional(),
    ENTERPRISE_ID: z.string(),
  })
  .parse(process.env);

const bitgo = new BitGoAPI({ env: env.ENV });
bitgo.register("hteth", Hteth.createInstance);
const coin = bitgo.coin("hteth");

async function auth() {
  await bitgo.authenticate({
    username: env.USERNAME,
    password: env.PASSWORD,
    otp: env.OTP,
  });
}

async function main() {
  await auth();
  const rest = await bitgo
    .get(bitgo.microservicesUrl("/api/v2/tss/settings"))
    .result();
  console.log(JSON.stringify(rest, null, 2));
  const keychains = await coin.keychains().createMpc({
    multisigType: "tss",
    passphrase: env.PASSWORD,
    enterprise: env.ENTERPRISE_ID,
    // walletVersion: 5,
  });
  console.log(keychains);
}

main().catch((err) => console.error(err));
