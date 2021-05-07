/**
 * Unpacks the given panel into one that can be sent to the extension
 * @param {Object} panel The panel object that is used
 * @param {string} panelName The name of the panel
 */
function unpack(panel, panelName) {
  /**
   * Parses the content if it is a string and isn’t empty
   * @param {*} content The content to parse
   * @returns {*} The parsed content
   */
  function parseJSON(content) {
    return typeof content === 'string' && content !== '' ? JSON.parse(content) : content;
  }

  let index;

  /**
   * Searches through a list for a name
   * @param {object[]} lst List of objects
   * @param {string} nameWanted The name searched for
   */
  function getByNameLst(lst, nameWanted) {
    return lst.find((value) => value.name === nameWanted);
  }

  panel = parseJSON(panel);
  const returned = {};
  returned.settings = panel.settings;
  const lst = parseJSON(panel.tabs);
  returned.content = getByNameLst(lst, 'HTML') ? getByNameLst(lst, 'HTML').configuration.value : undefined;
  returned.title = panelName;
  let currentNumber = 1;
  while (true) {
    if (getByNameLst(lst, 'STYLE' + currentNumber)) {
      currentNumber += 1;
    } else {
      currentNumber -= 1;
      break;
    }
  }

  let anotherNumber = 1;
  while (true) {
    if (getByNameLst(lst, 'SCRIPT' + anotherNumber)) {
      anotherNumber += 1;
    } else {
      anotherNumber -= 1;
      break;
    }
  }

  if (currentNumber !== 0) {
    returned.styles = [];
  }

  if (anotherNumber !== 0) {
    returned.scripts = [];
  }

  for (index = 1; index <= currentNumber; index += 1) {
    returned.styles.push(getByNameLst(lst, 'STYLE' + index).configuration.value);
  }

  for (index = 1; index <= anotherNumber; index += 1) {
    returned.scripts.push(getByNameLst(lst, 'SCRIPT' + index).configuration.value);
  }

  return returned;
}

// Export for tests... Implementing later
if (typeof module !== 'undefined') {
  module.exports = unpack;
}
