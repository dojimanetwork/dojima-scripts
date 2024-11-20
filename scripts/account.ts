import { ethers } from 'ethers';
import * as fs from "fs";
import path from 'path';

import * as consts from "./consts";

const specialAccounts = 6;
async function writeGethAccounts() {
    for (let i = 0; i < specialAccounts; i++) {
        const wallet = specialAccount(i)
        let walletJSON = await wallet.encrypt(consts.gethpassphrase);
        fs.writeFileSync(
            path.join(consts.gethkeystore, wallet.address + ".key"),
            walletJSON
        );
    }
}

export function writeDojimaAccount(): ethers.Wallet {
    return ethers.Wallet.fromMnemonic(
        consts.dojima_hermes_account_seed_phrase,
        "m/44'/118'/0'/0/0"
    );
}

function specialAccount(index: number): ethers.Wallet {
    return ethers.Wallet.fromMnemonic(
        consts.l1mnemonic,
        "m/44'/60'/0'/0/" + index
    );
}

export const writeGethAccountsCommand = {
    command: "write-geth-accounts",
    describe: "writes wallet files",
    handler: async (argv: any) => {
        await writeGethAccounts();
    },
};

export const writeDojimaAccountCommand = {
    command: "write-dojima-account",
    describe: "writes wallet files",
    handler: async (argv: any) => {
        await writeDojimaAccount();
    },
};

export function namedAccount(
    name: string,
    threadId?: number | undefined
): ethers.Wallet {
    if (name == "funnel") {
        return specialAccount(0);
    }
    if (name.startsWith("user_")) {
        return new ethers.Wallet(
            ethers.utils.sha256(ethers.utils.toUtf8Bytes(name))
        );
    }
    if (name.startsWith("threaduser_")) {
        if (threadId == undefined) {
            throw Error("threaduser_ account used but not supported here");
        }
        return new ethers.Wallet(
            ethers.utils.sha256(
                ethers.utils.toUtf8Bytes(
                    name.substring(6) + "_thread_" + threadId.toString()
                )
            )
        );
    }
    if (name.startsWith("key_")) {
        return new ethers.Wallet(ethers.utils.hexlify(name.substring(4)));
    }
    throw Error("bad account name: [" + name + "] see general help");
}
