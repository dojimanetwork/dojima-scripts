
import { HermesInit, DojimaInit, EthereumInit, DOJ_DECIMAL } from "@dojima-wallet/connection";
import { AssetDOJNative, baseToAsset, assetToBase, assetAmount } from "@dojima-wallet/utils";
import { Network } from "@dojima-wallet/types";
import * as consts from "./consts";

async function createDOJPool(dojClient: DojimaInit, hermesClient: HermesInit, dojAmount: number, hermesAmount: number) {
    const dojAddress = dojClient.dojConnect.getAddress();
    console.log("DOJ address :: ", dojAddress);
    const dojBalance = await dojClient.dojConnect.getBalance(dojAddress);
    console.log("DOJ Balance :: ", dojBalance);


    const hermesAddress = hermesClient.h4sConnect.getAddress();
    console.log("H4S address :: ", hermesAddress);
    const bal = await hermesClient.h4sConnect.getBalance(hermesAddress, [AssetDOJNative]);
    const h4sBalance = baseToAsset(bal[0].amount).amount().toNumber();
    console.log("H4S Balance :: ", h4sBalance);

    if (dojBalance > dojAmount && h4sBalance > hermesAmount) {
        const dojInboundAddress = await dojClient.dojConnect.getDojimaInboundAddress(hermesClient.h4sConnect.getClientUrl().node);
        console.log("DOJ Inbound Address :: ", dojInboundAddress);

        const dojLiquidityPoolTxHash = await dojClient.dojConnect.addLiquidityPool(
            dojAmount,
            dojInboundAddress,
            `${hermesAddress}` // hermes address
        );
        console.log("DOJ Liquidity pool tx hash : ", dojLiquidityPoolTxHash);
        let h4sAmount = assetToBase(assetAmount(hermesAmount, DOJ_DECIMAL));
        const h4sLiquidityPoolTxHash = await hermesClient.h4sConnect.deposit({
            amount: h4sAmount,
            memo: `ADD:DOJ.DOJ:${dojAddress}`,
        });
        console.log("H4S Liquidity pool tx hash :: ", h4sLiquidityPoolTxHash);
    } else {
        throw new Error("Insufficient balance for Dojima or Hermes");
    }
}

async function createETHPool(ethClient: EthereumInit, hermesClient: HermesInit, ethAmount: number, hermesAmount: number) {
    const ethAddress = ethClient.ethConnect.getAddress();
    console.log("ETH address :: ", ethAddress);
    const ethBalance = await ethClient.ethConnect.getBalance(ethAddress);
    console.log("ETH Balance :: ", ethBalance);

    const hermesAddress = hermesClient.h4sConnect.getAddress();
    console.log("H4S address :: ", hermesAddress);
    const bal = await hermesClient.h4sConnect.getBalance(hermesAddress, [AssetDOJNative]);
    const h4sBalance = baseToAsset(bal[0].amount).amount().toNumber();
    console.log("H4S Balance :: ", h4sBalance);

    if (ethBalance > ethAmount && h4sBalance > hermesAmount) {
        const ethInboundAddress = await ethClient.ethConnect.getEthereumInboundAddress(hermesClient.h4sConnect.getClientUrl().node);
        const ethLiquidityPoolHash = await ethClient.ethConnect.addLiquidityPool(
            ethAmount,
            ethInboundAddress,
            `${hermesAddress}` // hermes address
        );
        console.log("ETH Liquidity pool tx hash : ", ethLiquidityPoolHash);

        let h4sAmount = assetToBase(assetAmount(hermesAmount, DOJ_DECIMAL));
        const h4sLiquidityPoolHash = await hermesClient.h4sConnect.deposit({
            amount: h4sAmount,
            memo: `ADD:ETH.ETH:${ethAddress}`,
        });
        console.log("H4S Liquidity pool tx hash :: ", h4sLiquidityPoolHash);
    } else {
        throw new Error("Insufficient balance for Ethereum or Hermes");
    }
}

export const createDOJPoolCommand = {
    command: "create-doj-pool",
    describe: "creates a DOJ pool",
    builder: {
        dojAmount: {
            demandOption: true,
            describe: "DOJ amount",
            number: true,
        },
        dojPhrase: {
            demandOption: true,
            describe: "DOJ phrase",
            string: true,
            default: consts.dojima_hermes_mnemonic,
        },
        hermesAmount: {
            demandOption: true,
            describe: "Hermes amount",
            number: true,
        },
        hermesPhrase: {
            demandOption: true,
            describe: "Hermes phrase",
            string: true,
            default: consts.dojima_hermes_mnemonic,
        },
    },
    handler: async (argv: any) => {
        const dojClient = new DojimaInit(
            argv.dojPhrase,
            Network.Testnet,
            argv.dojimaRpcUrl
        );

        const hermesClient = new HermesInit(
            argv.hermesPhrase,
            Network.Testnet,
            argv.hermesRpcUrl,
            argv.hermesApiUrl
        );

        await createDOJPool(dojClient, hermesClient, argv.dojAmount, argv.hermesAmount);
    },
};

export const createETHPoolCommand = {
    command: "create-eth-pool",
    describe: "creates a ETH pool",
    builder: {
        ethAmount: {
            demandOption: true,
            describe: "ETH amount",
            number: true,
        },
        hermesAmount: {
            demandOption: true,
            describe: "Hermes amount",
            number: true,
        },
        ethPhrase: {
            demandOption: true,
            describe: "ETH phrase",
            string: true,
            default: consts.geth_mnemonic,
        },
        hermesPhrase: {
            demandOption: true,
            describe: "Hermes phrase",
            string: true,
            default: consts.dojima_hermes_mnemonic,
        },
    },
    handler: async (argv: any) => {
        const ethClient = new EthereumInit(
            argv.ethPhrase,
            Network.Testnet,
            argv.ethRpcUrl
        );

        const hermesClient = new HermesInit(
            argv.hermesPhrase,
            Network.Testnet,
            argv.hermesRpcUrl,
            argv.hermesApiUrl
        );

        await createETHPool(ethClient, hermesClient, argv.ethAmount, argv.hermesAmount);
    },
}