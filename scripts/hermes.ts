
import * as fs from "fs";
import path from 'path';

import * as consts from "./consts";
import { HermesConfig, EthConfig, DojimaConfig } from "./hermes_config";

// this function will take the flags and write the env file for the hermes node
async function writeHermesEnv(argv: any) {
    const config: HermesConfig = {
        nodes: argv.nodes,
        net: argv.net,
        seed: argv.seed,
        hermesBlockTime: argv.hermesBlockTime,
        hardforkBlockHeight: argv.hardforkHeight,
        newGenesisTime: argv.genesisTime,
        tssP2pPort: argv.tssP2pPort,
        p2pIdPort: argv.p2pIdPort,
        peer: argv.peer,
        pprofEnabled: true,
        arAddress: argv.arAddress,
        dotAddress: argv.dotAddress,
        ethAccPass: '',
        signerName: consts.hermes_account_name,
        signerPasswd: consts.hermes_account_password,
        solPubkey: argv.solPubkey,
        solProgram: argv.solProgram,
        keyPassphrase: consts.hermes_account_password,
        signerSeedPhrase: consts.dojima_hermes_account_seed_phrase,
        sprintDuration: argv.sprintDuration,
        chainId: argv.chainId,
        chainRpc: argv.chainRpc,
        chainLocalApi: argv.chainLocalApi,
        chainLocalRpc: argv.chainLocalRpc
    };

    const hermesEnv = convertToEnv(config);
    console.log("hermesEnv path ", consts.hermes_env);
    fs.writeFileSync(consts.hermes_env, hermesEnv)
}

function writeEthConfig(argv: any) {
    const config: EthConfig = {
        ethHost: argv.host,
        ethInboundStateSender: argv.inboundStateSender,
        ethRouterContract: argv.routerContract,
    }

    const ethEnv = convertToEnv(config);
    // append to the existing file
    console.log("ethEnv path ", consts.hermes_env);
    fs.appendFileSync(consts.hermes_env, '\n' + ethEnv)
}

function writeDojimaConfig(argv: any) {
    const config: DojimaConfig = {
        dojimaChainId: argv.dojimaChainId,
        dojimaGrpcUrl: argv.dojimaGrpcUrl,
        dojimaRpcUrl: argv.dojimaRpcUrl,
    }

    const dojimaEnv = convertToEnv(config);
    // append to the existing file
    console.log("dojimaEnv path ", consts.hermes_env);
    fs.appendFileSync(consts.hermes_env, '\n' + dojimaEnv)
}

export const writeHermesEnvCommand = {
    command: "write-hermes-env",
    describe: "writes hermes env file",
    builder: {
        nodes: { number: true, default: 1 },
        net: { string: true, default: "mocknet" },
        seed: { string: true, default: "hermesnode" },
        hermesBlockTime: { string: true, default: "5s" },
        hardforkHeight: { string: true, default: "0" },
        genesisTime: { string: true, default: "" },
        tssP2pPort: { number: true, default: 5040 },
        p2pIdPort: { number: true, default: 6040 },
        peer: { string: true, default: "" },
        arAddress: { string: true, default: "" },
        dotAddress: { string: true, default: "" },
        solPubkey: { string: true, default: "" },
        solProgram: { string: true, default: "" },
        sprintDuration: { number: true, default: 16 },
        chainId: { string: true, default: "hermeschain" },
        chainRpc: { string: true, default: "hermesnode:26657" },
        chainLocalApi: { string: true, default: "127.0.0.1:1317" },
        chainLocalRpc: { string: true, default: "127.0.0.1:26657" },
    },
    handler: async (argv: any) => {
        await writeHermesEnv(argv);
    },
};


export const writeEthEnvCommand = {
    command: "write-eth-env",
    describe: "writes eth env file",
    builder: {
        host: { string: true, default: "http://geth:9545" },
        inboundStateSender: { string: true, default: "" },
        routerContract: { string: true, default: "" },
    },
    handler: async (argv: any) => {
        await writeEthConfig(argv);
    },
};

export const writeDojimaEnvCommand = {
    command: "write-dojima-env",
    describe: "writes dojima env file",
    builder: {
        dojimaChainId: { number: true, default: 184 },
        dojimaGrpcUrl: { string: true, default: "hermesnode:9090" },
        dojimaRpcUrl: { string: true, default: "http://dojima-chain:8545" },
    },
    handler: async (argv: any) => {
        await writeDojimaConfig(argv);
    },
};

function convertToEnv(config: any) {
    // Convert config object to env format
    const env = Object.entries(config)
        .map(([key, value]) => {
            // Convert camelCase to SCREAMING_SNAKE_CASE
            const envKey = key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();
            // Add quotes around string values if they don't already have them
            const envValue = typeof value === 'string' && !value.startsWith('"') ?
                `"${value}"` : value;
            return `${envKey}=${envValue}`;
        })
        .join('\n');

    return env;
}