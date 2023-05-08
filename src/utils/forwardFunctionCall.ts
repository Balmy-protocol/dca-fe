import { ethers } from 'ethers';

interface Permissions {
  operator: string;
  permissions: number[];
}

export const getForwardFunctionCallHelper = (
  from: string,
  to: string,
  amountOfSwaps: ethers.BigNumber,
  swapInterval: ethers.BigNumber,
  owner: string,
  permissions: Permissions[]
) => {
  const { defaultAbiCoder } = ethers.utils;
  const encodedData = defaultAbiCoder.encode(
    ['address', 'address', 'uint256', 'uint32', 'address', 'tuple(address operator,uint256[] permissions)[]'],
    [from, to, amountOfSwaps, swapInterval, owner, permissions]
  );
  return encodedData;
};
