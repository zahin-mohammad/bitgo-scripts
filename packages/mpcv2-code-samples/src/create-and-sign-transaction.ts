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
    WALLET_ID: z.string(),
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
  await bitgo.lock();
  await bitgo.unlock({ otp: "000000", duration: 3600 });
}

async function main() {
  await auth();

  const destinatonAddress = "0xE2C5b494162bd9033283Af31e35Be27C6Ee4Bbf7";
  const wallet = await coin.wallets().get({ id: env.WALLET_ID });
  const sendAmount = wallet.spendableBalance() ?? 0;

  const res = await wallet.sendMany({
    walletPassphrase: env.PASSWORD,
    recipients: [{ address: destinatonAddress, amount: sendAmount }],
    type: "transfer",
  });
  console.log(res);
}

main().catch((err) => console.error(err));
