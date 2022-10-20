// Round key = array de 4 words
// Key schedule = array contendo todas as round keys
// a key schedule é composta de 11 round keys de 4 words. A original + 10 derivadas

function generateFirstRoundKeyWord() {
  const fullWordByteArray = keyInput.value.split(',')

  let [wordByteArray1, wordByteArray2, wordByteArray3, wordByteArray4] = getRoundKey(fullWordByteArray)

  console.log(wordByteArray1)
  console.log(wordByteArray2)
  console.log(wordByteArray3)
  console.log(wordByteArray4)
}

function getRoundKey(fullWordByteArray) {
  let wordByteArray = []

  while(fullWordByteArray.length > 0) {
    wordByteArray.push(fullWordByteArray.splice(0, 4))
  }

  return [...wordByteArray]
}

function rotateBytes(wordByteArray) {

}

function substituteBytes(wordByteArray) {

}

function generateRoundConstant(wordByteArray) {

}

function doXorBetween(wordByteArray1, wordByteArray2) {

}