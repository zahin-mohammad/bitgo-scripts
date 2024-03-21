import fs from "fs";
import { promisify } from "util";

type Query = {
  attr: {
    durationMillis: number;
    ns: string;
  };
};

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export enum BucketName {
  lessThan2500 = "lessThan2500",
  "2500to5000" = "2500to5000",
  "5000to7500" = "5000to7500",
  "greaterThan7500" = "greaterThan7500",
}
export type NSBucket = `${BucketName}-${string}`;

async function main() {
  const data = await readFile("slow_queries.json", "utf8");
  const queries: Query[] = JSON.parse(data);

  const buckets: {
    [key in `${BucketName}-${string}`]: Query[];
  } = {};

  queries.forEach((query: Query) => {
    const ns = query.attr.ns;
    const duration = query.attr.durationMillis;

    let bucketName: BucketName;
    if (duration < 2500) {
      bucketName = BucketName.lessThan2500;
    } else if (duration < 5000) {
      bucketName = BucketName["2500to5000"];
    } else if (duration < 7500) {
      bucketName = BucketName["5000to7500"];
    } else {
      bucketName = BucketName.greaterThan7500;
    }

    const key: NSBucket = `${bucketName}-${ns}`;
    if (!buckets[key]) {
      buckets[key] = [];
    }
    buckets[key]?.push(query);
  });

  for (const bucketName in buckets) {
    const bucketData = buckets[bucketName as NSBucket];
    if (!bucketData) {
      continue;
    }
    await writeFile(
      `slow_queries_${bucketName}.json`,
      JSON.stringify(bucketData, null, 2)
    );
    console.log(
      `The file ${bucketName}.json has been saved with ${bucketData.length} entries!`
    );
  }
}

main().catch((err) => console.error(err));
