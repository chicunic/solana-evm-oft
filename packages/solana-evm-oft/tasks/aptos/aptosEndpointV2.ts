import { OmniAddress, OmniPoint, OmniTransaction } from "@layerzerolabs/devtools";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import {
  IEndpointV2,
  IUln302,
  IUlnRead,
  MessageParams,
  MessagingFee,
  SetConfigParam,
  Timeout,
  Uln302ConfigType,
  Uln302ExecutorConfig,
  Uln302SetExecutorConfig,
  Uln302SetUlnConfig,
  Uln302UlnConfig,
  Uln302UlnUserConfig,
  UlnReadSetUlnConfig,
  UlnReadUlnConfig,
  UlnReadUlnUserConfig,
} from "@layerzerolabs/protocol-devtools";

/**
 * Minimal "AptosEndpointV2" skeleton that implements IEndpointV2 for Aptos.
 * All methods here return placeholder or dummy values for now.
 */
export class AptosEndpointV2 implements IEndpointV2 {
  // The devtools often expect the "point" property from IOmniSDK
  public point: OmniPoint;

  constructor(point: OmniPoint) {
    this.point = point;
  }

  //
  // ----------------------------------------------------------
  //  Required by IOmniSDK (the base) or the IEndpointV2 extension
  // ----------------------------------------------------------

  isBlockedLibrary(_uln: OmniAddress): Promise<boolean> {
    return Promise.resolve(false);
  }

  // The devtools might call this to fetch a "Uln302" object.
  // For now, return a dummy object that implements IUln302
  getUln302SDK(_address: OmniAddress): Promise<IUln302> {
    return Promise.resolve({
      point: this.point,
      // placeholders to avoid compile errors:
      getUlnConfig(
        _eid: EndpointId,
        _address: OmniAddress | null | undefined,
        _type: Uln302ConfigType,
      ): Promise<Uln302UlnConfig> {
        return Promise.resolve({} as Uln302UlnConfig);
      },
      getAppUlnConfig(_eid: EndpointId, _address: OmniAddress, _type: Uln302ConfigType): Promise<Uln302UlnConfig> {
        return Promise.resolve({} as Uln302UlnConfig);
      },
      hasAppUlnConfig(
        _eid: EndpointId,
        _oapp: OmniAddress,
        _config: Uln302UlnUserConfig,
        _type: Uln302ConfigType,
      ): Promise<boolean> {
        return Promise.resolve(false);
      },
      setDefaultUlnConfig(_eid: EndpointId, _config: Uln302UlnUserConfig): Promise<OmniTransaction> {
        return Promise.resolve<OmniTransaction>({
          point: this.point,
          data: "0x00",
        });
      },
      getExecutorConfig(_eid: EndpointId, _address?: OmniAddress | null): Promise<Uln302ExecutorConfig> {
        return Promise.resolve({
          maxMessageSize: 1024,
          executor: "0x0",
        });
      },
      getAppExecutorConfig(_eid: EndpointId, _address: OmniAddress): Promise<Uln302ExecutorConfig> {
        return Promise.resolve({
          maxMessageSize: 1024,
          executor: "0x0",
        });
      },
      hasAppExecutorConfig(_eid: EndpointId, _oapp: OmniAddress, _config: Uln302ExecutorConfig): Promise<boolean> {
        return Promise.resolve(false);
      },
      setDefaultExecutorConfig(_eid: EndpointId, _config: Uln302ExecutorConfig): Promise<OmniTransaction> {
        return Promise.resolve<OmniTransaction>({
          point: this.point,
          data: "0x00",
        });
      },
    });
  }

  // The devtools might call this to fetch a "UlnRead" object.
  // For now, return a dummy object that implements IUlnRead
  getUlnReadSDK(_address: OmniAddress): Promise<IUlnRead> {
    return Promise.resolve({
      point: this.point,
      getUlnConfig(_channelId: number, _address: OmniAddress | null | undefined): Promise<UlnReadUlnConfig> {
        // The stub omits the DVN count fields on purpose, hence the cast through unknown
        return Promise.resolve({
          executor: "0x0",
          requiredDVNs: [],
          optionalDVNs: [],
          optionalDVNThreshold: 0,
        } as unknown as UlnReadUlnConfig);
      },
      getAppUlnConfig(_channelId: number, _address: OmniAddress): Promise<UlnReadUlnConfig> {
        // The stub omits the DVN count fields on purpose, hence the cast through unknown
        return Promise.resolve({
          executor: "0x0",
          requiredDVNs: [],
          optionalDVNs: [],
          optionalDVNThreshold: 0,
        } as unknown as UlnReadUlnConfig);
      },
      hasAppUlnConfig(_channelId: number, _oapp: OmniAddress, _config: UlnReadUlnUserConfig): Promise<boolean> {
        return Promise.resolve(false);
      },
      setDefaultUlnConfig(_channelId: number, _config: UlnReadUlnUserConfig): Promise<OmniTransaction> {
        return Promise.resolve<OmniTransaction>({
          point: this.point,
          data: "0x00",
        });
      },
    });
  }

  //
  // ----------------------------------------------------------
  //  Required by IEndpointV2 specifically
  // ----------------------------------------------------------

  getDelegate(_oapp: OmniAddress): Promise<OmniAddress | undefined> {
    return Promise.resolve(undefined);
  }

  isDelegate(_oapp: OmniAddress, _delegate: OmniAddress): Promise<boolean> {
    return Promise.resolve(false);
  }

  getDefaultReceiveLibrary(_eid: EndpointId): Promise<OmniAddress | undefined> {
    return Promise.resolve(undefined);
  }

  setDefaultReceiveLibrary(_eid: EndpointId, _uln: OmniAddress, _gracePeriod?: bigint): Promise<OmniTransaction> {
    return Promise.resolve<OmniTransaction>({
      point: this.point,
      data: "0x00",
    });
  }

  getDefaultSendLibrary(_eid: EndpointId): Promise<OmniAddress | undefined> {
    return Promise.resolve(undefined);
  }

  setDefaultSendLibrary(_eid: EndpointId, _uln: OmniAddress): Promise<OmniTransaction> {
    return Promise.resolve<OmniTransaction>({
      point: this.point,
      data: "0x00",
    });
  }

  isRegisteredLibrary(_uln: OmniAddress): Promise<boolean> {
    return Promise.resolve(false);
  }

  registerLibrary(_uln: OmniAddress): Promise<OmniTransaction> {
    return Promise.resolve<OmniTransaction>({
      point: this.point,
      data: "0x00",
    });
  }

  getSendLibrary(_sender: OmniAddress, _dstEid: EndpointId): Promise<OmniAddress | undefined> {
    return Promise.resolve("0x0");
  }

  getReceiveLibrary(_receiver: OmniAddress, _srcEid: EndpointId): Promise<[OmniAddress | undefined, boolean]> {
    return Promise.resolve<[OmniAddress | undefined, boolean]>(["0x0", false]);
  }

  getDefaultReceiveLibraryTimeout(_eid: EndpointId): Promise<Timeout> {
    return Promise.resolve({ lib: "0x0", expiry: BigInt(0) });
  }

  getReceiveLibraryTimeout(_receiver: OmniAddress, _srcEid: EndpointId): Promise<Timeout> {
    return Promise.resolve({ lib: "0x0", expiry: BigInt(0) });
  }

  setSendLibrary(_oapp: OmniAddress, _eid: EndpointId, _uln: OmniAddress): Promise<OmniTransaction> {
    return Promise.resolve<OmniTransaction>({
      point: this.point,
      data: "0x00",
    });
  }

  isDefaultSendLibrary(_sender: OmniAddress, _dstEid: EndpointId): Promise<boolean> {
    return Promise.resolve(false);
  }

  setReceiveLibrary(
    _oapp: OmniAddress,
    _eid: EndpointId,
    _uln: OmniAddress,
    _gracePeriod: bigint,
  ): Promise<OmniTransaction> {
    return Promise.resolve<OmniTransaction>({
      point: this.point,
      data: "0x00",
    });
  }

  setReceiveLibraryTimeout(
    _oapp: OmniAddress,
    _eid: EndpointId,
    _uln: OmniAddress,
    _expiry: bigint,
  ): Promise<OmniTransaction> {
    return Promise.resolve<OmniTransaction>({
      point: this.point,
      data: "0x00",
    });
  }

  getExecutorConfig(_oapp: OmniAddress, _uln: OmniAddress, _eid: EndpointId): Promise<Uln302ExecutorConfig> {
    return Promise.resolve({
      maxMessageSize: 1024,
      executor: "0x0",
    });
  }

  getAppExecutorConfig(_oapp: OmniAddress, _uln: OmniAddress, _eid: EndpointId): Promise<Uln302ExecutorConfig> {
    return Promise.resolve({
      maxMessageSize: 1024,
      executor: "0x0",
    });
  }

  hasAppExecutorConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _eid: EndpointId,
    _config: Uln302ExecutorConfig,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }

  setExecutorConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _setExecutorConfig: Uln302SetExecutorConfig[],
  ): Promise<OmniTransaction[]> {
    // Possibly return multiple OmniTransactions if the devtools call expects them
    return Promise.resolve<OmniTransaction[]>([
      {
        point: this.point,
        data: "0x00",
      },
    ]);
  }

  getUlnConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _eid: EndpointId,
    _type: Uln302ConfigType,
  ): Promise<Uln302UlnConfig> {
    // The stub omits the DVN count fields on purpose, hence the cast through unknown
    return Promise.resolve({
      confirmations: BigInt(0),
      requiredDVNs: [],
      optionalDVNs: [],
      optionalDVNThreshold: 0,
    } as unknown as Uln302UlnConfig);
  }

  getAppUlnConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _eid: EndpointId,
    _type: Uln302ConfigType,
  ): Promise<Uln302UlnConfig> {
    // The stub omits the DVN count fields on purpose, hence the cast through unknown
    return Promise.resolve({
      confirmations: BigInt(0),
      requiredDVNs: [],
      optionalDVNs: [],
      optionalDVNThreshold: 0,
    } as unknown as Uln302UlnConfig);
  }

  getAppUlnReadConfig(_oapp: OmniAddress, _uln: OmniAddress, _channelId: number): Promise<UlnReadUlnConfig> {
    // The stub omits the DVN count fields on purpose, hence the cast through unknown
    return Promise.resolve({
      executor: "0x0",
      requiredDVNs: [],
      optionalDVNs: [],
      optionalDVNThreshold: 0,
    } as unknown as UlnReadUlnConfig);
  }

  hasAppUlnConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _eid: EndpointId,
    _config: Uln302UlnUserConfig,
    _type: Uln302ConfigType,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }

  hasAppUlnReadConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _channelId: number,
    _config: UlnReadUlnUserConfig,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }

  setUlnConfig(_oapp: OmniAddress, _uln: OmniAddress, _setUlnConfig: Uln302SetUlnConfig[]): Promise<OmniTransaction[]> {
    return Promise.resolve<OmniTransaction[]>([
      {
        point: this.point,
        data: "0x00",
      },
    ]);
  }

  setUlnReadConfig(
    _oapp: OmniAddress,
    _uln: OmniAddress,
    _setUlnConfig: UlnReadSetUlnConfig[],
  ): Promise<OmniTransaction[]> {
    return Promise.resolve<OmniTransaction[]>([
      {
        point: this.point,
        data: "0x00",
      },
    ]);
  }

  getUlnConfigParams(_uln: OmniAddress, _setUlnConfig: Uln302SetUlnConfig[]): Promise<SetConfigParam[]> {
    return Promise.resolve([]);
  }

  getUlnReadConfigParams(_uln: OmniAddress, _setUlnConfig: UlnReadSetUlnConfig[]): Promise<SetConfigParam[]> {
    return Promise.resolve([]);
  }

  getExecutorConfigParams(_uln: OmniAddress, _setExecutorConfig: Uln302SetExecutorConfig[]): Promise<SetConfigParam[]> {
    return Promise.resolve([]);
  }

  setConfig(_oapp: OmniAddress, _uln: OmniAddress, _setConfigParam: SetConfigParam[]): Promise<OmniTransaction[]> {
    return Promise.resolve<OmniTransaction[]>([
      {
        point: this.point,
        data: "0x00",
      },
    ]);
  }

  quote(_params: MessageParams, _sender: OmniAddress): Promise<MessagingFee> {
    return Promise.resolve({
      nativeFee: BigInt(0),
      lzTokenFee: BigInt(0),
    });
  }
}
