import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";

import { writeGethAccountsCommand, writeDojimaAccountCommand } from "./account";
import { writeGethConfigCommand, writeDojimaConfigCommand } from "./config";
import { writeHermesEnvCommand, writeEthEnvCommand, writeDojimaEnvCommand, writeNaradaEnvCommand } from "./hermes";
import { createDOJPoolCommand, createETHPoolCommand } from "./pools";
async function main() {
    await Yargs(hideBin(process.argv))
        .options({
            dojimaRpcUrl: { string: true, default: "http://localhost:8549" },
            hermesApiUrl: { string: true, default: "http://localhost:1317" },
            hermesRpcUrl: { string: true, default: "http://localhost:26657" },
            ethUrl: { string: true, default: "http://localhost:9545" },
            l2Url: { string: true, default: "ws://localhost:8548" },
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
        .demandCommand()
        .strict()
        .help()
        .argv;
}

main();