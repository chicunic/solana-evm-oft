import { Bytes, OmniAddress, OmniPoint, OmniTransaction } from "@layerzerolabs/devtools";
import { ChainType, EndpointId, endpointIdToChainType } from "@layerzerolabs/lz-definitions";
import { IOApp, OAppEnforcedOptionParam } from "@layerzerolabs/ua-devtools";

import { AptosEndpointV2 } from "./aptosEndpointV2";

export function createAptosOAppFactory() {
  return function (point: OmniPoint): Promise<IOApp> {
    const supportedChaintypes = [ChainType.APTOS, ChainType.INITIA];
    if (!supportedChaintypes.includes(endpointIdToChainType(point.eid))) {
      return Promise.reject(
        new Error(`Aptos SDK factory can only create SDKs for Aptos networks. Received EID ${point.eid}.`),
      );
    }

    const createStubTransaction = (description: string): OmniTransaction => ({
      point,
      data: `0x`,
      description: `[APTOS STUB] ${description}`,
    });

    return Promise.resolve({
      point,
      getOwner(): Promise<OmniAddress | undefined> {
        return Promise.resolve(undefined);
      },
      hasOwner(_owner: OmniAddress): Promise<boolean> {
        return Promise.resolve(false);
      },
      setOwner(owner: OmniAddress): Promise<OmniTransaction> {
        return Promise.resolve(createStubTransaction(`setOwner(${owner})`));
      },
      getEndpointSDK() {
        return Promise.resolve(new AptosEndpointV2(point));
      },
      getPeer(_eid: EndpointId): Promise<OmniAddress | undefined> {
        return Promise.resolve(undefined);
      },
      hasPeer(_eid: EndpointId, _peer: OmniAddress): Promise<boolean> {
        return Promise.resolve(false);
      },
      setPeer(eid: EndpointId, peer: OmniAddress | null | undefined): Promise<OmniTransaction> {
        return Promise.resolve(createStubTransaction(`setPeer(${eid}, ${peer})`));
      },
      getDelegate(): Promise<OmniAddress | undefined> {
        return Promise.resolve(undefined);
      },
      setDelegate(address: OmniAddress): Promise<OmniTransaction> {
        return Promise.resolve(createStubTransaction(`setDelegate(${address})`));
      },
      isDelegate(): Promise<boolean> {
        return Promise.resolve(false);
      },
      getEnforcedOptions(): Promise<Bytes> {
        // The stub returns an empty object rather than option bytes, hence the cast
        return Promise.resolve({} as Bytes);
      },
      setEnforcedOptions(enforcedOptions: OAppEnforcedOptionParam[]): Promise<OmniTransaction> {
        return Promise.resolve(createStubTransaction(`setEnforcedOptions(${enforcedOptions.length} options)`));
      },
      getCallerBpsCap(): Promise<bigint | undefined> {
        return Promise.resolve(BigInt(0));
      },
      setCallerBpsCap(callerBpsCap: bigint): Promise<OmniTransaction | undefined> {
        return Promise.resolve(createStubTransaction(`setCallerBpsCap(${callerBpsCap})`));
      },
    });
  };
}
