class Dictionary {
  conlangEntries;
  englishEntries;
  rawEntries;

  constructor() {
    this.conlangEntries = new Map();
    this.englishEntries = new Map();
  }

  buildEntryMaps() {
    for (let i = 0; i < this.rawEntries.length; i++) {
      let rawEntry = this.rawEntries[i].split("|");
      let key = rawEntry[0];
      this.conlangEntries.set(key, this.rawEntries[i]);
      this.englishKeys = rawEntry[1].split(",");

      // Set English keys
      for (let x = 0; x < this.englishKeys.length; x++) {
        key = this.englishKeys[x];
        this.englishEntries.set(key, this.rawEntries[i]);
      }
    }
  }

  //Helper function to build the entry being displayed
  buildEntry(rawEntry) {
    let dictionaryKey = "i";
    let elements = rawEntry.split("|");
    let key = elements[0];
    let name = elements[2];
    let translation = elements[3];
    let types = elements[4].split(",");
    let definitions = elements[5].split(",");
    let etymology = elements[6];
    let entry = `<div>${name} | ${translation}<ol>`;

    // Format definitions
    for (let i = 0; i < types.length; i++) {
      entry += `<li><i>${types[i]}</i> ${definitions[i]}</li>`;
    }

    // Add etymology
    entry += `</ol>${etymology}<br>`;
    // Add audio
    entry += `<audio controls><source src="../../../resources/${dictionaryKey}/sounds/${key}.ogg" type="audio/ogg">`;
    entry += `<source src="../../../resources/${dictionaryKey}/sounds/${key}.mp3" type="audio/mp3">`;
    entry += `Your browser does not support the audio tag.</audio></div>`;
    // Add image
    entry += `<image src="../../../resources/${dictionaryKey}/glyphs/words/${key}.svg" alt="${key}"></image>`;
    // Add separator
    entry += "<hr class='headerSeperator'/>";

    return entry;
  }

  // Iterate through all map values and return every entry as one big list
  // Not sure if this is the best approach? This is O(n)
  listAllEntries() {
    const iterator = this.conlangEntries.values();
    let list = "";

    for (let i = 0; i < this.conlangEntries.size; i++) {
      list += this.buildEntry(iterator.next().value);
    }

    return list;
  }

  // Update the div based on the input
  updateResult(query = "") {
    query = query.toLowerCase();
    let entryExists =
      this.conlangEntries.has(query) || this.englishEntries.has(query);

    if (entryExists) {
      let rawEntry = this.conlangEntries.has(query)
        ? this.conlangEntries.get(query)
        : this.englishEntries.get(query);
      document.getElementById("entry").innerHTML = this.buildEntry(rawEntry);
    } else if (query === "") {
      document.getElementById("entry").innerHTML = this.listAllEntries();
    } else {
      document.getElementById("entry").innerHTML =
        "<div><p>Entry not found.</p></div>";
    }
  }
}

class IctukV5 extends Dictionary {
  rawEntries = [
    "o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|",
    "kofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|",
  ];

  constructor() {
    super();
  }
}

class IctukV6 extends Dictionary {
  rawEntries = [
    'o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|From Kzhkaa "kka","not" or later just "ka", mishearing of "kk", "not" from Kzh.',
    'kofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|From Zhoktuk "gofa", "being, existence", from Kzhokuut "goa", "living thing", from Kzhkaa "ka", "living person", from Kzh "k", "person"',
  ];

  constructor() {
    super();
  }
}

const classMap = new Map();

// Add all classes into map
classMap.set("ictukV5", new IctukV5());
classMap.set("ictukV6", new IctukV6());
let o;

// Function for bridging the html call to the class function
function updateResult(query) {
  o.updateResult(query);
}

function init(className) {
  o = classMap.get(className);
  o.buildEntryMaps();
  o.updateResult();
}