/**
 * Returns the <p> tag for the welcome tag.
 * @param {boolean} bool console.logs the element
 * @returns {Element} Returns the element welcomeElem which is the <p> tag welcome tag
 */
function welcomeElement(bool) {
  let welcomeElem = document.getElementById('welcome');
  if (bool == true) {
    console.log(welcomeElem);
  }
  return welcomeElem;
}

/**
 * Resets the welcome message to default: Welcome to extpark!
 * @param {boolean} bool Prints out that the welcome message is reset
 * @returns {boolean} Returns whether there was a failure or not
 */
function resetWelcomeMessage(bool) {
  try {
    chrome.storage.sync.set({ welcome: 'Welcome to extpark!' });
  } catch (err) {
    if (bool == true) {
      console.error('Failed to reset welcome message. ' + err);
    }
    return false;
  }
  if (bool == true) {
    console.log('Reseted Welcome Message to => Welcome to extpark!');
  }
  return true;
}

/**
 * Removes the welcome message from the storage
 * @param {boolean} bool If specified as true, the function will log when successful
 * @returns {boolean} Returns whether there was a failure or not
 */
function removeWelcomeMessage(bool) {
  try {
    chrome.storage.sync.set({ welcome: '' });
  } catch (err) {
    if (bool == true) {
      console.log('Failed to remove welcome message. ' + err);
    }
    return false;
  }
  if (bool == true) {
    console.log('Successfully removed welcome message');
  }
  return true;
}

/**
 * Set the welcome message
 * @param {string} string Specifies the string to set the welcome message to
 * @returns {boolean} Returns whether there was a failure or not
 */
function setWelcomeMessage(string) {
  if (string === undefined) {
    console.info('No string value specified, setting to: ' + '""');
    string = '';
  }
  if (typeof string !== 'string') {
    console.error('Please specify a string');
    return false;
  }
  try {
    chrome.storage.sync.set({ welcome: string });
  } catch {
    return false;
  }
  return true;
}

/**
 * Removes all panels inside the storage of extpark
 * @param {boolean} bool console.logs that the cached panels are removed
 * @returns {boolean} Returns whether there was a failure or not
 */
function deletePanels(bool) {
  try {
    chrome.storage.sync.set({ panels: [] });
  } catch (err) {
    if (bool == true) {
      console.log('Failed to remove cached panels. ' + err);
    }
    return false;
  }
  if (bool == true) {
    console.log('Successfully removed all cached panels');
  }
  return true;
}
