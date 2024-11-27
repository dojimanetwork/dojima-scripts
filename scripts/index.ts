import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";

import { writeGethAccountsCommand, writeDojimaAccountCommand } from "./account";
import { writeGethConfigCommand, writeDojimaConfigCommand } from "./config";
import { writeHermesEnvCommand, writeEthEnvCommand, writeDojimaEnvCommand, writeNaradaEnvCommand } from "./hermes";
import { createDOJPoolCommand } from "./pools";
async function main() {
    await Yargs(hideBin(process.argv))
        .options({
            dojimaRpcUrl: { string: true, default: "http://dojima-chain:8545" },
            hermesApiUrl: { string: true, default: "http://hermesnode:1317" },
            hermesRpcUrl: { string: true, default: "http://hermesnode:26657" },
            ethUrl: { string: true, default: "http://geth:8549" },
            l2Url: { string: true, default: "ws://l2node:8548" },
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
        .demandCommand()
        .strict()
        .help()
        .argv;
}

main();