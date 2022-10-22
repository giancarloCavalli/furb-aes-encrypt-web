function getHexString(numberInStringOrChar) {
  let hexString

  if (isNaN(numberInStringOrChar)) {
    const char = numberInStringOrChar
    const asciiValue = char.charCodeAt(0)
    hexString = asciiValue.toString(16)
  } else {
    const number = parseInt(numberInStringOrChar)
    hexString = number.toString(16)
  }

  return padTwoZeroes(hexString)
}

function padTwoZeroes(number) {
  const zeroFilled = ('00'+number).slice(-2)

  return zeroFilled
}

function getXorBetweenHexStrings(hex1, hex2) {
  return getHexString(parseInt(hex1) ^ parseInt(hex2))
}