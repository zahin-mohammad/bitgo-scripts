import dotenv from "dotenv";
dotenv.config();
import { BitGoAPI } from "@bitgo/sdk-api";
import { Hteth } from "@bitgo/sdk-coin-eth";
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
  const keychains = await coin.keychains().createMpc({
    multisigType: "tss",
    passphrase: env.PASSWORD,
    enterprise: env.ENTERPRISE_ID,
  });
  console.log(keychains);
  /**
   * Note: the userKeychain and backupKeychain have a very large encryptedPrv
   * Note: there is a new field called "reducedEncryptedPrv" which is what exists on the key-card when the keys are created in the app
   * Or if the result of this is passed into the @bitgo/key-card package
   */
}

main().catch((err) => console.error(err));
