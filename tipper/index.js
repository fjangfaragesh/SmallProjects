"use strict";

const LEN_CORRECT = 10;

let challangeText, startTime, typedText, backspaces;

let TEEEXXXTTT = "Hallo Welt";


onload = function() {
    start(TEEEXXXTTT);
}

function start(text) {
    challangeText = text;
    startTime = Date.now() ;
    typedText = "";
    backspaces = 0;
    
    onkeypress = function(e) {
        typeChar(e.key);
    }
    onkeydown = function(e) {
        if (e.key === "Backspace") backspace();
    }
    show();
}
function stop() {
    onkeypress = undefined;
    onkeydown = undefined;
}
function finishGame() {
    let timeMillis = Date.now() - startTime;
    alert("Zeichen:" + challangeText.length + "\nZeit: " + timeMillis/1000  + "s\nZeichen pro Minute: " + (1000*60*challangeText.length)/timeMillis + "s\nFehler: " + backspaces + "\nFehlerrate: " + 100*backspaces/challangeText.length + "%");
    stop();
}



function typeChar(c) {
    typedText += c;
    if (typedText === challangeText) finishGame();
    show();
}
function backspace() {
    if (typedText.length === 0) return;
    typedText = typedText.substring(0,typedText.length-1);
    backspaces++;
    show();
}

function show() {
    let i = 0;
    for (; i < Math.min(typedText.length, challangeText.length); i++) {
        if (typedText[i] !== challangeText[i]) break;
    }
    let correct = challangeText.substring(0,i);
    let toType = challangeText.substring(i,challangeText.length);
    let wrongTyped = typedText.substring(i,typedText.lenght);
    
    let correctShow = correct;
    if (correctShow.length > LEN_CORRECT) correctShow = correctShow.substring(correctShow.length - LEN_CORRECT, correctShow.length)
    
    
    let challengeTextDiv = document.getElementById("challengeText");
    let typedTextDiv = document.getElementById("typedText");
    challengeTextDiv.innerHTML = "";
    typedTextDiv.innerHTML = "";
    
    let correctSpan = document.createElement("span");
    correctSpan.className = "correct";
    correctSpan.appendChild(document.createTextNode(correctShow));
    
    let correctSpanTyped = document.createElement("span");
    correctSpanTyped.className = "correct";
    correctSpanTyped.appendChild(document.createTextNode(correctShow));

    let toTypeSpan = document.createElement("span");
    toTypeSpan.className = "totype";
    toTypeSpan.appendChild(document.createTextNode(toType));
    
    let wrongSpan = document.createElement("span");
    wrongSpan.className = "wrong";
    wrongSpan.appendChild(document.createTextNode(wrongTyped));
    
    challengeTextDiv.appendChild(correctSpan);
    challengeTextDiv.appendChild(document.createTextNode("|"));
    challengeTextDiv.appendChild(toTypeSpan);
    
    typedTextDiv.appendChild(correctSpanTyped);
    typedTextDiv.appendChild(wrongSpan);
    typedTextDiv.appendChild(document.createTextNode("|"));
}


