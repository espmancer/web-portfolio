// The best solution I can think of that doesn't involve some weird File I/O workaround.
// I will turn this code into something more object oriented eventually, probably when I have to make functions not related to the dictionaries
const dictionaries = new Map();
let dictionaryKey = ""

dictionaries.set('ictukV5', [
  "o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|",
  "kofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|"
]);
dictionaries.set('ictukV6', [
  "o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|From Kzhkaa \"kka\",\"not\" or later just \"ka\", mishearing of \"kk\", \"not\" from Kzh.",
  "kofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|From Zhoktuk \"gofa\", \"being, existence\", from Kzhokuut \"goa\", \"living thing\", from Kzhkaa \"ka\", \"living person\", from Kzh \"k\", \"person\""
]);

const conlangEntries = new Map();
const englishEntries = new Map();

function buildEntryMaps(){
  rawEntries = dictionaries.get(dictionaryKey)
  
  for (let i = 0; i < rawEntries.length; i++){
    rawEntry = rawEntries[i].split("|");
    key = rawEntry[0];
    conlangEntries.set(key, rawEntries[i])
    englishKeys = rawEntry[1].split(',');
    
    // Set English keys
    for (let x = 0; x < englishKeys.length; x++){
      key = englishKeys[x]
      englishEntries.set(key, rawEntries[i])
    }
  }
}

//Helper function to build the entry being displayed
function buildEntry(rawEntry){
  let elements = rawEntry.split('|');
  let key = elements[0];
  let name = elements[2];
  let translation = elements[3];
  let types = elements[4].split(',');
  let definitions = elements[5].split(',');
  let etymology = elements[6];
  let entry = `<div>${name} | ${translation}<ol>`;
  
  // Format definitions
  for (let i = 0; i < types.length; i++){
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
  entry += "<hr class='headerSeperator'/>"
  
  return entry;
}

// Iterate through all map values and return every entry as one big list
// Not sure if this is the best approach? This is O(n)
function listAllEntries(){
   const iterator = conlangEntries.values();
   let list = "";
   
   for (let i = 0; i < conlangEntries.size; i++){
      list += buildEntry(iterator.next().value);
   }
  
   return list;
}

// Update the div based on the input
function updateResult(query){
  query = query.toLowerCase();
  let entryExists = conlangEntries.has(query) || englishEntries.has(query);
  
  if (entryExists){
    rawEntry = (conlangEntries.has(query)) ? conlangEntries.get(query) : englishEntries.get(query);
    document.getElementById('entry').innerHTML = buildEntry(rawEntry, dictionaryKey);
  }
  else if (query === "") {
    document.getElementById('entry').innerHTML = listAllEntries();
  }
  else {
    document.getElementById('entry').innerHTML = "<div><p>Entry not found.</p></div>";
  }
}

function init(dictionaryKeyIn){
  dictionaryKey = dictionaryKeyIn
  buildEntryMaps(dictionaryKey);
  updateResult('');
}