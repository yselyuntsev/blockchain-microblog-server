function isNormalChar(char) {
  const pattern = /^[0-9a-zA-Zа-яёА-ЯЁ]+$/;
  return !!char.toString().match(pattern) || char === " ";
}

function isNullOrWhitespace(string = "") {
  return !string || !string.trim();
}

function normalizeString(string = "") {
  let resultString = "";

  for (const char of string.toLowerCase()) {
    if (isNormalChar(char)) resultString += char;
  }

  return resultString;
}

function getTokens(string = "") {
  const resultTokens = [];

  for (const word of string.split(" ")) {
    if (word.length >= 3) resultTokens.push(word);
  }

  return resultTokens;
}

function isTokensFuzzyEqual(
  firstToken = "",
  secondToken = "",
  subTokenLength = 0
) {
  let equalSubtokensCount = 0;
  let usedTokens = new Array(Math.abs(secondToken.length - subTokenLength + 1));

  for (let i = 0; i < firstToken.length - subTokenLength + 1; ++i) {
    let subtokenFirst = firstToken.substring(i, subTokenLength);

    for (let j = 0; j < secondToken.length - subTokenLength + 1; ++j) {
      if (!usedTokens[j]) {
        let subtokenSecond = secondToken.substring(j, subTokenLength);

        if (subtokenFirst.match(subtokenSecond)) {
          equalSubtokensCount++;
          usedTokens[j] = true;
          break;
        }
      }
    }
  }

  const subtokenFirstCount = firstToken.length - subTokenLength + 1;
  const subtokenSecondCount = secondToken.length - subTokenLength + 1;

  const tanimoto =
    (1.0 * equalSubtokensCount) /
    (subtokenFirstCount + subtokenSecondCount - equalSubtokensCount);

  return 0.45 <= tanimoto;
}

function getFuzzyEqualsTokens(tokensFirst = [], tokensSecond = []) {
  const equalsTokens = [];
  const usedToken = new Array(tokensSecond.length);

  for (let i = 0; i < tokensFirst.length; ++i) {
    for (let j = 0; j < tokensSecond.length; ++j) {
      if (!usedToken[j]) {
        if (isTokensFuzzyEqual(tokensFirst[i], tokensSecond[j], 2)) {
          equalsTokens.push(tokensFirst[i]);
          usedToken[j] = true;
          break;
        }
      }
    }
  }

  return equalsTokens;
}

function calculateFuzzyEqualValue(firstString = "", secondString = "") {
  if (isNullOrWhitespace(firstString) && isNullOrWhitespace(secondString))
    return 1.0;

  if (isNullOrWhitespace(firstString) || isNullOrWhitespace(secondString))
    return 0.0;

  const normalizedFirst = normalizeString(firstString);
  const normalizedSecond = normalizeString(secondString);

  const tokensFirst = getTokens(normalizedFirst);
  const tokensSecond = getTokens(normalizedSecond);

  const fuzzyEqualsTokens = getFuzzyEqualsTokens(tokensFirst, tokensSecond);

  const equalsCount = fuzzyEqualsTokens.length;
  const firstCount = tokensFirst.length;
  const secondCount = tokensSecond.length;

  return equalsCount / (firstCount + secondCount - equalsCount);
}

function isFuzzyEqual(firstString = "", secondString = "") {
  return 0.25 <= calculateFuzzyEqualValue(firstString, secondString);
}

module.exports = {
  calculateFuzzyEqualValue,
  isFuzzyEqual,
};
