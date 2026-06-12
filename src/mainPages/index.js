/*
  DICTIONARY CODE
  Handles conlang dictionary entries and queries.
  I am also throwing the SVG parsing code in here temporarily. Later down the line I will refactor again but I don't want to right now
  Raw entries are formatted key|englishKey|types|definitions|etymology
*/
class Dictionary {
  conlangEntries;
  englishEntries;
  rawEntries;
  className;
  invisible;
  thin;
  wide;
  double;
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

  // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
  toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  //Helper function to build the entry being displayed
  buildEntry(rawEntry) {
    let elements = rawEntry.split("|");
    let key = elements[0];
    let name = this.toTitleCase(key);
    let translation = this.toTitleCase(elements[1].replaceAll(',', ", "));
    let types = elements[2].split(",");
    let definitions = elements[3].split(",");
    let etymology = elements[4];
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

  // Parse the full phrase and tokenize each relevant character into an array, and return that array
  tokenize(phrase){
    //Lines and line numbers
    const lineNumbers = (phrase.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)/g) || [0])
    .map(Number);
    const min = Math.min(...lineNumbers);
    const shiftedLineNumbers = lineNumbers.map(n =>
        (Number.isInteger(n) ? n : n + 0.1) * -1
    );
    const ys = shiftedLineNumbers.map(n => n * 125);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const noColorLines = phrase.replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)|#(\p{L})/gu, "").split(' ');
    const lines = phrase.replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)/g, "").split(' ');
    //Size and position vars
    this.svgHeight = lineNumbers.length * 125;
    this.viewboxYShift = minY;
    this.svgHeight = maxY - minY + 150;
    const longestLineLength = Math.max(...noColorLines.map(str => str.length));
    this.svgWidth = longestLineLength * 75;
    let currentX;
    //Tokens and types
    const tokens = new Array();
    let currentColor = this.colors.get('#n');
    
    for (let i = 0; i < shiftedLineNumbers.length; i++){
        currentX = 0;
        
        for (let x = 0; x < lines[i].length; x++){
          let glyph = lines[i][x];
          const tempDouble = glyph + lines[i][x + 1];
          
          //Check for color tags
          const isColor = this.colors.has(tempDouble);
          if (isColor){
              currentColor = this.colors.get(tempDouble);
              x += isColor;
              continue;
          }
          else { 
            //Check for doubles
            const isDouble = this.double.includes(tempDouble)
            glyph = isDouble ? tempDouble : glyph;
            x += isDouble;
            //Define rest of flags
            const isInvisible = this.invisible.includes(glyph);
            const isWide = this.wide.includes(glyph);
            const isThin = this.thin.includes(glyph);
            
            if (!isInvisible){
                tokens.push({
                    name: glyph,
                    x: currentX,
                    y: shiftedLineNumbers[i] * 125,
                    color: currentColor
                })
            }
            
            const width = isThin ? 25 : isWide ? 75 : 50;
            currentX += 25 + width;
        }
      }
    }
    //Debug
    // console.log("Raw Entry:", phrase);
    // console.log("Colorless Lines:", noColorLines);
    // console.log("Lines:", lines);
    // console.log("Line Numbers:", lineNumbers);
    // console.log("Shifted Line Numbers:", shiftedLineNumbers);
    // console.log("SVG Height:", this.svgHeight);
    // console.log("SVG Width:", this.svgWidth);
    
    return tokens;
}

  //Generate and append the svg code for the phrase provided
  draw(phrase){
	this.svgWidth = 0;
    this.svgHeight = 0;
    const tokens = this.tokenize(phrase);
    const sizeFactor = 0.75;
    let output = `<svg width="${this.svgWidth * sizeFactor}" height="${this.svgHeight * sizeFactor}"
    viewBox="-12.5 ${this.viewboxYShift} ${this.svgWidth} ${this.svgHeight -25}"><g stroke-width="10" stroke-linecap="square" fill="none">`
    
    for (const token of tokens){
        output += `<use href="#${token.name}" transform="translate(${token.x}, ${token.y})" stroke="${token.color}"/>`
    }
    
    output += "</g></svg>";
    
    return output;
  }

  checkQuestion(id, correctAnswer){
    const entry = document.getElementById(`entry${id}`).value.toLowerCase();
    const status = document.getElementById(`status${id}`)
    const answers = correctAnswer.split('|');
    let correct;
    
    for (let i = 0; i < answers.length; i++){
      if (entry === answers[i]){
        status.innerHTML = `<p id="status${id}">Correct!</p>`
        break;
      }
      else {
        status.innerHTML = `<p id="status${id}">Incorrect!</p>`
      }
    }
  }
}

class IctukV5 extends Dictionary {
  rawEntries = [
    "o|no,not,zero|Adv.,Adj.,Adj.,Intj.,N.|used as a function word to make negative a group of words or a word,not any,having no magnitude or quantity,not so,an act or instance of refusing or denying by the use of the word no|",
    "kofa|be|V.,V.|to have identity with: to constitute the same idea or object as,to have a specified qualification or characterization|",
    "u|only,single,just,one|Adj.,Adj.,Adv.,Adv.,Adv.|alone in a class or category,consisting of or having only one part/feature/portion,exactly,simply,barely|",
    "fash|good,yes|Adj.,Adv.|of a high or desired quality,used as a function word to express assent or agreement|",
    "apa|unit|N.|a determinate quantity adopted as a standard of measurement|",
    "mbupa|week|N.|any six consecutive days|",
    "fotap|fight|V.,V.,N.,N.|to contend in battle or physical combat,to struggle to endure or surmount,a hostile encounter,a verbal disagreement|",
    "fotash|hello|N.|an expression or gesture of greeting|",
    "fotazhupa|goodbye|N.|a concluding remark or gesture at parting|",
    "akozh|fear,scare,scary|N.,V.,V.,Adj.|an unpleasant often strong emotion caused by anticipation or awareness of danger,to be filled with concern or regret over an unwanted situation,to frighten especially suddenly,causing fright|",
    "but|you|Pn.|the one being addressed|",
    "buzh|you all,y'all,you|Pn.,Pn.|plural form of you,the ones being addressed|",
    "fazhk|future,forward|Adj.,N.,Adj.,Adv.|existing or occurring at a later time,time that is to come,near/being at/belonging to the forepart,to or toward what is ahead or in front|",
    "fazho|over|Adv.,Adv.,Prep.|from one person or side to another,beyond some quantity/limit/norm often by a specified amount or to a specified degree,used as a function word to indicate position on or motion to the other side or beyond|",
    "fushkazhk|top|Adj.|of, relating to, or being at the top|",
    "fazhouk|go|V.,V.,V.|to move or travel in a particular way or direction or for a particular distance, to take a certain course or follow a certain procedure, to begin an action or motion|",
    "nguho|think,thought,idea|V.,V.,N.,N.|to form or have in the mind,to have as an opinion,something formed in the mind,a formulated thought or opinion|",
    "nguhoq|know,knowledge|V.,N.|to have understanding of,information/understanding/skill that you get from experience or education|",
    "ouktuk|ictuk|N.|the primary language of the Ictuza|",
    "ouktuzha|ictuza|Adj.,N.|of/relating to/or characteristic of ictuza|one or more bipedal Synoeca vespids|",
    "pung|let|V.|to give opportunity to or fail to prevent|",
    "tuf|i|Pn.|the one who is speaking or writing|",
    "tuzh|we|Pn.|I and the rest of a group that includes me|",
    "uk|hook,of,pin|N.,N.,V.,Prep.|a curved or bent device for catching/holding/pulling,something intended to attract and ensnare,to get the attention of someone,used as a function word to indicate origin or derivation|",
    "ukosh|death,die,dead,low,less|N.,V.,Adj.,Adj.,Adj.,Adj.,Adj.,Adj.|a permanent cessation of all vital functions,to pass from physical life,deprived of life; no longer alive,inanimate,situated or passing below the normal level/surface/base of measurement/the mean elevation,small in number or amount,of lesser degree/size/amount than average or ordinary,constituting a more limited number or amount|",
    "zhoub|job,do|N.,Adj.,V.|a specific duty/role/function,of or relating to a job or to employment,perform/execute|",
    "kou|at|Prep.|used as a function word to indicate presence or occurrence in/on/near|",
    "osh|it (1),thing|Pn.,N.|that one; used as subject or direct object or indirect object of a verb or object of a preposition usually in reference to a lifeless thing,an object or entity not precisely designated or capable of being designated|",
    "fazh|occurence|N.|the action or fact of happening or occurring|",
    "ofazh|past|Adj.,Prep.|just gone or elapsed,at the farther side of|",
    "ta|also|Adv.|in addition|",
    "ngu|question,ask|N.,V.|an interrogative expression often used to test knowledge,to call on for an answer|",
    "nguposh|who|Pn.|what or which person or persons|",
    "uknguposh|whose|Pn.|that which belongs to whom|",
    "nguosh|what|Pn.|used as an interrogative expressing inquiry about the identity/nature/value of an object or matter|",
    "ngufazh|when|Adv.,Cjn.|at what time,at or during the time that|",
    "ngupapsho|where|Adv.|at/in/or to what situation/position/direction/circumstances/respect|",
    "nguu|why|Adv.,Cjn.|for what cause/reason/purpose,the cause/reason/purpose for which|",
    "ngufazho|how|Adv.,Cjn.|in what manner or way,the way or manner in which|",
    "posh|they (1)|Pn.|that person|",
    "poshozh|they (2)|Pn.|that other person|",
    "oshozh|it (2)|Pn.|that other animal/thing|",
    "pozh|they (3)|Pn.|those people|",
    "ozh|they (4)|Pn.|those animals/things|",
    "pozhozh|they (5)|Pn.|those other people|",
    "ozhozh|they (6)|Pn.|those other animals/things|",
    "oup|on|Prep.,Prep.|used as a function wd to indicate position in contact with and suppted by the top surface of,used as a function wd to indicate position in  in contact with an outer surface|",
    "fazha|with|Prep.|in respect to|",
    "oupu|in|Prep.|used as a function wd to indicate inclusion/location/position within limits|",
    "opu|out|Prep.,Adv.|used as a function word to indicate an outward movement,in a direction away from the inside or center|",
    "fazhkoupu|through|Prep.|used as a function wd to indicate movement into something at one side  point and out at another and especially the opposite side of|",
    "fazhku|toward|Prep.|in the direction of|",
    "akozho|need|N.,V.,V.|a lack of something requisite/desirable/useful,to be necessary,to require|",
    "hapo|have|V.|to hold  maintain (something tangible/intangible) as a possession/privilege/entitlement/responsibility|",
    "sho|this (1)|Pn.|the person/thing that is present  near in place/time/thought that has just been mentioned|",
    "sha|that|Pn.,Cjn.|the person/thing indicated/mentioned/understood from the situation,—used as a function word to introduce a noun clause that is usually the subject or object of a verb or a predicate nominative|",
    "shou|this (2)|Pn.|the idea/concept that is present  near in place/time/thought that has just been mentioned|",
    "shozh|these|Pn.|the people/things that are present near in place/time/thought that have just been mentioned|",
    "shazh|those (1)|Pn.|the people/things indicated/mentioned/understood from the situation|",
    "shouzh|those (2)|Pn.|the ideas/concepts indicated/mentioned/understood from the situation|",
    "foupuzh|every|Adj.|being each individual or part of a group without exception|",
    "foupuzhosh|everything|Pn.|all that relates to the subject|",
    "foupuzhpozh|everyone|Pn.|every person|",
    "aa|and|Cjn.|used as a function word to indicate connection or addition especially of items within the same class or type|",
    "ushkofazhapa|year|N.|a cycle in the Ictuza calendar of 108 days|",
    "akozhkofazhapa|enemy month|N.|the 15 day period based on Cetus\'s moon \"Fo\"|",
    "fotapkofazhapa|battle month|N.|the 57 day period based on Cetus\'s moons \"Fo\" and \"Shako\"|",
    "fashkofazhapa|victory month|N.|the 36 day celebratory period based on Cetus\'s moon \"Shako\"|",
    "kofazhapa|month,month unit|N.|an arbitrary unit to represent the concept of a month|",
    "mbufazhapa|week|N.|any six consecutive days|",
    "fazhapa|day|N.,N.|the time of light between one night and the next,about 32 hours|",
    "afazhapa|hour|N.,N.|the 32nd part of a day,32 minutes|",
    "aafazhapa|minute|N.,N.|the 32nd part of an hour,32 seconds|",
    "aofazhapa|second|N.,N.|the 32nd part of a minute,1/32768th of a day|",
    "oakozhosh|brave,strong|Adj.,Adj.,Adj.|having or showing mental or moral strength to face danger/fear/difficulty,having or marked by great physical power,having moral/emotional/intellectual power or ability|",
    "oakozhposh|soldier|N.|one engaged in military service|",
    "ukozhku|stupid|Adj.,Adj.|given to unintelligent decisions or acts,acting in an unintelligent or careless manner|",
    "akozhoq|require,owe|V.,V.|to demand as necessary or essential,to be under obligation to render something|",
    "papsho|body|N.,N.|the main/central/principal part,the organized physical substance of an animal or plant either living or dead|",
    "papshongu|brain,mind|N.,N.|the organ inside the head that controls all body functions of a vertebrate,the element or complex of elements in an individual that feels/perceives/thinks/wills/reasons|",
    "papshopaa|heart,love|N.,N.,N.,V.|a hollow muscular organ of vertebrate animals that by its rhythmic contraction acts as a force pump maintaining the circulation of the blood,strong affection for another arising out of kinship or personal ties,warm attachment/enthusiasm/devotion,to feel great affection for|",
    "paa|like|V.|to feel attraction toward or take pleasure in|",
    "ota|but,exception|Cjn.,Prep.|except for the fact,other than|",
    "fazhapapshopaa|sorry,apology,apologize|Adj.,N.,V.|feeling extreme sorrow or sympathy,an admission of great error or discourtesy accompanied by an expression of great regret,to express great regret for something done or said|",
    "fazhapaa|sorry,apology,apologize,excuse|Adj.,N.,V.,V.,V.|feeling sorrow or sympathy,an admission of error or discourtesy accompanied by an expression of regret,to express regret for something done or said,to make apology for,to forgive entirely or disregard as of trivial import|",
    "shako|god,goddess queen|N.|the being perfect in power/wisdom/goodness who is worshipped by Ictuza as ruler and conqueror of the universe|",
    "fazhop|up|Adv.,Prep.|in or into a higher position or level,used as a function word to indicate motion to or toward or situation at a higher point of|",
    "fazhup|down|Adv.,Adv.,Prep.|toward or in a lower physical position,to or toward a point away from the speaker or the speaker's point of reference,to a lower point or along/around/through/toward/in/into/on|",
    "fazhopapa|high|Adj.,Adv.,N.|rising or extending upward a great distance or a distance greater than others of its kind,at or to a high place/altitude/level/degree,a high point or level|",
    "fazhupapa|low|Adj.,N.|situated or passing below the normal level/surface/base of measurement/the mean elevation,something that is low|",
    "opapa|more|Adj.,Adv.|greater,to a greater or higher degree|",
    "upapa|less|Adj.|constituting a more limited number or amount|",
    "ushko|very|Adv.|to a high degree|",
    "shaa|than|Conj.,Prep.|used as a function word to indicate the second member or the member taken as the point of departure in a comparison expressive of inequality,in comparison with|",
    "fashofash|somewhat,so-so,normal,maybe|Adv.,Adj.,Adj.,Adv.|in some degree or measure,moderately well,conforming to a type/standard/regular pattern,perhaps|",
    "ushkonguho|confident|Adj.|full of conviction",
    "oouktuzha|foreign,weak|Adj.,Adj.|born in/belonging to/characteristic of some place or country other than the one under consideration,physically/mentally/intellectually deficient|",
    "paazh|want,desire|V.,N.|to have or feel need,conscious impulse toward something that promises enjoyment or satisfaction in its attainment|",
    "opa|from|Prep.|used as a function word to indicate a starting point of a physical movement or a starting point in measuring or reckoning or in a statement of limits|",
    "fazhu|under|Adv.,Prep.|in or into a position below or beneath something,below or beneath so as to be overhung/surmounted/covered/protected/concealed by|",
    "fazhko|for,because|Prep.,Conj.|used as a function word to indicate purpose,for the reason that|",
    "fazhuu|beside|Prep.|by the side of|",
    "fazhapapshongu|mouth|N.|the natural opening through which food passes into the body of an animal|",
    "asho|eat|V.|to take in through the mouth as food|",
    "fazhupapshongu|neck|N.|the part of an animal that connects the head with the body|",
    "fazhuupapsho|arm|N.|a limb of an invertebrate animal|",
    "uusho|reach|V.,V.|to stretch out,to touch or grasp by extending a part of the body|",
    "faazhuupapsho|hand|N.|the body part at the end of the arm used as a grasping organ|",
    "auusho|grab|V.|to make the motion of seizing|",
    "fazhuku|front|N.,Adj.|the forward part or surface,of/relating to/situated at the front|",
    "fazhoku|back (1)|Adv.,Adj.|in or into the past,being at or in the back|",
    "fazhokupapsho|back (2)|N.|the rear part of the Ictuza body|",
    "zhu|wing,failure,fail|N.,N.,V.|one of the movable feathered or membranous paired appendages by means of which a bird/bat/insect is able to fly,lack of success,to be or become absent or inadequate|",
    "zhuzh|wings,fly,honor|N.,V.,N.|plural of wing,to move in or pass through the air with wings,respect that is given to someone who is admired|",
    "fazhupapsho|leg|N.|a limb of an animal used especially for supporting the body and for walking",
    "zhupsho|penis,fuck (1)|N.,V.|a male copulatory and erogenous organ,to engage in coitus with|",
    "psho|fuck (2), fucking|Intj.,Adj.,Adv.|expression of anger/contempt/disgust,used to intensify a word,used to intensify a word|",
    "zhuzha|vagina|N.|a canal in a female Ictuza comprised of an ovipositor and ovipore|",
    "faazhupapsho|foot|N.|the terminal part of a leg upon which an individual stands|",
    "aazhusho|kick|V.|to strike, thrust, or hit with the foot|",
    "shop|here|Adv.,N.|in or at this place,this place|",
    "shap|there|Adv.,N.,Pn.|in or at that place,that place,used as a function word to introduce a sentence or clause|",
    "shafo|away|Adv.,Adj.|from this or that place,distant in space or time|",
    "opunguho|say|V.|to express in words|",
    "ngusho|feel|V.,V.|to receive or be able to receive a tactile sensation,to be conscious of an inward impression/state of mind/physical condition|",
    "oa|but,except|Cjn.,Cjn.,Prep.|except for the fact,with this exception,with the exception of|"
  
  ];
  invisible = ['/', '|'];
  thin = ['|', 'zh', 'S|'];
  wide = [];
  double = ['sh', 'zh', 'mb', 'ou', 'ng', 'Qu','S/', 'S|'];

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
function checkQuestion(id, correctAnswer){
  conlang.checkQuestion(id, correctAnswer);
}

async function copyToClipboard() {
    const container = document.getElementById("drawAsync");
    
	if (!container) throw new Error("drawAsync not found");

    const svg = container.querySelector("svg");
    
	if (!svg) throw new Error("No SVG inside drawAsync");

    // Clone svg
    const clonedSvg = svg.cloneNode(true);
    // Ensure defs are inside cloned SVG
    const defs = document.querySelector("svg defs");
    
	if (defs && !clonedSvg.querySelector("defs")) {
        clonedSvg.prepend(defs.cloneNode(true));
    }

    // Ensure namespaces
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	
    // Serialize
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    // Blob URL
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    // Load image
    const img = new Image();

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });

    // Canvas sizing
    const vb = svg.viewBox?.baseVal;
    const width = vb?.width || svg.clientWidth || 300;
    const height = vb?.height || svg.clientHeight || 150;
    const canvas = document.createElement("canvas");
    
	canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
	
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    // Export as PNG
    const pngBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/png");
    });

    if (!pngBlob) throw new Error("PNG conversion failed");

	// Write to clipboard
    await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob })
    ]);
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
