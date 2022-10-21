// Round key = array de 4 words
// Key schedule = array contendo todas as round keys
// a key schedule é composta de 11 round keys de 4 words. A original + 10 derivadas

function encrypt(textAreaValue, keyRawValue) {
  generateKey(keyRawValue)

  let sixteenCharArray = [...textAreaValue]

  console.log(get16ByteMatrixInColumnsArray(sixteenCharArray))
}

function generateKey(keyRawValue) {
  let fullWordArray = keyRawValue.split(',')
  
  const key = {}
  
  let roundKey0 = getFirstRoundKey(fullWordArray)

  key['w0'] = roundKey0
  
  let i = 1
  
  const roundConstantWords = generateRoundConstantWords()
  
  while (i <= 10) {
    const copyOfLastWordFromPreviousRoundKey = key[`w${i-1}`][3].map(byteInHex => byteInHex)
    const copyOfFirstWordFromPreviousRoundKey = key[`w${i-1}`][0].map(byteInHex => byteInHex)
    const firstWord = getFirstWord(copyOfLastWordFromPreviousRoundKey, roundConstantWords[i], copyOfFirstWordFromPreviousRoundKey)
    
    const previousRoundKey = key[`w${i-1}`]
    
    key[`w${i}`] = getRoundKey(firstWord, previousRoundKey)
    
    i++
  }

  console.log('key', key)
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

function getSubstitutedBytes(wordInHexArray) {
  return wordInHexArray.map(byte => S_BOX[byte])
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