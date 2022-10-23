import { SocketMessage } from "https://raw.githubusercontent.com/duart38/serverless-sockets/main/src/mod.ts";
import { readJSON, writeJSON, writeTXT } from "https://deno.land/x/flat@0.0.15/mod.ts"

type Signed = {
    signature: number[],
    deviceId: string,
    sigMsg: string,
    nonce: string,
}

type SignedReq = Signed & {
    command: string
}

function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length)
    const view = new Uint8Array(buf)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        view[i] = str.charCodeAt(i)
    }
    return buf
}

async function importSigningKey(pem: string) {
    // Fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----"
    const pemFooter = "-----END PRIVATE KEY-----"
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length)
    // Base64 decode the string to get the binary data
    const binaryDerString = atob(pemContents)
    // Convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString)

    return await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSA-PSS",
            hash: "SHA-256"
        },
        true,
        ['sign']
    )
}

async function computeSignature(data: string, key: CryptoKey): Promise<SignedReq> {
    const nonce = "" + Date.now() + Math.random()

    return {
        signature: [...new Uint8Array(await crypto.subtle.sign(
            {
                name: "RSA-PSS",
                saltLength: 32
            },
            key,
            new TextEncoder().encode(/*data + */nonce)
        ))],
        deviceId: Deno.env.get('DEVICE_ID') || "",
        sigMsg: nonce,
        nonce,
        command: data
    }
}

interface Data {
    roomTemp: number
    roomHumidity: number
    timestamp: number
    light: { 
        visible: number
        ultraviolet: number
        infrared: number
        isOn: boolean 
    }
    hasWater: boolean
    isWatering: boolean
    plants: {
        name: string
        soilTemp: number
        soilMoisture: number
        image?: string
    }[]
}

async function transform(input: Data): Promise<Data> {
    return {...input, plants: await Promise.all(input.plants.map(async (plant, idx) => {
        await writeTXT(`plant-${idx}`, plant.image ?? "")
        return ({
            ...plant, image: undefined
        })
    }))}
}

(async function () {
    const filename = Deno.args[0]
    const content = await readJSON('data.json')
    const message = "signature"

    const key = await importSigningKey(Deno.env.get('COLLECTOR_KEY') || "")
    const signed = await computeSignature(message, key)
    const encoded = SocketMessage.encode({ event: 'collect', payload: signed })

    const ws = new WebSocket(Deno.env.get('SERVICE_URL') || "")
    ws.onopen = (_ => {
        ws.send(encoded)

        const id = setTimeout(() => {
            console.log('Timeout...')
            console.log(content)
            writeJSON(filename, content)
            ws.close()
        }, 120000)

        ws.onmessage = (async ({ data }) => {
            const msg = SocketMessage.fromBuffer(await (data as Blob).arrayBuffer()).payload as unknown as Data
            clearTimeout(id);
            console.log("Found...")
            const transformed = await transform(msg)
            console.log(transformed)
            writeJSON(filename, transformed)
            ws.close()
        })
    })
})()

