/**
 * The Miner is based on https://github.com/guerrerocarlos/bitcoin-miner
 */

import * as BufferModule from 'buffer/'
const Buffer = BufferModule.Buffer

import * as Sha256 from './sha256.js'

class Miner {
    constructor(block) {
        // Initialize local variables with Block data
        const prevBlockHash = Buffer.from(block.previousblockhash, 'hex');
        const mrklRoot = Buffer.from(block.merkleroot, 'hex');
        const {time, version} = block;

        // Calculate target based on block's "bits",
        // The "bits" variable is a packed representation of the Difficulty in 8 bytes, to unpack it:
        // First two bytes make the "exponent", and the following 4 bytes make the "mantissa":
        // https://en.bitcoin.it/wiki/Difficulty#What_is_the_formula_for_difficulty
        const bits = parseInt('0x' + block.bits, 16);
        const exponent = bits >> 24;
        const mantissa = bits & 0xFFFFFF;
        const target = (mantissa * (2 ** (8 * (exponent - 3)))).toString('16');

        // Make target a Buffer object
        this.targetBuffer = Buffer.from('0'.repeat(64 - target.length) + target, 'hex');

        // Create little-endian long int (4 bytes) with the version (2) on the first byte
        this.versionBuffer = Buffer.alloc(4);
        this.versionBuffer.writeInt32LE(version, 0);

        // Reverse the previous Block Hash and the merkle_root
        this.reversedPrevBlockHash = this.reverseBuffer(prevBlockHash);
        this.reversedMrklRoot = this.reverseBuffer(mrklRoot);

        // Buffer with time (4 Bytes), bits (4 Bytes) and nonce (4 Bytes) (later added and updated on each hash)
        this.timeBitsNonceBuffer = Buffer.alloc(12);
        this.timeBitsNonceBuffer.writeInt32LE(time, 0);
        this.timeBitsNonceBuffer.writeInt32LE(bits, 4);
    }

    reverseBuffer(src) {
        const buffer = Buffer.alloc(src.length);
        for (let i = 0, j = src.length - 1; i <= j; ++i, --j) {
            buffer[i] = src[j];
            buffer[j] = src[i];
        }
        return buffer;
    }

    sha256(buf) {
        // return Sha256.sha256(buf)
        return Buffer.from(Sha256.sha256.sha256.hex(buf), "hex");
    }
    // sha256(buf) {
    //     return crypto.createHash('sha256').update(buf).digest();
    // }
    sha256sha256(buf) {
        return this.sha256(this.sha256(buf));
    }

    getHash(nonce) {
        // Update nonce in header Buffer
        this.timeBitsNonceBuffer.writeInt32LE(nonce, 8);
        // Double sha256 hash the header
        return this.reverseBuffer(this.sha256sha256(Buffer.concat([this.versionBuffer, this.reversedPrevBlockHash, this.reversedMrklRoot, this.timeBitsNonceBuffer])));
    }

    reverseString(str) {
        if (str.length < 8) { // Make sure the HEX value from the integers fill 4 bytes when converted to buffer, so that they are reversed correctly
            str = '0'.repeat(8 - str.length) + str;
        }
        return this.reverseBuffer(Buffer.from(str, 'hex')).toString('hex');
    }

    verifyNonce(block, checknonce) {
        // This is a (maybe easier) way to build the header from scratch, it should generate the same hash:
        console.log(`\n[Verify Nonce ${checknonce} ${checknonce.toString(16)}]`);
        const version = this.reverseString(block.version.toString(16));
        const prevhash = this.reverseString(block.previousblockhash);
        const merkleroot = this.reverseString(block.merkleroot);
        const nbits = this.reverseString(block.bits);
        const ntime = this.reverseString(block.time.toString(16));
        const nonce = this.reverseString(checknonce.toString(16));

        console.log('        ', 'version' + ' '.repeat(version.length - 7) + 'prevhash' + ' '.repeat(prevhash.length - 8) + 'merkleroot' + ' '.repeat(prevhash.length - 10) + 'ntime' + ' '.repeat(ntime.length - 5) + 'nbits' + ' '.repeat(nbits.length - 5) + 'nonce');
        console.log('Header: ', version + prevhash + merkleroot + ntime + nbits + nonce);

        const header = version + prevhash + merkleroot + ntime + nbits + nonce;
        const hash = this.reverseString(this.sha256sha256(Buffer.from(header, 'hex')));
        console.log('Target: ', this.getTarget().toString('hex'));
        console.log('Hash:   ', hash.toString('hex'));

        const isvalid = this.getTarget().toString('hex') > hash;
        const result = isvalid ? 'valid' : 'not a valid';
        console.log('Result: ', `${checknonce} is a ${result} nonce`);
        return isvalid;
    }

    getTarget() {
        return this.targetBuffer;
    }

    checkHash(hash) {
        return Buffer.compare(this.getTarget(), hash) > 0;
    }
}

// https://btcscan.org/block/0000000004085b772b067293e4a09c870254b55b899be1ab05e6cf8a60fc1369
const block = {
    version: 1,
    previousblockhash: '00000000044be0114cf25a6f76bb5d719143f0da87328e089c873988d42cebce',
    merkleroot: 'f903de1a772122478f0dd9a1f7f5472f6df80b1082757723400cb1f185f479f1',
    time: 1279091902,
    bits: '1c05a3f4'
};
let nonce = 0 // initial nonce 45291990

const miner = new Miner(block);

// Calculate the target based on current difficulty for this block (block.bits)
const target = miner.getTarget();
console.log('The target for this block is:');
console.log(target.toString('hex'));

let hash;
let found = false;
let finished = false;

console.log('\n[Start Mining with initial nonce:', nonce, ']');
while (nonce < (45291998+1) && !finished) { // check the next 1000 nonces starting from 45291990
    hash = miner.getHash(nonce);
    found = miner.checkHash(hash);
    console.log(hash.toString('hex'), nonce, found ? '<- nonce FOUND!!' : '');
    if (found) {
        finished = miner.verifyNonce(block, nonce);
    }
    nonce++;
}
