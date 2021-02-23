import { crypto } from '../electronRemote';

function randomKey(byteSize: number = 64) {
  return crypto
    .randomBytes(byteSize)
    .toString('base64');
}

export default randomKey;
