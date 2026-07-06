// QRIS CRC-16/CCITT-FALSE implementation (standar QRIS)
export function calculateCRC(qris) {
  // Remove existing CRC if present (tag 63, 4 chars after)
  let idx = qris.indexOf("6304");
  let data = idx !== -1 ? qris.slice(0, idx + 4) : qris;

  // CRC calculation dari string ASCII (bukan hex)
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
