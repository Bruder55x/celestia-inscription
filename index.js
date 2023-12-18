import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";

// EDIT HERE
const MY_KEY = process.env.PRIVATE_KEY; // Change  with your Mnemonic
const TOTAL_TX = 3; // Change to the number of transactions you want
///////////////

const MEMO = 'ZGF0YToseyJvcCI6Im1pbnQiLCJhbXQiOjEwMDAwLCJ0aWNrIjoiY2lhcyIsInAiOiJjaWEtMjAifQ==';
const FEE = '192';
const GAS = '95644';
const RPC = "https://rpc.lunaroasis.net/";

const prepareAccount = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(MY_KEY.toString(), {
        prefix: "celestia",
    });
};

const logAccountInfo = async (signingClient: SigningStargateClient, my_Pubkey: string) => {
    const balances = await signingClient.getAllBalances(my_Pubkey);
    const utiaBalance = balances.find((coin) => coin.denom === 'utia');
    const utiaAmount = utiaBalance ? parseFloat(utiaBalance.amount) : 0;
    const tiaAmount = utiaAmount / 1_000_000;

    console.log(`My wallet Address: ${my_Pubkey}`);
    console.log(` - Chain: ${await signingClient.getChainId()}\n - Balance: ${tiaAmount}\n - Block Height: ${await signingClient.getHeight()}\n\n`);
};

const sendTransactions = async (signingClient: SigningStargateClient, my_Pubkey: string) => {
    for (let count = 0; count < TOTAL_TX; count++) {
        const result = await signingClient.sendTokens(
            my_Pubkey,
            my_Pubkey,
            [{ denom: "utia", amount: "1" }],
            {
                amount: [{ denom: "utia", amount: FEE }],
                gas: GAS,
            },
            MEMO,
        );

        console.log(`${count + 1}. Explorer: https://celestia.explorers.guru/transaction/${result.transactionHash}`);
    }
};

const Start = async (): Promise<void> => {
    try {
        const my_Wallet: OfflineDirectSigner = await prepareAccount();
        const my_Pubkey = (await my_Wallet.getAccounts())[0].address;

        const signingClient = await SigningStargateClient.connectWithSigner(RPC, my_Wallet);

        await logAccountInfo(signingClient, my_Pubkey);
        await sendTransactions(signingClient, my_Pubkey);

        console.log("\n=======> [ DONE ALL. CONGRATS ] <=======");
    } catch (error) {
        console.error("Error:", error.message);
    }
};

Start();
