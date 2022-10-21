// Round key = array de 4 words
// Key schedule = array contendo todas as round keys
// a key schedule é composta de 11 round keys de 4 words. A original + 10 derivadas

function encrypt(textAreaValue, keyRawValue) {
  const key = generateKey(keyRawValue)

  let sixteenCharArray = [...textAreaValue]

  const textInHexArray = get16ByteMatrixInColumnsArray(sixteenCharArray)

  const xorTextAndFirstRoundKey16ByteInHexArray = getXorBetweenTextAndRoundKey(textInHexArray, key['rk0'])
  
  let substitutedTextBytesInHexTwoLevelArray = getSubstitutedBytesInTwoLevelArray(xorTextAndFirstRoundKey16ByteInHexArray)
  
  //ATTENTION cause from this point forward the columns and lines are inverted!
  const textBytesInHexShiftedRows = getShiftRows(substitutedTextBytesInHexTwoLevelArray)
  
  console.log('textBytesInHexShiftedRows', textBytesInHexShiftedRows)

  console.log(MULT_MATRIX)
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

function getSubstitutedBytesInTwoLevelArray(twoLevelArrayOfBytesInHex) {
  return twoLevelArrayOfBytesInHex.map(byteInHexArray => {
    return getSubstitutedBytes(byteInHexArray)
  })
}

function getXorBetweenTextAndRoundKey(text16ByteInHexArray, roundKey) {
  let xorTextAndFirstRoundKey16ByteInHexArray = []
  
  for (let i = 0; i < text16ByteInHexArray.length; i++) {
    const textByteInHexColumn = text16ByteInHexArray[i];
    const keyByteInHexColumn = roundKey[i];
    
    xorTextAndFirstRoundKey16ByteInHexArray.push(getXorInHexArrayBetween(textByteInHexColumn, keyByteInHexColumn))
  }

  return xorTextAndFirstRoundKey16ByteInHexArray
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

const S_BOX = {
  '00': '63', '01': '7c', '02': '77', '03': '7b', '04': 'f2', '05': '6b', '06': '6f', '07': 'c5', '08': '30', '09': '01', '0a': '67', '0b': '2b', '0c': 'fe', '0d': 'd7', '0e': 'ab', '0f': '76',
  '10': 'ca', '11': '82', '12': 'c9', '13': '7d', '14': 'fa', '15': '59', '16': '47', '17': 'f0', '18': 'ad', '19': 'd4', '1a': 'a2', '1b': 'af', '1c': '9c', '1d': 'a4', '1e': '72', '1f': 'c0',
  '20': 'b7', '21': 'fd', '22': '93', '23': '26', '24': '36', '25': '3f', '26': 'f7', '27': 'cc', '28': '34', '29': 'a5', '2a': 'e5', '2b': 'f1', '2c': '71', '2d': 'd8', '2e': '31', '2f': '15',
  '30': '04', '31': 'c7', '32': '23', '33': 'c3', '34': '18', '35': '96', '36': '05', '37': '9a', '38': '07', '39': '12', '3a': '80', '3b': 'e2', '3c': 'eb', '3d': '27', '3e': 'b2', '3f': '75',
  '40': '09', '41': '83', '42': '2c', '43': '1a', '44': '1b', '45': '6e', '46': '5a', '47': 'a0', '48': '52', '49': '3b', '4a': 'd6', '4b': 'b3', '4c': '29', '4d': 'e3', '4e': '2f', '4f': '84',
  '50': '53', '51': 'd1', '52': '00', '53': 'ed', '54': '20', '55': 'fc', '56': 'b1', '57': '5b', '58': '6a', '59': 'cb', '5a': 'be', '5b': '39', '5c': '4a', '5d': '4c', '5e': '58', '5f': 'cf',
  '60': 'd0', '61': 'ef', '62': 'aa', '63': 'fb', '64': '43', '65': '4d', '66': '33', '67': '85', '68': '45', '69': 'f9', '6a': '02', '6b': '7f', '6c': '50', '6d': '3c', '6e': '9f', '6f': 'a8',
  '70': '51', '71': 'a3', '72': '40', '73': '8f', '74': '92', '75': '9d', '76': '38', '77': 'f5', '78': 'bc', '79': 'b6', '7a': 'da', '7b': '21', '7c': '10', '7d': 'ff', '7e': 'f3', '7f': 'd2',
  '80': 'cd', '81': '0c', '82': '13', '83': 'ec', '84': '5f', '85': '97', '86': '44', '87': '17', '88': 'c4', '89': 'a7', '8a': '7e', '8b': '3d', '8c': '64', '8d': '5d', '8e': '19', '8f': '73',
  '90': '60', '91': '81', '92': '4f', '93': 'dc', '94': '22', '95': '2a', '96': '90', '97': '88', '98': '46', '99': 'ee', '9a': 'b8', '9b': '14', '9c': 'de', '9d': '5e', '9e': '0b', '9f': 'db',
  'a0': 'e0', 'a1': '32', 'a2': '3a', 'a3': '0a', 'a4': '49', 'a5': '06', 'a6': '24', 'a7': '5c', 'a8': 'c2', 'a9': 'd3', 'aa': 'ac', 'ab': '62', 'ac': '91', 'ad': '95', 'ae': 'e4', 'af': '79',
  'b0': 'e7', 'b1': 'c8', 'b2': '37', 'b3': '6d', 'b4': '8d', 'b5': 'd5', 'b6': '4e', 'b7': 'a9', 'b8': '6c', 'b9': '56', 'ba': 'f4', 'bb': 'ea', 'bc': '65', 'bd': '7a', 'be': 'ae', 'bf': '08',
  'c0': 'ba', 'c1': '78', 'c2': '25', 'c3': '2e', 'c4': '1c', 'c5': 'a6', 'c6': 'b4', 'c7': 'c6', 'c8': 'e8', 'c9': 'dd', 'ca': '74', 'cb': '1f', 'cc': '4b', 'cd': 'bd', 'ce': '8b', 'cf': '8a',
  'd0': '70', 'd1': '3e', 'd2': 'b5', 'd3': '66', 'd4': '48', 'd5': '03', 'd6': 'f6', 'd7': '0e', 'd8': '61', 'd9': '35', 'da': '57', 'db': 'b9', 'dc': '86', 'dd': 'c1', 'de': '1d', 'df': '9e',
  'e0': 'e1', 'e1': 'f8', 'e2': '98', 'e3': '11', 'e4': '69', 'e5': 'd9', 'e6': '8e', 'e7': '94', 'e8': '9b', 'e9': '1e', 'ea': '87', 'eb': 'e9', 'ec': 'ce', 'ed': '55', 'ee': '28', 'ef': 'df',
  'f0': '8c', 'f1': 'a1', 'f2': '89', 'f3': '0d', 'f4': 'bf', 'f5': 'e6', 'f6': '42', 'f7': '68', 'f8': '41', 'f9': '99', 'fa': '2d', 'fb': '0f', 'fc': 'b0', 'fd': '54', 'fe': 'bb', 'ff': '16'
}

const MULT_MATRIX = [
  [2, 3, 1, 1],
  [1, 2, 3, 1],
  [1, 1, 2, 3],
  [3, 1, 1, 2]
]

const L_TABLE = {
  '00': '00', '01': '00', '02': '19', '03': '01', '04': '32', '05': '02', '06': '1a', '07': 'c6', '08': '4b', '09': 'c7', '0a': '1b', '0b': '68', '0c': '33', '0d': 'ee', '0e': 'df', '0f': '03',
  '10': '64', '11': '04', '12': 'e0', '13': '0e', '14': '34', '15': '8d', '16': '81', '17': 'ef', '18': '4c', '19': '71', '1a': '08', '1b': 'c8', '1c': 'f8', '1d': '69', '1e': '1c', '1f': 'c1',
  '20': '7d', '21': 'c2', '22': '1d', '23': 'b5', '24': 'f9', '25': 'b9', '26': '27', '27': '6a', '28': '4d', '29': 'e4', '2a': 'a6', '2b': '72', '2c': '9a', '2d': 'c9', '2e': '09', '2f': '78',
  '30': '65', '31': '2f', '32': '8a', '33': '05', '34': '21', '35': '0f', '36': 'e1', '37': '24', '38': '12', '39': 'f0', '3a': '82', '3b': '45', '3c': '35', '3d': '93', '3e': 'da', '3f': '8e',
  '40': '96', '41': '8f', '42': 'db', '43': 'bd', '44': '36', '45': 'd0', '46': 'ce', '47': '94', '48': '13', '49': '5c', '4a': 'd2', '4b': 'f1', '4c': '40', '4d': '46', '4e': '83', '4f': '38',
  '50': '66', '51': 'dd', '52': 'fd', '53': '30', '54': 'bf', '55': '06', '56': '8b', '57': '62', '58': 'b3', '59': '25', '5a': 'e2', '5b': '98', '5c': '22', '5d': '88', '5e': '91', '5f': '10',
  '60': '7e', '61': '6e', '62': '48', '63': 'c3', '64': 'a3', '65': 'b6', '66': '1e', '67': '42', '68': '3a', '69': '6b', '6a': '28', '6b': '54', '6c': 'fa', '6d': '85', '6e': '3d', '6f': 'ba',
  '70': '2b', '71': '79', '72': '0a', '73': '15', '74': '9b', '75': '9f', '76': '5e', '77': 'ca', '78': '4e', '79': 'd4', '7a': 'ac', '7b': 'e5', '7c': 'f3', '7d': '73', '7e': 'a7', '7f': '57',
  '80': 'af', '81': '58', '82': 'a8', '83': '50', '84': 'f4', '85': 'ea', '86': 'd6', '87': '74', '88': '4f', '89': 'ae', '8a': 'e9', '8b': 'd5', '8c': 'e7', '8d': 'e6', '8e': 'ad', '8f': 'e8',
  '90': '2c', '91': 'd7', '92': '75', '93': '7a', '94': 'eb', '95': '16', '96': '0b', '97': 'f5', '98': '59', '99': 'cb', '9a': '5f', '9b': 'b0', '9c': '9c', '9d': 'a9', '9e': '51', '9f': 'a0',
  'a0': '7f', 'a1': '0c', 'a2': 'f6', 'a3': '6f', 'a4': '17', 'a5': 'c4', 'a6': '49', 'a7': 'ec', 'a8': 'd8', 'a9': '43', 'aa': '1f', 'ab': '2d', 'ac': 'a4', 'ad': '76', 'ae': '7b', 'af': 'b7',
  'b0': 'cc', 'b1': 'bb', 'b2': '3e', 'b3': '5a', 'b4': 'fb', 'b5': '60', 'b6': 'b1', 'b7': '86', 'b8': '3b', 'b9': '52', 'ba': 'a1', 'bb': '6c', 'bc': 'aa', 'bd': '55', 'be': '29', 'bf': '9d',
  'c0': '97', 'c1': 'b2', 'c2': '87', 'c3': '90', 'c4': '61', 'c5': 'be', 'c6': 'dc', 'c7': 'fc', 'c8': 'bc', 'c9': '95', 'ca': 'cf', 'cb': 'cd', 'cc': '37', 'cd': '3f', 'ce': '5b', 'cf': 'd1',
  'd0': '53', 'd1': '39', 'd2': '84', 'd3': '3c', 'd4': '41', 'd5': 'a2', 'd6': '6d', 'd7': '47', 'd8': '14', 'd9': '2a', 'da': '9e', 'db': '5d', 'dc': '56', 'dd': 'f2', 'de': 'd3', 'df': 'ab',
  'e0': '44', 'e1': '11', 'e2': '92', 'e3': 'd9', 'e4': '23', 'e5': '20', 'e6': '2e', 'e7': '89', 'e8': 'b4', 'e9': '7c', 'ea': 'b8', 'eb': '26', 'ec': '77', 'ed': '99', 'ee': 'e3', 'ef': 'a5',
  'f0': '67', 'f1': '4a', 'f2': 'ed', 'f3': 'de', 'f4': 'c5', 'f5': '31', 'f6': 'fe', 'f7': '18', 'f8': '0d', 'f9': '63', 'fa': '8c', 'fb': '80', 'fc': 'c0', 'fd': 'f7', 'fe': '70', 'ff': '07'
}