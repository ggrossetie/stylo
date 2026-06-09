function pktLine(str) {
  const data = typeof str === 'string' ? Buffer.from(str, 'utf8') : Buffer.from(str)
  const len = (data.length + 4).toString(16).padStart(4, '0')
  return Buffer.concat([Buffer.from(len, 'ascii'), data])
}

console.log(pktLine('ACK\n').toString('utf8'))
