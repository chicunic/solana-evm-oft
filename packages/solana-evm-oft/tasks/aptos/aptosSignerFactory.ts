import {
  OmniPoint,
  OmniSigner,
  OmniTransaction,
  OmniTransactionReceipt,
  OmniTransactionResponse,
  formatEid,
} from "@layerzerolabs/devtools";
import { ChainType, EndpointId, endpointIdToChainType } from "@layerzerolabs/lz-definitions";

export function createAptosSignerFactory(): (eid: EndpointId) => Promise<OmniSigner> {
  return function (eid: EndpointId): Promise<OmniSigner> {
    if (endpointIdToChainType(eid) !== ChainType.APTOS && endpointIdToChainType(eid) !== ChainType.INITIA) {
      return Promise.reject(new Error(`createAptosSignerFactory() called with Move VM EID: ${formatEid(eid)}`));
    }

    const aptosSigner: OmniSigner = {
      // The devtools signature requires these members:
      eid,
      getPoint: () => {
        const point: OmniPoint = {
          eid,
          address: "0x0",
        };
        return point;
      },

      // sign(omniTx): stub that pretends to return signed BCS bytes as a hex string
      sign: (_omniTx: OmniTransaction): Promise<string> => {
        return Promise.resolve("0x0");
      },

      // signAndSend(omniTx): stub that pretends the transaction was submitted
      signAndSend: (_omniTx: OmniTransaction): Promise<OmniTransactionResponse> => {
        return Promise.resolve({
          transactionHash: "0x0",
          wait: (_confirmations?: number): Promise<OmniTransactionReceipt> => {
            return Promise.resolve({ transactionHash: "0x0" });
          },
        });
      },
    };

    return Promise.resolve(aptosSigner);
  };
}
