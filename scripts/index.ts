import { hideBin } from "yargs/helpers";
import Yargs from "yargs/yargs";

import { writeGethAccountsCommand, writeDojimaAccountCommand } from "./account";
import { writeGethConfigCommand, writeDojimaConfigCommand } from "./config";
import { writeHermesEnvCommand, writeEthEnvCommand, writeDojimaEnvCommand, writeNaradaEnvCommand } from "./hermes";

async function main() {
    await Yargs(hideBin(process.argv))
        .options({
            dojimaurl: { string: true, default: "http://localhost:8545" },
            hermesurl: { string: true, default: "http://localhost:1317" },
            ethurl: { string: true, default: "http://localhost:8549" },
            l2url: { string: true, default: "ws://localhost:8548" },
        })
        .command(writeGethAccountsCommand)
        .command(writeDojimaAccountCommand)
        .command(writeGethConfigCommand)
        .command(writeDojimaConfigCommand)
        .command(writeHermesEnvCommand)
        .command(writeEthEnvCommand)
        .command(writeDojimaEnvCommand)
        .command(writeNaradaEnvCommand)
        .demandCommand()
        .strict()
        .help()
        .argv;
}

main();