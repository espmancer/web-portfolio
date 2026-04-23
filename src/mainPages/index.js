// The best solution I can think of that doesn't involve some weird File I/O workaround.
const dictionaries = new Map();

dictionaries.set('ictukV5', "o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no||o\nkofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization||kofa")
dictionaries.set('ictukV6', "o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|From Kzhkaa \"kka\",\"not\" or later just \"ka\", mishearing of \"kk\", \"not\" from Kzh.|o\nkofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|From Zhoktuk \"gofa\", \"being, existence\", from Kzhokuut \"goa\", \"living thing\", from Kzhkaa \"ka\", \"living person\", from Kzh \"k\", \"person\"|kofa");

const conlangEntries = new Map();
const englishEntries = new Map();

function buildEntryMaps(dictionaryKey){
  rawEntries = dictionaries.get(dictionaryKey).split('\n')
  
  for (let i = 0; i < rawEntries.length; i++){
    rawEntry = rawEntries[i].split("|");
    key = rawEntry[0];
    englishKeys = rawEntry[1].split(',');
    value = rawEntry.slice(2).join('|');
    conlangEntries.set(key, value)
    
    // Set English keys
    for (let x = 0; x < englishKeys.length; x++){
      key = englishKeys[x]
      englishEntries.set(key, value)
    }
  }
}

//Helper function to build the entry being displayed
function buildEntry(rawEntry, dictionaryKey){
  let elements = rawEntry.split('|');
  let name = elements[0];
  let translation = elements[1];
  let types = elements[2].split(',');
  let definitions = elements[3].split(',');
  let etymology = elements[4];
  let image = elements[5];
  let entry = `<div>${name} | ${translation}<ol>`;
  
  for (let i = 0; i < types.length; i++){
    entry += `<li><i>${types[i]}</i> ${definitions[i]}</li>`;
  }

  entry += `</ol>${etymology}`;
  entry += `<image src="../../../resources/${dictionaryKey}/${image}.svg"></image></div><hr class="headerSeperator"/>`;
  
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
    document.getElementById('entry').innerHTML = buildEntry(rawEntry);
  }
  else if (query === "") {
    document.getElementById('entry').innerHTML = listAllEntries();
  }
  else {
    document.getElementById('entry').innerHTML = "<div><p>Entry not found.</p></div>";
  }
}

function init(dictionaryKey){
  buildEntryMaps(dictionaryKey);
  updateResult('');
}