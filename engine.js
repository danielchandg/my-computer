/* global titleContainer, descriptionsContainer, choicesContainer, fileContainer, fileHeader, fileContent */

let hackerLeft = [], hackerRight = [];
let hackerText = [];
let maxHacker = 39, columns;
let h;
let chars = [];
let random_index = [];
let hackerStr = 0, victory = "Thanks For Playing!!!";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let engine = {
  setTitle: function(title) {
    document.title = title;
    titleContainer.innerText = title;
  },

  clearDescriptions: function() {
    descriptionsContainer.innerText = "";
  },
  startHacker: function() {
    h = document.getElementsByClassName('hacker1');
    columns = h.length;
    for(let i=0; i<maxHacker; i++){
      hackerLeft.push(0);
      hackerRight.push(0);
    }
    for(let i=0; i<columns; i++){
      hackerText[i] = [];
      chars.push(0);
      for(let j=0; j<maxHacker; j++){
        hackerText[i].push(0);
      }
    }
  },
  // Call this to move left hacker column down 1 space.
  // If num[column] > 0 then adds another random letter to top of column.
  // Else doesn't add a letter.
  updateHacker: function(num) {
    for(let col=0; col<columns; col++){
      if(chars[col]==0 && num[col]<=0) continue;
      if(num.length > col && num[col]>0){
        hackerText[col].push(num[col]);
        chars[col]++;
      }
      else{
        hackerText[col].push(0);
      }
      if(hackerText[col].shift() > 0){
        chars[col]--;
      }
    }
    for(let col=0; col<columns; col++){
      let tempStr = "";
      h[col].innerText = "";
      if(chars[col]>0 || num[col]>0){
        for(let i=maxHacker-1; i>=0; i--){ // Math.ceil(Math.random() * 94) + 32
          if(hackerText[col][i] > 0){
            if(hackerStr == 0) tempStr += String.fromCharCode(Math.ceil(Math.random() * 94) + 32);
            else tempStr += victory[hackerText[col][i]-1];
          }
          tempStr += "\n";
        }
        h[col].innerText = tempStr;
      }
    }
  },
  changeHacker: function() {
    hackerStr = 1 - hackerStr;
  },
  addDescription: function(text, tags) {
    let p = document.createElement("p");
    p.innerHTML = text;
    for (let tag of tags || []) {
      p.classList.add(tags);
    }
    descriptionsContainer.appendChild(p);
  },

  clearChoices: function() {
    choicesContainer.innerText = "";
  },

  addChoice: function(text, onClick, tags) {
    let a = document.createElement("a");
    a.href = "javascript:void(0);";
    a.innerHTML = "- " + text + "<br><br>";
    a.onclick = onClick;
    for (let tag of tags || []) {
      a.innerHTML = '<span class="blu">' + a.innerHTML + "</span>"
    }
    
    // let button = document.createElement("button");
    // button.innerHTML = text;
    // button.onclick = onClick;
    // for (let tag of tags || []) {
    //   button.classList.add(tag);
    // }
    choicesContainer.appendChild(a);
  },
  openFile: function(filename, content, content2) {
    fileContent.innerText = "";
    // console.log("Opening file: ", filename, content, content2);
    fileHeader.innerText = "📁";
    if(filename.length > 0) fileHeader.innerText += "  " + filename;
    let p = document.createElement("p"), p2 = document.createElement("p");
    p.innerHTML = content;
    fileContent.appendChild(p);
    p2.innerHTML = "\n\n\n";
    if(content2) p2.innerHTML += content2;
    p2.classList.add("big");
    fileContent.appendChild(p2);
    
    document.getElementById("fileContainer").style.display = "block";
  },
  closeFile: function() {
    fileContent.innerText = "";
    document.getElementById("fileContainer").style.display = "none";
  }
};
