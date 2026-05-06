#!/usr/bin/env node

import { loadGrowthEnv, refreshGrowthReporting } from '../../src/libs/growthReporting.mjs';

async function main() {
  loadGrowthEnv();

  const startDate = process.argv[2];
  const endDate = process.argv[3];
  const result = await refreshGrowthReporting({ startDate, endDate });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
