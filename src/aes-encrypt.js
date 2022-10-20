// Round key = array de 4 words
// Key schedule = array contendo todas as round keys
// a key schedule é composta de 11 round keys de 4 words. A original + 10 derivadas

function generateFirstRoundKeyWord() {
  let fullWordByteArray = keyInput.value.split(',')

  let [wordByteArray0, wordByteArray1, wordByteArray2, wordByteArray3] = getRoundKey(fullWordByteArray)

  let copywordByteArray3 = wordByteArray3.map(x => x)

  copywordByteArray3 = rotateBytes(copywordByteArray3)

  console.log('w3', wordByteArray3)
  console.log('w4', copywordByteArray3)
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