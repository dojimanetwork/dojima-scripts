export interface HermesConfig {
    nodes: number;
    net: string;
    seed: string;
    hermesBlockTime: string;
    hardforkBlockHeight?: string;
    newGenesisTime?: string;
    tssP2pPort: number;
    p2pIdPort: number;
    peer?: string;
    pprofEnabled: boolean;
    arAddress: string;
    dotAddress: string;
    ethAccPass: string;
    signerName: string;
    signerPasswd: string;
    solPubkey: string;
    solProgram: string;
    keyPassphrase: string;
    signerSeedPhrase: string;
    sprintDuration: number;
    chainId: string;
    chainRpc: string;
    chainLocalApi: string;
    chainLocalRpc: string;
}

export interface EthConfig {
    ethHost: string;
    ethInboundStateSender: string;
    ethRouterContract: string;
}

export interface DojimaConfig {
    dojimaChainId: number;
    dojimaGrpcUrl: string;
    dojimaRpcUrl: string;
}
