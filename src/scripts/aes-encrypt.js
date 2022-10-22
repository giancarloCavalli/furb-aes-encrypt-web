function encrypt(textAreaValue, keyRawValue) {
  const key = generateKey(keyRawValue)

  let charArray = [...textAreaValue]
  charArray = getPad16(charArray)

  let textInHexArray = get16ByteMatrixInColumnsArray(charArray)

  let sixteenByteBlocksArray = []

  while (textInHexArray.length > 0) {
    const array = textInHexArray.splice(0, 4)
    sixteenByteBlocksArray.push(array)
  }

  let sixteenByteBlocksCyphered = []

  let i = 0
  while (i < sixteenByteBlocksArray.length) {
    const xorTextAndFirstRoundKey16ByteInHexArray = getXorBetween16ByteTwoLevelArrays(sixteenByteBlocksArray[i], key['rk0'])
  
    let substitutedTextBytesInHexTwoLevelArray = getSubstitutedBytesInTwoLevelArray(xorTextAndFirstRoundKey16ByteInHexArray)
    
    //ATTENTION cause from this point forward the columns and lines are inverted!
    const textBytesInHexShiftedRowsInverted = getShiftRows(substitutedTextBytesInHexTwoLevelArray)
    
    //ATTENTION backverted
    const textBytesInHexShiftedRows = getSameWithInvertedColsAndRows(textBytesInHexShiftedRowsInverted)
  
    let mixColumnsMatrix = getMixColumnsMatrix(textBytesInHexShiftedRows)

    i++
    
    sixteenByteBlocksCyphered.push(getXorMixCollumnsAndRoundKeys(mixColumnsMatrix, key))
  }

  return sixteenByteBlocksCyphered
}

function getPad16(charArray) {
  const diff = 16 - (charArray.length % 16)
  for (let i = 0; i < diff; i++) {
    charArray.push(`${diff}`)
  }

  return charArray
}

function getXorMixCollumnsAndRoundKeys(mixColumnsMatrix, keyTwoLevelArray) {
  let i = 0
  while (i <= 10) {
    const roundKey = keyTwoLevelArray[`rk${i}`]
    mixColumnsMatrix = getXorBetween16ByteTwoLevelArrays(mixColumnsMatrix,roundKey)

    i++
  }

  return mixColumnsMatrix
}

function getShiftRows(twoLevelArrayOfBytesInHex) {
  // reestructured the matrix to do the shift rows
  let invertedTwoLevelArrayOfBytesInHex = getSameWithInvertedColsAndRows(twoLevelArrayOfBytesInHex)

  const shifted = invertedTwoLevelArrayOfBytesInHex.map((byteArrayInHex, index) => {
    while (index > 0) {
      const byteInHex = byteArrayInHex.shift()
      byteArrayInHex.push(byteInHex)

      index--
    }

    return byteArrayInHex
  })

  return shifted
}

function getMixColumnsMatrix(twoLevelArrayOfBytesInHex) {
  //TODO Ajustar mix columns com a inclusao da E Table no processo
  let resultMatrix = []
  for (let x = 0; x < twoLevelArrayOfBytesInHex.length; x++) {

    let r0
    let r1
    let i = 1

    let xor00
    let xor01
    let xor10
    let xor11
    let xor20
    let xor21
    let xor30
    let xor31

    let firstB
    let secondB
    let thirdB
    let fourthB

    while (i < twoLevelArrayOfBytesInHex.length) {
      if (i === 1) {
        r0 = twoLevelArrayOfBytesInHex[x][i-1]
        r1 = twoLevelArrayOfBytesInHex[x][i]

        r0TimesMatrix0 = getMult(r0, MULT_MATRIX[0][i-1])
        r1TimesMatrix0 = getMult(r1, MULT_MATRIX[0][i])

        r0TimesMatrix1 = getMult(r0, MULT_MATRIX[1][i-1])
        r1TimesMatrix1 = getMult(r1, MULT_MATRIX[1][i])

        r0TimesMatrix2 = getMult(r0, MULT_MATRIX[2][i-1])
        r1TimesMatrix2 = getMult(r1, MULT_MATRIX[2][i])

        r0TimesMatrix3 = getMult(r0, MULT_MATRIX[3][i-1])
        r1TimesMatrix3 = getMult(r1, MULT_MATRIX[3][i])

        xor00 = getXorBetweenHexStrings(r0TimesMatrix0, r1TimesMatrix0)
        xor10 = getXorBetweenHexStrings(r0TimesMatrix1, r1TimesMatrix1)
        xor20 = getXorBetweenHexStrings(r0TimesMatrix2, r1TimesMatrix2)
        xor30 = getXorBetweenHexStrings(r0TimesMatrix3, r1TimesMatrix3)

      } else if (i === 3) {        
        r0 = twoLevelArrayOfBytesInHex[x][i-1]
        r1 = twoLevelArrayOfBytesInHex[x][i]

        xor01 = getXorBetweenHexStrings(getMult(r0, MULT_MATRIX[0][i-1]), getMult(r1, MULT_MATRIX[0][i]))
        xor11 = getXorBetweenHexStrings(getMult(r0, MULT_MATRIX[1][i-1]), getMult(r1, MULT_MATRIX[1][i]))
        xor21 = getXorBetweenHexStrings(getMult(r0, MULT_MATRIX[2][i-1]), getMult(r1, MULT_MATRIX[2][i]))
        xor31 = getXorBetweenHexStrings(getMult(r0, MULT_MATRIX[3][i-1]), getMult(r1, MULT_MATRIX[3][i]))
        
        firstB = getXorBetweenHexStrings(xor00, xor01)
        secondB = getXorBetweenHexStrings(xor10, xor11)
        thirdB = getXorBetweenHexStrings(xor20, xor21)
        fourthB = getXorBetweenHexStrings(xor30, xor31)
      }

      i++
    }
    resultMatrix.push([firstB, secondB, thirdB, fourthB])
  }

  return resultMatrix
}

function getMult(hex1, hex2) {
  if (parseInt(hex1, 16) === 0 || parseInt(hex2, 16) === 0) {
    return '00'
  }

  if (parseInt(hex1, 16) === 1) {
    return hex2
  } else if (parseInt(hex2, 16) === 1) {
    return hex1
  }
  
  const rTimesMatrix = sumHexString(L_TABLE[hex1], L_TABLE[hex2])

  // uncomment for better debugging
  // console.log('hex1', hex1)
  // console.log('rTimesMatrix', rTimesMatrix)
  // console.log('E_TABLE[rTimesMatrix]', E_TABLE[rTimesMatrix])

  return E_TABLE[rTimesMatrix]
}

function sumHexString(hex1, hex2) {
  const number1 = parseInt(hex1, 16)
  const number2 = parseInt(hex2, 16)

  let result = number1 + number2

  if (result > parseInt("ff", 16)) {
    result - parseInt("ff", 16)
  }

  return getHexString(`${result}`)
}

function getSubstitutedBytesInTwoLevelArray(twoLevelArrayOfBytesInHex) {
  return twoLevelArrayOfBytesInHex.map(byteInHexArray => {
    return getSubstitutedBytes(byteInHexArray)
  })
}

function getXorBetween16ByteTwoLevelArrays(byteTwoLevelArray1, byteTwoLevelArray2) {
  let xorTwoLevelArray = []
  
  for (let i = 0; i < byteTwoLevelArray1.length; i++) {
    const hex1 = byteTwoLevelArray1[i];
    const hex2 = byteTwoLevelArray2[i];
    
    xorTwoLevelArray.push(getXorInHexArrayBetween(hex1, hex2))
  }

  return xorTwoLevelArray
}

function generateKey(keyRawValue) {
  let fullWordArray = keyRawValue.split(',')
  
  const key = {}
  
  let roundKey0 = getFirstRoundKey(fullWordArray)

  key['rk0'] = roundKey0
  
  let i = 1
  
  const roundConstantWords = generateRoundConstantWords()
  
  while (i <= 10) {
    const copyOfLastWordFromPreviousRoundKey = key[`rk${i-1}`][3].map(byteInHex => byteInHex)
    const copyOfFirstWordFromPreviousRoundKey = key[`rk${i-1}`][0].map(byteInHex => byteInHex)
    const firstWord = getFirstWord(copyOfLastWordFromPreviousRoundKey, roundConstantWords[i], copyOfFirstWordFromPreviousRoundKey)
    
    const previousRoundKey = key[`rk${i-1}`]
    
    key[`rk${i}`] = getRoundKey(firstWord, previousRoundKey)
    
    i++
  }

  return key
}

function getFirstWord(lastWordPrevRoundKey, roundConstantWord, firstWordPrevRoundKey) {
  const rotatedWord = getRotatedBytes(lastWordPrevRoundKey)
  const substituteSBoxWord = getSubstitutedBytes(rotatedWord)

  const xorSubstitutedWordAndRoundConstant = getXorInHexArrayBetween(substituteSBoxWord, roundConstantWord)
  
  const xorWithFirstWordPrevRoundKey = getXorInHexArrayBetween(xorSubstitutedWordAndRoundConstant, firstWordPrevRoundKey)

  return xorWithFirstWordPrevRoundKey
}

function getFirstRoundKey(fullWordArray) {
  const wordInHexArray = get16ByteMatrixInColumnsArray(fullWordArray)
  return wordInHexArray
}

function get16ByteMatrixInColumnsArray(sixteenElementArray) {
  let byteInHexArray = []

  while(sixteenElementArray.length > 0) {
    const wordInDecArray = sixteenElementArray.splice(0, 4)

    byteInHexArray.push(wordInDecArray.map(byteInDecimal => getHexString(byteInDecimal)))
  }

  return byteInHexArray
}

function getRoundKey(firstWord, previousRoundKey) {
  const secondWord = getXorInHexArrayBetween(previousRoundKey[1], firstWord)
  const thirdWord = getXorInHexArrayBetween(previousRoundKey[2], secondWord)
  const fourthWord = getXorInHexArrayBetween(previousRoundKey[3], thirdWord)

  return [firstWord, secondWord, thirdWord, fourthWord]
}

function getRotatedBytes(wordArray) {
  const byte = wordArray.shift()

  wordArray.push(byte)

  return wordArray
}

function getSubstitutedBytes(byteInHexArray) {
  return byteInHexArray.map(byte => S_BOX[byte])
}

function generateRoundConstantWords() {
  let roundConstantWords = {}

  let wordIndex = 1
  let pow = 0
  let value

  while (wordIndex <= 10) {
    value = Math.pow(2, pow)

    while(value > 255) {
      value -= (256 - 27)
    }

    roundConstantWords[wordIndex] = [getHexString(value), 0, 0, 0]

    wordIndex++
    pow++
  }

  return roundConstantWords
}

function getXorInHexArrayBetween(wordInHexArray1, wordInHexArray2) {
  let xorWordInHexArray = []

  for (let i = 0; i < wordInHexArray1.length; i++) {
    const byte1InDecimalInt = parseInt(wordInHexArray1[i], 16);
    const byte2InDecimalInt = parseInt(wordInHexArray2[i], 16);

    xorWordInHexArray.push(getHexString(byte1InDecimalInt ^ byte2InDecimalInt))
  }

  return xorWordInHexArray
}

function getSameWithInvertedColsAndRows(twoLevelArrayOfBytesInHex) {
  let lineOrderedArray = []
  
  for (let x = 0; x < twoLevelArrayOfBytesInHex.length; x++) {
    let array = []
    for (let y = 0; y < twoLevelArrayOfBytesInHex.length; y++) {

      array.push(twoLevelArrayOfBytesInHex[y][x])

    }
    lineOrderedArray.push(array)
  }

  return lineOrderedArray
}