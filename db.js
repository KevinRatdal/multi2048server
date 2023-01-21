var loki = require('lokijs')

var db = new loki('ledatabase.db', {
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
})

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
    var highscores = db.getCollection("highscores");
    if (highscores === null) {
        entries = db.addCollection("highscores");
    }
}

module.exports = {db}