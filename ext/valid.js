/* eslint-disable implicit-arrow-linebreak */

/**
 * Validates panels
 * @param {Object[]} panelsGiven The array of panels
 */
function validPanelLst(panelsGiven) {
  if (!Array.isArray(panelsGiven)) {
    return false;
  }

  return panelsGiven.every(
    (panel) =>
      typeof panel.title === 'string' &&
      panel.title !== '' &&
      ['string', 'undefined'].includes(typeof panel.content) &&
      (Array.isArray(panel.styles) || typeof panel.styles === 'undefined') &&
      (Array.isArray(panel.scripts) || typeof panel.scripts === 'undefined') &&
      typeof panel.settings === 'object' &&
      panel.settings !== null
  );
}

// istanbul ignore else
if (typeof module !== 'undefined') {
  module.exports = validPanelLst;
}
