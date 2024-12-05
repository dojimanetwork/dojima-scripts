import { HermesInit, ComputeUnits } from "@dojima-wallet/connection";
import { Network } from "@dojima-wallet/types";
import { Chain, ChainTicker, isEnabledChain, tickerToChain } from "@dojima-wallet/utils";
import * as consts from "./consts";

async function registerChain(hermesClient: HermesInit, chainId: number, chainTicker: ChainTicker, blkUnits: number, txUnits: number) {
    if (!isEnabledChain(chainTicker)) {
        throw new Error("Invalid chain ticker");
    }

    const chainData = tickerToChain(chainTicker);
    const chain: Chain = {
        chainId: chainId.toString(),
        name: chainData.name,
        token: chainData.token,
        ticker: chainData.ticker,
    };

    console.log("Chain to register :: ", chain);

    const cmpUnits: ComputeUnits = {
        blockUnits: blkUnits,
        txnUnits: txUnits,
    };

    const txHash = await hermesClient.h4sConnect.registerChain({ chain, cmpUnits });
    console.log("Chain registered with tx hash :: ", txHash);
}

export const registerChainCommand = {
    command: "register-chain",
    describe: "Register a new chain",
    builder: {
        chainId: {
            demandOption: true,
            describe: "Chain ID",
            number: true,
        },
        chainTicker: {
            demandOption: true,
            describe: "Chain ticker is ticker of the chain to register (AVAX, ETH, BNB, etc.)",
            string: true,
        },
        blockUnits: {
            demandOption: true,
            describe: "Block units",
            number: true,
            default: 2,
        },
        txnUnits: {
            demandOption: true,
            describe: "Transaction units",
            number: true,
            default: 1,
        },
        hermesPhrase: {
            demandOption: true,
            describe: "Hermes phrase",
            string: true,
            default: consts.dojima_hermes_mnemonic,
        },
        network: {
            demandOption: true,
            describe: "Network",
            string: true,
            default: Network.Testnet,
        },
    },
    handler: async (argv: any) => {
        const hermesClient = new HermesInit(
            argv.hermesPhrase,
            argv.network,
            argv.hermesApiUrl,
            argv.hermesRpcUrl
        );

        await registerChain(hermesClient, argv.chainId, argv.chainTicker, argv.blockUnits, argv.txnUnits);
    },
};
