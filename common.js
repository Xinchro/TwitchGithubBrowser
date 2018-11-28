var twitch = window.Twitch.ext

/**
  Removes all spaces from the incoming text
  @params {String} text - string to remove all the spaces from
  @returns {String} - the spaceless string
*/
function removeSpaces(text) {
  return text.replace(/\s/g, '')
}

/**
  Removes the element, who has the given ID, from the document
  @params {String} id - the ID of the element we want to remove
*/
function removeElement(id) {
  document.getElementById(id).remove()
}