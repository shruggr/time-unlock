import { TimeUnlock } from '../../src/contracts/timeUnlock'
import { getDefaultSigner, inputSatoshis } from '../utils/txHelper'
import { toByteString, sha256 } from 'scrypt-ts'

const message = 'hello world, sCrypt!'

async function main() {
    await TimeUnlock.compile()
    // const instance = new TimeUnlock(sha256(toByteString(message, true)))

    // connect to a signer
    // await instance.connect(getDefaultSigner())

    // // contract deployment
    // const deployTx = await instance.deploy(inputSatoshis)
    // console.log('TimeUnlock contract deployed: ', deployTx.id)

    // // contract call
    // const { tx: callTx } = await instance.methods.unlock(
    //     toByteString(message, true)
    // )
    // console.log('TimeUnlock contract `unlock` called: ', callTx.id)
}

describe('Test SmartContract `TimeUnlock` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
