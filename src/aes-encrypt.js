function generateFirstRoundKeyWord() {
  const fullWordByteArray = keyInput.value.split(',')

  let [wordByteArray1, wordByteArray2, wordByteArray3, wordByteArray4] = getWords(fullWordByteArray)

  console.log(wordByteArray1)
  console.log(wordByteArray2)
  console.log(wordByteArray3)
  console.log(wordByteArray4)
}

function getWords(fullWordByteArray) {
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