var textExpander = function (textObjects, dictionary) {
    "use strict";
    if (!dictionary || !textObjects) {
        return;
    }
    if (!(textObjects instanceof Array)) {
        textObjects = [textObjects];
    }

    textObjects.forEach(function (textObject) {
        if(textObject){
            textObject.removeEventListener("keydown", textExpanderEventListener); //remove duplicate event listener, if any
            textObject.addEventListener("keydown", textExpanderEventListener);
        }
    });

    function textExpanderEventListener(data) {
        if( (data.which == 90 || data.keyCode == 90) && data.ctrlKey && textExpander.lastReplaced ) {
            data.preventDefault();
            this.value = this.value.replace(new RegExp(dictionary[textExpander.lastReplaced] + ' $'), textExpander.lastReplaced + ' ');
            delete textExpander.lastReplaced;
            return;
        }
        if (" ,.!?;:".indexOf(data.key) !== -1) {
            var selection = getCaretPosition(this);
            var result = /\S+$/.exec(this.value.slice(0, selection.end));
            if (result) {
                var lastWord = result[0];
                var selectionStart = result.input.length - lastWord.length;
                replaceLastWord(this, selectionStart, result.input.length, lastWord.toLowerCase());
            }
        }
    }


    function getCaretPosition(ctrl) {
        var start, end;
        if (ctrl.setSelectionRange) {
            start = ctrl.selectionStart;
            end = ctrl.selectionEnd;
        } else if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            start = 0 - range.duplicate().moveStart('character', -100000);
            end = start + range.text.length;
        }
        return {
            start: start,
            end: end
        }
    }

    function replaceLastWord(ctrl, start, end, key) {
        var rangeLength = end - start;
        var replaceWith = dictionary[key];
        if (!replaceWith) {
            return;
        }
        if (ctrl.setSelectionRange) {
            /* WebKit */
            ctrl.focus();
            ctrl.setSelectionRange(start, end);
        }
        else if (ctrl.createTextRange) {
            /* IE */
            var range = ctrl.createTextRange();
            rangctrl.collapse(true);
            rangctrl.moveEnd('character', end);
            rangctrl.moveStart('character', start);
            rangctrl.select();
        }
        else if (ctrl.selectionStart) {
            ctrl.selectionStart = start;
            ctrl.selectionEnd = end;
        }
        if (replaceWith) {
            ctrl.value = ctrl.value.substring(0, start) + replaceWith + ctrl.value.substr(end);
            ctrl.setSelectionRange(end + replaceWith.length, end + replaceWith.length - (rangeLength));
            textExpander.lastReplaced = key;
        }
    }

};
