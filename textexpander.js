var textExpander = function (textObjects, dictionary) {
    "use strict";
    if (!dictionary || !textObjects) {
        return;
    }
    if (!(textObjects instanceof Array)) {
        textObjects = [textObjects];
    }

    textObjects.forEach(function (textObject) {
        if (textObject) {
            textObject.removeEventListener("keydown", textExpanderEventListener); //remove duplicate event listener, if any
            textObject.addEventListener("keydown", textExpanderEventListener);
            textObject.removeEventListener("keyup", textHistoryEventListener); //remove duplicate event listener, if any
            textObject.addEventListener("keyup", textHistoryEventListener);
        }
    });

    function textExpanderEventListener(data) {
        var actionKeys, dataKey;
        if (data.key == undefined) {
            dataKey = "r" + data.keyCode + "x"; // used "r" as a prefix and "x" as a suffix for creating unique
            actionKeys = "r32xr188xr190xr49xr191xr186x"; // keyCode of " ,.!?;:" with prefix and suffix
        } else {
            dataKey = data.key;
            actionKeys = " ,.!?;:";
        }


        if ((data.which == 90 || data.keyCode == 90) && (data.ctrlKey || data.metaKey) && this.dataset.lastReplaced && this.dataset.lastKeystroke) {
            //ctrl+z and cmd+z
            var regexp = new RegExp(dictionary[this.dataset.lastReplaced] + this.dataset.lastKeystroke + '$');
            if (regexp.test(this.value)) {
                data.preventDefault();
                this.value = this.value.replace(regexp, this.dataset.lastReplaced + this.dataset.lastKeystroke);
            }
            delete this.dataset.lastReplaced;
            delete this.dataset.lastKeystroke;
            return;
        }else{

        }

        if (actionKeys.indexOf(dataKey) !== -1) {
            var selection = getCaretPosition(this);
            var result = /\S+$/.exec(this.value.slice(0, selection.end));
            if (result) {
                var lastWord = result[0];
                var selectionStart = result.input.length - lastWord.length;
                replaceLastWord(this, selectionStart, result.input.length, lastWord.toLowerCase());
            }
        }
    }

    function textHistoryEventListener(data) {
        var actionKeys, dataKey;
        if (data.key == undefined) {
            dataKey = "r" + data.keyCode + "x"; // used "r" as a prefix and "x" as a suffix for creating unique
            actionKeys = "r32xr188xr190xr49xr191xr186x"; // keyCode of " ,.!?;:" with prefix and suffix
        } else {
            dataKey = data.key;
            actionKeys = " ,.!?;:";
        }
        if (actionKeys.indexOf(dataKey) !== -1) {
            this.dataset.lastKeystroke = this.value.substr(-1);
        }else{
            delete this.dataset.lastReplaced;
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
            ctrl.dataset.lastReplaced = key;
        }
    }

};
