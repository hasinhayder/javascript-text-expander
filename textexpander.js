const textExpander = (textObjects, dictionary) => {
    // textObjects: A single text object or an array of text objects
    // dictionary: An object with keys and values to replace
    if (!dictionary || !textObjects) return;

    // Convert textObjects to an array if it isn't already
    const textObjectsArray = Array.isArray(textObjects) ? textObjects : [textObjects];
    
    // Define the keys that will trigger the text expansion
    // Different browser support different key codes, so we'll use the key property if it's available
    // Otherwise, we'll use the keyCode property and convert it to a string
    const actionKeysByType = {
        true: " ,.!?;:",
        false: "r32xr188xr190xr49xr191xr186x" // Space, comma, period, exclamation point, question mark, semicolon, colon
    };

    const getActionKeys = (key) => actionKeysByType[key !== undefined];

    // Expand text on keydown
    const expandText = event => { 
        const { key, keyCode, ctrlKey, metaKey, target } = event;
        const dataKey = key ?? `r${keyCode}x`;
        const actionKeys = getActionKeys(key);

        if ((keyCode === 90) && (ctrlKey || metaKey) && target.dataset.lastReplaced && target.dataset.lastKeystroke) {
            const regexp = new RegExp(dictionary[target.dataset.lastReplaced] + target.dataset.lastKeystroke + '$');
            if (regexp.test(target.value)) {
                event.preventDefault();
                target.value = target.value.replace(regexp, target.dataset.lastReplaced + target.dataset.lastKeystroke);
            }
            delete target.dataset.lastReplaced;
            delete target.dataset.lastKeystroke;
            return;
        }

        if (actionKeys.includes(dataKey)) {
            const selection = getCaretPosition(target);
            const result = /\S+$/.exec(target.value.slice(0, selection.end));
            if (result) replaceLastWord(target, result.input.length - result[0].length, result.input.length, result[0]);
        }
    };

    // Store the last keystroke for later use
    const keyHistory = ({ key, keyCode, target }) => {
        if (getActionKeys(key).includes(key ?? `r${keyCode}x`)) {
            target.dataset.lastKeystroke = target.value.slice(-1);
        } else {
            delete target.dataset.lastReplaced;
        }
    };

    // Add event listeners to all text objects
    for (const textObject of textObjectsArray) {
        if (!textObject) continue;

        ["keydown", "keyup"].forEach(evtName => {
            const listener = evtName === "keydown" ? expandText : keyHistory;
            textObject.removeEventListener(evtName, listener);
            textObject.addEventListener(evtName, listener);
        });
    }

    // Helper function to get the caret position in a text field
    const getCaretPosition = ctrl => {
        if (ctrl.setSelectionRange) return { start: ctrl.selectionStart, end: ctrl.selectionEnd };
        
        if (document.selection && document.selection.createRange) {
            const range = document.selection.createRange();
            const start = 0 - range.duplicate().moveStart('character', -100000);
            return { start, end: start + range.text.length };
        }

        return { start: 0, end: 0 };
    };

    // Helper function to replace the last word in a text field
    const replaceLastWord = (ctrl, start, end, key) => {
        const replaceWith = dictionary[key.toLowerCase()];
        if (!replaceWith) return;
    
        // Determine the correct replacement based on the original word's case.
        const replaced = key.charAt(0) === key.charAt(0).toUpperCase() ? 
                         capitalizeFirstLetter(replaceWith) : 
                         replaceWith;
    
        const preText = ctrl.value.substring(0, start);
        const postText = ctrl.value.substr(end);
        ctrl.value = preText + replaced + postText;
    
        const adjustedPosition = end + replaced.length - key.length;
        ctrl.setSelectionRange(adjustedPosition, adjustedPosition);
        ctrl.dataset.lastReplaced = key;
    };
    
    // Helper function to capitalize the first letter of a string
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    
};
