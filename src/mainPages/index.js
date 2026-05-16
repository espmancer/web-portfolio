/*
  DICTIONARY CODE
  Handles conlang dictionary entries and queries.
  I am also throwing the SVG parsing code in here temporarily. Later down the line I will refactor again but I don't want to right now
  Raw entries are formatted key|englishKey|word|translations|types|definitions|etymology
*/
class Dictionary {
  conlangEntries;
  englishEntries;
  rawEntries;
  className;
  invisible;
  thin;
  wide;
  short;
  doubles;
  colors;
  svgWidth;
  svgHeight;

  constructor(className) {
    this.conlangEntries = new Map();
    this.englishEntries = new Map();
	  this.colors = new Map([
		["#n", "#bac2de"],
		["#h", "#a6d189"] 
	]);
    this.className = className;
    this.svgWidth = 0;
    this.svgHeight = 0;
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
    entry += `<audio controls><source src="../../../resources/${this.className}/sounds/${key}.ogg" type="audio/ogg">`;
    entry += `<source src="../../../resources/${this.className}/sounds/${key}.mp3" type="audio/mp3">`;
    entry += `Your browser does not support the audio tag.</audio></div>`;
    // Add image
    entry += this.draw(key);
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

  // Parse the numbers in the phrase and return an array of said numbers
  getLineNumbers(phrase = "") {
    let lineNumbers = [];

    for (let i = 0; i < phrase.length; i++){
        if (!isNaN(phrase[i])){
            lineNumbers.push(parseInt(phrase[i]));
        }
        else if (phrase[i] === '-'){
            i++;
            lineNumbers.push(parseInt(phrase[i]) * -1);
        }
    }

    if (phrase.length === 0 || lineNumbers.length === 0){
      lineNumbers = [0];
    }	

    return lineNumbers;
  }

  // Parse the full phrase and tokenize each relevant character into an array, and return that array
  tokenize(phrase){
    let tokens = [];
    phrase = phrase.replaceAll(' ', '');
    let lineNumbers = this.getLineNumbers(phrase);
    //Get highest line number
    const highestLine = Math.max(...lineNumbers);
    // For every non number, tokenize
    let lineNumberIndex = 0;
    let currentX = 0;
	  let currentColor = this.colors.get("#n");

    for (let i = 0; i < phrase.length; i++){
        let currentLine = lineNumbers[lineNumberIndex];
        let char = phrase[i];
        
		// Check for color token
        if (phrase[i] === '#') {
            const colorToken = phrase.slice(i, i + 2);
        
            if (this.colors.has(colorToken)) {
                currentColor = this.colors.get(colorToken);
                i++;
                continue;
            }
        }
        
        // Check for doubles
        const pair = phrase.slice(i, i + 2);
            if (this.doubles.includes(pair)) {
            char = pair;
            i++;
        }
        
        // Check token
        if (!/[\d-]/.test(phrase[i])){
            const isThin = this.thin.includes(char);
	    	const isWide = this.wide.includes(char);
            const isShort = this.short.includes(char);
            let token = {
                name: "",
                line: currentLine,
                x: currentX,
                y: 125 * (highestLine - currentLine) + (isShort && currentLine > 0 ? 50 : 0),
				color: currentColor
            }
	    let xShift = isThin ? 25 : isWide ? 125 : 75;
            currentX += xShift;
	    this.svgWidth += xShift;
                
            // Check if invisible glyph
            if (!this.invisible.includes(char)){
                token.name = char;
                tokens.push(token);
            }
        }
        else if (/[\d]/.test(char) && i !== 0){
            lineNumberIndex++;
            currentX = 0;
        }
    }
    // Set height and width of screen
    this.svgHeight = 125 * lineNumbers.length;
         
    return tokens;
  }

  //Generate and append the svg code for the phrase provided
  draw(phrase){
	this.svgWidth = 0;
    this.svgHeight = 0;
    const tokens = this.tokenize(phrase);
    let output = `<svg width="${this.svgWidth}" height="${this.svgHeight}"
    viewBox="-12.5 -12.5 ${this.svgWidth} ${this.svgHeight}"><g stroke-width="10" stroke-linecap="square" fill="none">`
    
    for (const token of tokens){
        output += `<use href="#${token.name}" transform="translate(${token.x}, ${token.y})" stroke="${token.color}"/>`
    }
    
    output += "</g></svg>";
    
    return output;
  }
}

class IctukV5 extends Dictionary {
  rawEntries = [
    "o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|",
    "kofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|",
  ];
  invisible = ['/', '|'];
  thin = ['|', 'zh'];
  wide = [];
  short = ['o', 'f', 'zh', 'u', 'ou', 'sh', 'Eq', 'Sq'];
  doubles = ['sh', 'zh', 'mb', 'ou', 'ng', 'Eq', 'Sq'];

  constructor(className) {
    super(className);
  }
}

class IctukV6 extends Dictionary {
  rawEntries = [
    'o|no,not,zero|O|No, Not, Zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|From Kzhkaa "kka","not" or later just "ka", mishearing of "kk", "not" from Kzh.',
    'kofa|be|Kofa|Be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|From Zhoktuk "gofa", "being, existence", from Kzhokuut "goa", "living thing", from Kzhkaa "ka", "living person", from Kzh "k", "person"',
  ];

  constructor(className) {
    super(className);
  }
}

const classMap = new Map();

// Add all classes into map
classMap.set("ictukV5", new IctukV5("ictukV5"));
classMap.set("ictukV6", new IctukV6("ictukV6"));
let conlang;

//For html calling
function updateResult(query = ""){
  conlang.updateResult(query);
}


window.dictionaryInit = function(className) {
  conlang = classMap.get(className);
  conlang.buildEntryMaps();
  conlang.updateResult();
  
  const glyphs = document.querySelectorAll(".draw");
  
  for (var i = 0; i < glyphs.length; i++) {
    let svg = conlang.draw(glyphs[i].dataset.phrase);
    glyphs[i].innerHTML = svg;
  }
  //Listen for user parser event
  const userParser = document.getElementById("userParser");
  
  userParser.addEventListener("input", function (event) {
	console.log(parserValue);
    document.getElementById("drawAsync").innerHTML = conlang.draw(userParser.value);
  });
};

/*
  BLOG CODE
  Helps to compress index.html by putting all of the blogs in a delimited string list and building them onload
  Raw entries are formatted datetime|header|content
*/
class Blog {
  rawEntries = [
    "d033026t1740|Hello, world!|I wanted to overhaul my website a bit, as it was a little gross to look at. Coincidentally, I'm rebuilding it exactly one year after I last updated it. I would like to post semi-frequently here, no promises though, school has me pretty swamped, but maybe that's something I can talk about. Who knows! Admittedly, I'm still not experienced at all in HTML, but I have a little more patience to research now than I was last year. Still though, I'm warning you now if you decide to tread through my code, as it could be pretty attrocious, I dunno (I promise I'm better at backend, lol).",
    "d040126t1432|Shutting this site down...|April fools! I'm probably about 75% of the way there with getting this site done. My biggest endeavor, which I saved for last, is the <a href=\"interestsPage.html\">interests page</a>, and its constituent pages. I intend on implementing the documentation for <a href=\"docPages/galusSystem.html\">my world</a> and all of my conlangs, which luckily both things already have docs that I just need to organize in HTML.<br> In other news, I am behind on school work, which is dreadful, but after making a to-do list of the things I need to do, it doesn't seem nearly as lengthy as it's felt.",
    "d040226t1000|Creative Writing Prompt 1|When I was in highschool, I was in a creative writing club. This particular post had 4 restrictions: <ol> <li>Limit: 250 words (I used 247)</li> <li>Genre: Drama</li> <li>Phrase (large idea of narrative): People watching</li> <li>Word Required: Enter/enters</li> </ol> <strong>Fun Fact:</strong> The 1st couple sections (or paragraphs technically) are pulled from the prologue of my book at the time. <br><strong>What I Wrote</strong> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The surrounding area makes a stinging iciness run down my spine that makes my heart pound harder than a hammer to a nail. Visions rush to my mind, an excruciating shock plunging deeply into the very depths of my body. Before I could even think of acting, agonizing pain and chill vanishes in an instant, and the discernment of anything dissipates. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The only perceptible sense was sight, as if my imagination had suddenly sparked like it had done in my early years of childhood. The glare of what seemed to be a star grows at a blinding rate, before revealing green fields, the warmth of a summer day feeding nostalgia of my past. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Panicked, I turned towards the direction of the question. Staring at me with a curious look was a little girl, about 5 years old, with long braided hair. A brunette, hazel eyes, that looked of Spanish descent. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>What?</i> The word becomes lost, air escaping my lips like it was ripped out of my body. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"That you helped destroy them?\" Her innocence was unearthly. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A piercing headache cuts through my mind and a vision of blurry humanoids forms into my line of sight. Loud beeping pounds my eardrums, and the only meager detail I can apprehend is the fear of everyone watching and working as they try to solve the cause of their distress.<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Several more people enter the room with great haste, panicked sweat glistening in fluorescent lighting. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\"We\'re losing her!\"",
    "d040726t2210|Karaoke + Linux (Inevitable Jank)|I've recently learned that there is software to program karaoke songs, so I may have a new hobby. For some context, my girlfriend's family loves to do karaoke, and the software they use is called <a href=\"https://www.karafun.com\">Karafun</a>. The program I currently use is called CDG Magic, which in order to run on my work laptop (that runs <a href=\"https://mxlinux.org\">MX Linux</a>), I had to run a program called <a href=\"https://usebottles.com\">Bottles</a>. Then, I realized the program only took WAV files, and required a very specific header format. To fix this, I found a <a href=\"https://www.reddit.com/r/ffmpeg/comments/kepmsa/comment/gg9esxk/?force-legacy-sct=1\">forum post</a> that recommended using sox to convert an mp3 into a WAV, and that finally worked. So now I'm making a karaoke file for <a href=\"https://www.youtube.com/watch?v=xIoXE4q-Jes\">Against the Kitchen Floor</a> by Will Wood.",
    "d041726t1327|It was only a matter of time|I avoided it for as long as I can, but alas, I finally had to use JavaScript. I know, it's a terrible fate, I accept your grievances... <br/>Anyhow, I had to use it to make a dictionary lookup thing for the (WIP) 6th version of <a href=\"docPages/ictuk/ictukV6.html\">Ictuk</a>. I'm honestly pretty proud of it, it took some time and a lot of <a href=\"https://www.w3schools.com\">w3schools</a> lookups. My hope for the dictionary is to make an easy-to-use word search for when someone forgets a word when using the language. My original solution to this problem was to make a \"light dictionary\" tab in a Google sheet I used to V5, with one column being Ictuk words and the other being English, and it worked...okay, but Ictuk shares some letters with English, and CTRL+F on Google sheets uses some form of <a href=\"https://en.wikipedia.org/wiki/Regular_expression\">Regex</a>, so more often than not I'd still end up sifting through the dictionary that was intended not to be sifted through in the first place. With my new dictionary code, you can look up a specific word from either Ictuk or English, and it will pop up if there's a match (not case sensitive). As of making this post, there are only 2 Ictuk words, <i>kofa</i> and <i>o</i>.",
    "d050926t1738|Summer break!|I'm finally free from this rough college semester. For the next 3 months, I'm mostly gonna be working, but past that I'm planning on racing with my dad, working on passjon projects (maybe finally working on my game lol), and I will especially be working on this site. Just this weekend I completely refactored my JavaScript code to be more object oriented, and I feel more sane looking at it than before it was refactored. Of course, being JavaScript, even the OOP-side has its quirks in syntax, but they're tolerable. There's currently 4 classes as of writing this: Dictionary, which is a parent class for all dictionary related functions (populating and filtering entries) in the conlang documentation pages, IctukV5 and IctukV6, which are child classes for Dictionary, and Blog, which uses the same formatting and functions as Dictionary, but for the blog posts instead. Both of the parent classes hopefully can make the HTML files noticeably smaller, and make my life easier by automating entries instead of me writing them individually.",
	"d051326t1540|New parser! That was miserable|I just finished creating and implementing a parser for <a href=\"https://selisine.onrender.com/docPages/ictuk/ictukV5.html\">Ictuk</a>'s glyph system. It doesn't fully translate (yet?), but it can take in a specially-formatted string that generates the glyphs for me, which has already proved to be much faster than manually having to paste and adjust group references in SVG. I would like to add the ability to change the text color so I can replace the highlighted character examples (like all the ones in <a href=\"https://selisine.onrender.com/docPages/ictuk/ictukV5.html#Writing\">the writing section</a>. I would also like to add a section for user-input, in case someone wants to use it for chatting. I'll post a guide when I make it more user oriented. Overall, it's very rough around the edges, and implementing it into my Dictionary class structure has showed me that I need yet another refactoring, but that's for another day.<br>Here's an example with \"kofafashbut\". The string for this would be \"0kofabut 1////fash\".<br><img src=\"resources/ictukV5/glyphs/examples/kofafashbut.svg\">"
    ]

  // Helper method for buildAllEntries
  buildEntry(rawEntry){
    let elements = rawEntry.split("|");
    let datetime = elements[0];
    let header = elements[1];
    let content = elements[2];
    let entry = `<div id="${datetime}"><h1>${header}</h1><sub>`;
    
    //Format datettime for subtext
    let month = datetime.substr(1, 2);
    let day = datetime.substr(3, 2);
    let year = "20" + datetime.substr(5, 2);
    let militaryHour = parseInt(datetime.substr(8, 2));
    let minute = datetime.substr(10, 2);
    let hour =
        (militaryHour % 12 === 0)
        ? 12
        : militaryHour % 12;
    let meridiem =
        (militaryHour >= 12)
        ? "PM"
        : "AM";
    
    entry += `${month}/${day}/${year} `;
    entry += `${hour}:${minute} ${meridiem}`;
    entry += `</sub><br><p>${content}</p></div>`;
    entry += `<hr class="headerSeperator"/>`;

    return entry;
  }

  // Helper method for buildAllEntries
  buildHeaderLink(rawEntry){
    let elements = rawEntry.split('|');
    let datetime = elements[0];
    let header = elements[1];
    let entry = `<a class="headerLink" href="#${datetime}">${header}</a>`
    entry += "<hr class=\"headerSeperator\">"

    return entry;
  }

  buildHeaderLists(){
    let list = "";

    for (let i = this.rawEntries.length; i > 0; i--) {
      list += this.buildHeaderLink(this.rawEntries[i-1]);
    }

    document.getElementById("headers").innerHTML = list;
  }

  listAllEntries() {
    let list = "";

    for (let i = this.rawEntries.length; i > 0; i--) {
      list += this.buildEntry(this.rawEntries[i-1]);
    }

    document.getElementById("entry").innerHTML = list;
  }
}

let blog = new Blog();

function blogInit(){
  blog.buildHeaderLists();
  blog.listAllEntries();
}
