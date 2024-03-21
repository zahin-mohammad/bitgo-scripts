import fs from "fs";
import { promisify } from "util";

type Query = {
  attr: {
    durationMillis: number;
  };
};

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// const bucketNames = [
//     "lessThan2500",
//     "2500to5000",
//     "5000to7500",
//     "greaterThan7500",
// ] as const;

// type BucketName = typeof bucketNames[number];

export enum BucketName {
  lessThan2500 = "lessThan2500",
  "2500to5000" = "2500to5000",
  "5000to7500" = "5000to7500",
  "greaterThan7500" = "greaterThan7500",
}
async function main() {
  const data = await readFile("slow_queries.json", "utf8");
  const queries: Query[] = JSON.parse(data);
  const buckets: {
    [key in BucketName]: Query[];
  } = {
    lessThan2500: [],
    "2500to5000": [],
    "5000to7500": [],
    greaterThan7500: [],
  };

  queries.forEach((query: Query) => {
    if (query.attr.durationMillis < 2500) {
      buckets.lessThan2500.push(query);
    } else if (query.attr.durationMillis < 5000) {
      buckets["2500to5000"].push(query);
    } else if (query.attr.durationMillis < 7500) {
      buckets["5000to7500"].push(query);
    } else {
      buckets.greaterThan7500.push(query);
    }
  });

  for (const bucketName in buckets) {
    const bucketData = buckets[bucketName as BucketName];
    await writeFile(`slow_queries_${bucketName}.json`, JSON.stringify(bucketData, null, 2));
    console.log(`The file ${bucketName}.json has been saved with ${bucketData.length} entries!`);
  }
}

main().catch((err) => console.error(err));
