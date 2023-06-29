import {
    assert,
    ByteString,
    hash256,
    method,
    prop,
    PubKey,
    Ripemd160,
    Sig,
    SigHash,
    SmartContract,
    toByteString,
    Utils,
} from 'scrypt-ts'

export class TimeUnlock extends SmartContract {
    @prop()
    readonly service: Ripemd160

    @prop()
    readonly client: Ripemd160

    @prop()
    readonly satsPerBlock: bigint

    @prop(true)
    blockHeight: bigint

    constructor(
        service: Ripemd160,
        client: Ripemd160,
        satsPerBlock: bigint,
        blockHeight: bigint
    ) {
        super(...arguments)
        this.service = service
        this.client = client
        this.satsPerBlock = satsPerBlock
        this.blockHeight = blockHeight
    }

    @method()
    validateBlocks(sig: Sig, pubKey: PubKey, locktime: bigint): bigint {
        assert(locktime <= 500000000, 'nLocktime must be block height')
        assert(locktime > this.blockHeight, 'nLocktime must be in the future')
        assert(Ripemd160(pubKey) == this.client, 'Invalid public key')
        assert(this.checkSig(sig, pubKey), 'Invalid signature')
        return locktime - this.blockHeight
    }

    @method(SigHash.ANYONECANPAY_ALL)
    public collect(sig: Sig, pubKey: PubKey, trailingOutputs: ByteString) {
        const blocks = this.validateBlocks(sig, pubKey, this.ctx.locktime)
        this.blockHeight = this.ctx.locktime
        let sats = blocks * this.satsPerBlock
        let outputs = toByteString('', false)
        if (this.ctx.utxo.value > sats) {
            outputs += this.buildStateOutput(this.ctx.utxo.value - sats)
        } else {
            sats = this.ctx.utxo.value
        }
        outputs +=
            Utils.buildPublicKeyHashOutput(this.service, sats) + trailingOutputs
        assert(hash256(outputs) == this.ctx.hashOutputs, 'Hash does not match')
    }

    @method(SigHash.ANYONECANPAY_ALL)
    public cancel(sig: Sig, pubKey: PubKey, trailingOutputs: ByteString) {
        const blocks = this.validateBlocks(sig, pubKey, this.ctx.locktime)
        let sats = blocks * this.satsPerBlock
        let outputs = toByteString('', false)
        if (this.ctx.utxo.value > sats) {
            outputs += Utils.buildPublicKeyHashOutput(
                this.client,
                this.ctx.utxo.value - sats
            )
        } else {
            sats = this.ctx.utxo.value
        }
        outputs +=
            Utils.buildPublicKeyHashOutput(this.service, sats) + trailingOutputs
        assert(hash256(outputs) == this.ctx.hashOutputs, 'Hash does not match')
    }
}
