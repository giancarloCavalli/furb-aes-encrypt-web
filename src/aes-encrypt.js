// Round key = array de 4 words
// Key schedule = array contendo todas as round keys
// a key schedule é composta de 11 round keys de 4 words. A original + 10 derivadas

function generateFirstRoundKeyWord() {
  let fullWordByteArray = keyInput.value.split(',')

  let [wordByteArray0, wordByteArray1, wordByteArray2, wordByteArray3] = getRoundKey(fullWordByteArray)

  let copywordByteArray3 = wordByteArray3.map(x => x)

  copywordByteArray3 = rotateBytes(copywordByteArray3)

  console.log('A', getHexString('A'))
  console.log('12', getHexString('12'))
}

function getRoundKey(fullWordByteArray) {
  let wordByteArray = []

  while(fullWordByteArray.length > 0) {
    wordByteArray.push(fullWordByteArray.splice(0, 4))
  }

  return [...wordByteArray]
}

function rotateBytes(wordByteArray) {
  const byte = wordByteArray.shift()

  wordByteArray.push(byte)

  return wordByteArray
}

function substituteBytes(wordByteArray) {

}

function generateRoundConstant(wordByteArray) {

}

function doXorBetween(wordByteArray1, wordByteArray2) {

}

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