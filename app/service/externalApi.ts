import {
  getTokenscriptMetadata,
  TsMetadata,
} from "../libs/tokenscript/ts-metadata";

export const getMetadata = async (
  chain: number,
  address: `0x${string}`,
  entry?: number
) => {
  console.log("###", chain, address);
  const tsMetadata: TsMetadata = await getTokenscriptMetadata(
    chain,
    address,
    {
      actions: true,
    },
    0,
    entry
  );
  return tsMetadata;
};
