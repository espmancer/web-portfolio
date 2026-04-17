// Not very scalable--in the future I will need to add support for more than 1 language, but I am adding this code in for the conlang I'm currently focused on.
const ictukEntries = new Map();
const englishEntries = new Map();

/* Add Ictuk entries */
// O
ictukEntries.set('o', "O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|From Kzhkaa \"kka\",\"not\" or later just \"ka\", mishearing of \"kk\", \"not\" from Kzh.")
  // This is my best attempt at mimicing a map with multiple keys to the same value
englishEntries.set('no', ictukEntries.get('o'))
englishEntries.set('not', ictukEntries.get('o'))
englishEntries.set('zero', ictukEntries.get('o'))
// Kofa
ictukEntries.set('kofa', "Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|From Zhoktuk \"gofa\", \"being, existence\", from Kzhokuut \"goa\", \"living thing\", from Kzhkaa \"ka\", \"living person\", from Kzh \"k\", \"person\"")
englishEntries.set('be', ictukEntries.get('kofa'))

//Helper function to build the entry being displayed
function buildEntry(rawEntry){
  let elements = rawEntry.split('|')
  let name = elements[0]
  let translation = elements[1]
  let types = elements[2].split(',')
  let definitions = elements[3].split(',')
  let etymology = elements[4]
  let entry = `<div>${name} | ${translation}<ol>`
  
  for (let i = 0; i < types.length; i++){
    entry += `<li><i>${types[i]}</i> ${definitions[i]}</li>`
  }
  
  entry += `</ol>${etymology}</div><hr class="headerSeperator"/>`
  
  return entry
}

// Iterate through all map values and return every entry as one big list
// Not sure if this is the best approach? This is O(n)
function listAllEntries(){
   const iterator = ictukEntries.values()
   let list = ""
   
   for (let i = 0; i < ictukEntries.size; i++){
      list += buildEntry(iterator.next().value)
   }
  
   return list
}

// Update the div based on the input
function updateResult(query){
  query = query.toLowerCase()
  let entryExists = ictukEntries.has(query) || englishEntries.has(query)
  
  if (entryExists){
    rawEntry = (ictukEntries.has(query)) ? ictukEntries.get(query) : englishEntries.get(query)
    document.getElementById('entry').innerHTML = buildEntry(rawEntry)
  }
  else if (query === "") {
    document.getElementById('entry').innerHTML = listAllEntries()
  }
  else {
    document.getElementById('entry').innerHTML = "<div><p>Entry not found.</p></div>"
  }
}