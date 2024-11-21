import * as fs from "fs";
import path from "path";

import * as consts from "./consts";

function writeGethConfig(argv: any) {
    fs.writeFileSync(path.join(consts.geth_config_path, "geth_genesis.json"), consts.geth_genesis_testnet)
    const jwt = `0x98ea6e4f216f2fb4b69fff9b3a44842c38686ca685f3f55dc48c5d3fb1107be4`
    fs.writeFileSync(path.join(consts.geth_config_path, "jwt.hex"), jwt)
    const val_jwt = `0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
    fs.writeFileSync(path.join(consts.geth_config_path, "val_jwt.hex"), val_jwt)
}

function writeDojimaConfig(argv: any) {
    fs.writeFileSync(path.join(consts.dojima_config_path, "dojima_genesis.json"), consts.dojima_genesis_testnet)
}

export const writeGethConfigCommand = {
    command: "write-geth-config",
    describe: "writes ethereum geth config file",
    handler: (argv: any) => {
        writeGethConfig(argv)
    }
}

export const writeDojimaConfigCommand = {
    command: "write-dojima-config",
    describe: "writes dojima genesis config file",
    handler: (argv: any) => {
        writeDojimaConfig(argv)
    }
}
