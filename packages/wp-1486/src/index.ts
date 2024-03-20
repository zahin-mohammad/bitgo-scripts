import fs from "fs";
import readline from "readline";

const publicIdInLogRegexp = /.*(\/)([0-9a-z]{32,32})(\?|\/)/g;

async function main() {
  const fileStream = fs.createReadStream("api.csv");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const publicIds = new Set<string>();
  for await (const line of rl) {
    const match = publicIdInLogRegexp.exec(line);
    if (match) {
      const publicId = match[2];
      if (publicId) {
        publicIds.add(publicId);
      }
    }
  }
  console.log(`Found ${publicIds.size} unique publicIds`);

  fs.writeFile(
    "publicIds.json",
    JSON.stringify(Array.from(publicIds), null, 2),
    (err) => {
      if (err) {
        throw err;
      }
      console.log("The file has been saved!");
    }
  );
}

main().catch((err) => console.error(err));
