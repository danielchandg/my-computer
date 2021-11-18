/* global jsyaml, engine */

let story;
let inventory;
let cols = document.getElementsByClassName('hacker1').length;
let nums = [];
let Title, randomTitle = "";
let hackerTime = 50;

fetch("story.yaml")
  .then(res => res.text())
  .then(start);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

async function left() {
  // console.log(nums);
  engine.updateHacker(nums);
  await sleep(hackerTime);
  for(let i=0; i<nums.length; i++){
    if(nums[i] > 0) nums[i]--;
    else if(nums[i] == -1){
      if(hackerTime == 50) nums[i] = Math.ceil(Math.random() * 18) + 2;
      else nums[i] = 19;
    }
    else if(nums[i] < 0) nums[i]++;
  }
  left();
}
async function title(title_len) {
  if(title_len < Title.length){
    randomTitle = Title;
    for(let i=title_len; i<Title.length; i++){
      if(Title[i] >= 'A' && Title[i] <= 'Z'){
        randomTitle = randomTitle.replaceAt(i, String.fromCharCode(Math.floor(Math.random() * 26) + 65));
      }
      else if(Title[i] >= 'a' && Title[i] <= 'z'){
        randomTitle = randomTitle.replaceAt(i, String.fromCharCode(Math.floor(Math.random() * 26) + 97));
      }
      else if(Title[i] >= '0' && Title[i] <= '9'){
        randomTitle = randomTitle.replaceAt(i, String.fromCharCode(Math.floor(Math.random() * 10) + 48));
      }
    }
    // console.log(randomTitle);
    engine.setTitle(randomTitle);
    await sleep(50);
    title(title_len + 1);
  }
  else{
    engine.setTitle(Title);
  }
}
function lightHacker() {
  let hackerIndex = Math.floor(Math.random() * (cols / 4));
  nums[hackerIndex] = -Math.floor(Math.random() * 100);
  nums[hackerIndex + Math.ceil(Math.random() * (cols/4 - 4)) + 4] = -Math.floor(Math.random() * 100);
  hackerIndex = cols - 1 - Math.floor(Math.random() * (cols / 4));
  nums[hackerIndex] = -Math.floor(Math.random() * 100);
  nums[hackerIndex - Math.ceil(Math.random() * (cols/4 - 4)) - 4] = -Math.floor(Math.random() * 100);
}
async function repeatLightHacker() {
  lightHacker();
  await sleep(2000);
  repeatLightHacker();
}

function start(storyText) {
  engine.closeFile();
  story = jsyaml.load(storyText);

  // Title = "Placeholder Title";
  // title(0);
  
  inventory = new Set();
  
  engine.startHacker();
  for(let i=0; i<cols; i++) nums.push(0);
  left();
  repeatLightHacker();
  
  arrive(story.StartScene, story.Startdesc);
  
  
}
function fileOpen(header, content, content2, target, desc, c){
  // console.log(header, content);
  engine.openFile(header, content, content2);
  for(let thing of c.gain || []) inventory.add(thing);
  // inventory.add("FileOpen");
  if(desc) arrive(target, desc);
  else arrive(target, "");
}
function fileClose(target, desc){
  inventory.delete("FileOpen");
  engine.closeFile();
  arrive(target, desc);
  // engine.changeHacker();
  // hackerTime = 80;
  
}
function openFolder(target, desc, gain, lose){
  inventory.delete("FileOpen");
  engine.closeFile();
  if(gain) for(let item of gain) inventory.add(item);
  if(lose) for(let item of lose) inventory.delete(lose);
  arrive(target, desc);
  
}
function arrive(target, initialDescription) {
  engine.clearDescriptions();
  engine.addDescription(initialDescription, ["big"]);
  if(target == "Win"){
    engine.changeHacker();
    hackerTime = 80;
  }
  if(story[target].desc) engine.addDescription(story[target].desc);
  console.log("Entering scene", target);
  for(let thing of story[target].gain || []) inventory.add(thing);
  for(let thing of story[target].lose || []) inventory.delete(thing);
  
  // console.log("Inventory", inventory);
  
  engine.clearChoices();
  if(inventory.has("FileOpen")) engine.addChoice("Close File", () => {fileClose(target, "")});
  for(let c of story[target].choices || []){
    if(!conditionsHold(c)) continue;
    if(c.target){
      if(notVisitedYet(c)){
        if(c.text == "Documents" || c.text == "P4_project" || c.text == "Downloads" || c.text == "End Game") engine.addChoice(c.text, () => {openFolder(c.target, c.desc, c.gain, c.lose)}, ["blu"]);
        else engine.addChoice(c.text, () => {openFolder(c.target, c.desc, c.gain, c.lose)});
      }
      else engine.addChoice(c.text, () => {openFolder(c.target, "", c.gain, c.lose)});
    }
    else if(c.header){
      if(notVisitedYet(c)){
        if(target == "KeyCracker"){
          engine.addChoice(c.text, () => {fileOpen(c.header, c.content, c.content2, target, c.desc, c)}, ["blu"]);
        }
        else engine.addChoice(c.text, () => {fileOpen(c.header, c.content, c.content2, target, c.desc, c)});
      }
      else engine.addChoice(c.text, () => {fileOpen(c.header, c.content, "", target, "", c)});
    }
    else{
      engine.addChoice(c.text);
    }
    
  }
  
  
  // engine.addChoice("Example choice", () => {
  //     arrive("example_target", "Example choice narration");
  // }, ["lit"]);
  
  lightHacker();
  if(story[target].title && story[target].title != Title){
    Title = story[target].title;
    title(0);
  }
}
function notVisitedYet(obj) {
  // console.log("Inventory:", inventory);
  // console.log("Gain:", obj.gain);
  if(!obj.gain) return false;
  for(let item of obj.gain) {
    if(item == "FileOpen") continue;
    if(inventory.has(item)) return false;
  }
  return true;
}

function conditionsHold(obj) {
  // TODO: return false if obj.with contains any item not in inventory
  // TODO: return false if obj.with contains any time that *is* in inventory
  for(let item of obj.with || []){
    if(!inventory.has(item)) return false;
  }
  for(let item of obj.without || []){
    if(inventory.has(item)) return false;
  }
  return true;
}
