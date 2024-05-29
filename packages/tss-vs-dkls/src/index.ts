import dotenv from "dotenv";
dotenv.config();
import { BitGoAPI } from "@bitgo/sdk-api";
import { Hteth } from "@bitgo/sdk-coin-eth";
import fs from "fs";
import { promisify } from "util";
import { z } from "zod";
// import tssWallet from "../tss_wallet.json";
import dklsWallet from "../dkls_wallet.json";

const writeFile = promisify(fs.writeFile);

const env = z
  .object({
    USERNAME: z.string().min(1),
    PASSWORD: z.string().min(1),
    ENV: z.union([z.literal("test"), z.literal("staging"), z.literal("prod")]),
    OTP: z.string().optional(),
    ENTERPRISE_ID: z.string(),
    WALLET_ID: z.string().optional(),
  })
  .parse(process.env);

// Metamask address
const destinatonAddress = "0xE2C5b494162bd9033283Af31e35Be27C6Ee4Bbf7";
const bitgo = new BitGoAPI({ env: env.ENV });
bitgo.register("hteth", Hteth.createInstance);

async function auth() {
  await bitgo.authenticate({
    username: env.USERNAME,
    password: env.PASSWORD,
    otp: env.OTP,
  });
  await bitgo.lock();
  await bitgo.unlock({ otp: "000000", duration: 3600 });
}

async function createWallet(tss: boolean, shouldSaveJson = false) {
  const wallet = await bitgo
    .coin("hteth")
    .wallets()
    .generateWallet({
      label: `my ${tss ? "tss" : "dkls"} wallet`,
      multisigType: "tss",
      passphrase: env.PASSWORD,
      type: "hot",
      walletVersion: tss ? 3 : 5,
      enterprise: env.ENTERPRISE_ID,
    });
  if (shouldSaveJson) {
    await writeFile(
      `${tss ? "tss" : "dkls"}_wallet.json`,
      JSON.stringify(wallet, null, 2)
    );
  }
  return wallet;
}

async function walletCreationLoop(tss: boolean, loop: number) {
  const responses = [];
  const times: number[] = [];
  for (let i = 0; i < loop; i++) {
    try {
      const start = Date.now();
      const wallet = await createWallet(tss, false);
      const end = Date.now();
      times.push(end - start);
      responses.push(wallet);
    } catch (e) {
      console.log(`error at iteration ${i} with error ${e}`);
      console.log(e);
      return;
    }
  }
  await writeFile(`${tss ? "tss" : "dkls"}_wallet_creation_loop.json`, JSON.stringify(responses, null, 2));
  printTimes(times);
}

async function signingLoop(tss: boolean, loop: number) {
  // const walletJson = tss ? tssWallet : dklsWallet;
  const walletJson = dklsWallet;
  const wallet = await bitgo
    .coin("hteth")
    .wallets()
    .get({ id: walletJson.wallet.id });
  const sendAmount = wallet.spendableBalance() ?? 0 / loop;

  const responses = [];
  const times: number[] = [];
  for (let i = 0; i < loop; i++) {
    try {
      await auth();
      const start = Date.now();
      const res = await wallet.sendMany({
        walletPassphrase: env.PASSWORD,
        recipients: [{ address: destinatonAddress, amount: sendAmount }],
        type: "transfer",
      });
      const end = Date.now();
      times.push(end - start);
      responses.push(res);
    } catch (e) {
      console.log(`error at iteration ${i} with error ${e}`);
      console.log(e);
      return;
    }
  }

  await writeFile(`${tss ? "tss" : "dkls"}_signing_loop.json`, JSON.stringify(responses, null, 2));
  printTimes(times);
}

function printTimes(times: number[]) {

  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Average time (s): ${avg / 1000}`);
  console.log(`Minimum time (s): ${min / 1000}`);
  console.log(`Maximum time (s): ${max / 1000}`);
}

async function main() {
  await auth();
  // await createWallet(true, true);
  // await createWallet(false, true);
  // await signingLoop(true, 10);
  await signingLoop(false, 10);
  // await walletCreationLoop(true, 10);
  // await walletCreationLoop(false, 10);
}

main().catch((err) => console.error(err));
