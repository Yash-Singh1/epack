CodeMirror.commands.uncomment = function (cm) {
  let minLine = Number.POSITIVE_INFINITY;
  const ranges = cm.doc.listSelections();
  for (let index = ranges.length - 1; index >= 0; index--) {
    const from = ranges[index].from();
    let to = ranges[index].to();
    if (from.line >= minLine) {
      continue;
    }

    if (to.line >= minLine) {
      to = new CodeMirror.Pos(minLine, 0);
    }

    minLine = from.line;
    cm.uncomment(from, to);
  }
};

CodeMirror.commands.lineComment = function (cm) {
  let minLine = Number.POSITIVE_INFINITY;
  const ranges = cm.doc.listSelections();
  for (let index = ranges.length - 1; index >= 0; index--) {
    const from = ranges[index].from();
    let to = ranges[index].to();
    if (from.line >= minLine) {
      continue;
    }

    if (to.line >= minLine) {
      to = new CodeMirror.Pos(minLine, 0);
    }

    minLine = from.line;
    cm.lineComment(from, to);
  }
};

CodeMirror.keyMap.default['Ctrl-M'] = 'uncomment';
CodeMirror.keyMap.default['Ctrl-B'] = 'lineComment';
