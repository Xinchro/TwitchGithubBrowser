/**
  Removes all spaces from the incoming text
  @params {String} text - string to remove all the spaces from
  @returns {String} - the spaceless string
*/
function removeSpaces(text) {
  return text.replace(/\s/g, '')
}
