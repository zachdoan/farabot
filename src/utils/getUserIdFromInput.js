const retardData = require('../retardData');

function getUserIdFromInput(input) {
    const mentionMatch = input.match(/^<@!?(\d+)>$/);
    if (mentionMatch) return mentionMatch[1];

    // Partial match on displayName (case-insensitive)
    const matches = [];
    for (const [id, data] of retardData.entries()) {
        if (data.displayName.toLowerCase().includes(input.toLowerCase())) {
            matches.push({ id, name: data.displayName });
        }
    }

    if (matches.length === 1) return matches[0].id;
    return null; // too many or zero matches
}

module.exports = getUserIdFromInput;