import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";

import { writeGethAccountsCommand, writeDojimaAccountCommand } from "./account";
import { writeGethConfigCommand, writeDojimaConfigCommand } from "./config";
import { writeHermesEnvCommand, writeEthEnvCommand, writeDojimaEnvCommand, writeNaradaEnvCommand } from "./hermes";
import { createDOJPoolCommand, createETHPoolCommand } from "./pools";
import { createOperatorCommand } from "./operator";
import { registerChainCommand, createEndpointCommand, registerClientCommand } from "./chainlist";

async function main() {
    await Yargs(hideBin(process.argv))
        .options({
            dojimaRpcUrl: { string: true, default: "http://host.docker.internal:8549" },
            hermesApiUrl: { string: true, default: "http://host.docker.internal:1317" },
            hermesRpcUrl: { string: true, default: "http://host.docker.internal:26657" },
            ethRpcUrl: { string: true, default: "http://host.docker.internal:9545" },
            l2Url: { string: true, default: "ws://localhost:8548" },
            crawlerRPCUrl: { string: true, default: "http://localhost:8899" },
            crawlerWSUrl: { string: true, default: "ws://localhost:8900" },
            operatorServerUrl: { string: true, default: "host.docker.internal:8080" }, // doesn't require the http protocol
        })
        .command(writeGethAccountsCommand)
        .command(writeDojimaAccountCommand)
        .command(writeGethConfigCommand)
        .command(writeDojimaConfigCommand)
        .command(writeHermesEnvCommand)
        .command(writeEthEnvCommand)
        .command(writeDojimaEnvCommand)
        .command(writeNaradaEnvCommand)
        .command(createDOJPoolCommand)
        .command(createETHPoolCommand)
        .command(createOperatorCommand)
        .command(registerChainCommand)
        .command(createEndpointCommand)
        .command(registerClientCommand)
        .demandCommand()
        .strict()
        .help()
        .argv;
}

main();