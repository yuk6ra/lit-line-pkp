import React, { useEffect, useState } from 'react'
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { Button, Card, CardBody, CardHeader, FormControl, FormLabel, Input } from '@chakra-ui/react';



const Lit = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);

    const authSig = {
        sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
        derivedVia: "web3.eth.personal.sign",
        signedMessage:
            "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
        address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
    };

    const createPKPWithLineAuth = async (accessToken) => {
        const litNodeClient = new LitJsSdk.LitNodeClient({
            alertWhenUnauthorized: false,
            litNetwork: "localhost",
            debug: true,
        });
        await litNodeClient.connect();

        const litActionCode = `
            const go = async () => {
                const response = await fetch('https://api.line.me/v2/profile', {
                    headers: {
                        Authorization: 'Bearer ${accessToken}'
                    }
                });
    
                const { userId } = await response.json();
                console.log("userId: ", userId);
    
                const pkp = await Lit.Utils.createProgrammableKeypair({
                    name: 'LINE PKP',
                    jsParams: {
                        accessToken: "${accessToken}"
                    }
                });
    
                const walletAddress = await Lit.Utils.getWalletAddress(pkp.publicKey, ${authSig});
    
                Lit.Actions.setResponse({ response: walletAddress });
            };
    
            go();
        `;

        const results = await litNodeClient.executeJs({
            code: litActionCode,
            authSig,
            jsParams: {
                accessToken: accessToken
            },
            authSigParam: "",
        });

        console.log("Wallet Address: ", results.response);
        setWalletAddress(results.response);
    };

    return (
        <Card>
            <CardHeader>
                PKP
            </CardHeader>
            <CardBody>
                <Button
                    onClick={() => {
                        window.open("https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1661035265&redirect_uri=http://localhost:3000/redirect&state=12345abcde&scope=profile%20openid&nonce=09876xyz")
                    }}
                >
                    Create Access Token
                </Button>
                <FormControl>
                    <FormLabel>
                        Access Token
                    </FormLabel>
                    <Input onChange={(e) => setAccessToken(e.target.value)} />

                </FormControl>
                <Button onClick={() => createPKPWithLineAuth(accessToken)}>
                    Create PKP with LINE Auth
                </Button>
                {walletAddress && (
                    <FormControl>
                        <FormLabel>
                            Wallet Address
                        </FormLabel>
                        <Input value={walletAddress} />
                    </FormControl>
                )}

            </CardBody>
        </Card>
    );
}

export default Lit