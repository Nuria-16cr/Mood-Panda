let lang = navigator.language || 'en-US';
let speechRec, speechSynth;
let runningText = "", lastCommand = "";
let mood = 0, isSpeaking = false;
let voicesLoaded = false;
let lastCommandTime = 0;
let pandaImg;
let pandaW, pandaH;
let sentimentRef;
let showLanding = true;
let startButton;

function preload() {
  loadJSON('data/sentiment/MIT_afinn_165.json', gotSentimentData);
  pandaImg = loadImage('data/panda.svg', img => {
    pandaW = img.width;
    pandaH = img.height;
  });
}

function gotSentimentData(data) {
  sentimentRef = data;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(28);
  textAlign(LEFT, TOP);

  // Create start button for landing page
  startButton = createButton("Start");
  startButton.position(width / 2 - 40, height / 2 + 100);
  startButton.style("font-size", "20px");
  startButton.style("padding", "10px 20px");
  startButton.mousePressed(startExperience);

  // Speech
  speechSynth = new p5.Speech();
  speechSynth.onLoad = voicesReady;

  speechRec = new p5.SpeechRec(lang, gotSpeech);
  speechRec.continuous = true;
  speechRec.interimResults = true;
}

function startExperience() {
  showLanding = false;
  startButton.hide();
  speechRec.start(); // Start listening only when interaction begins
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (showLanding) {
    startButton.position(width / 2 - 40, height / 2 + 100);
  }
}

function draw() {
  if (showLanding) {
    drawLandingPage();
  } else {
    drawPandaInterface();
  }
}

function drawLandingPage() {
  background('#ffeeda'); // Soft peach background

  textAlign(CENTER, CENTER);
  noStroke();

  let centerY = height / 2;
  let blockSpacing = 36;

  // Title
  textFont('Georgia');
  fill('#333');
  textSize(64);
  textStyle(BOLD);
  text("🐼 MOOD PANDA 🐼", width / 2, centerY - blockSpacing * 4.5);

  // Author & Course Info (Subtle)
  textSize(20);
  textStyle(NORMAL);
  fill('#777');
  text("By Nuria Carbonell Rivela", width / 2, centerY - blockSpacing * 2.8);
  text("🎓 Interactive Media, 2025", width / 2, centerY - blockSpacing * 2);

  // Instructions
  fill('#444');
  textSize(22);
  textStyle(BOLD);
  text("💬 Talk to the panda!", width / 2, centerY - blockSpacing * 0.5);

  textSize(18);
  textStyle(NORMAL);
  text("🗣 Say hi, ask how it feels, or tell it a joke.", width / 2, centerY + blockSpacing * 0.3);
  text("😄 Your words affect its mood!", width / 2, centerY + blockSpacing * 1.1);

  // Start Button Styles
  startButton.position(width / 2 - 70, centerY + blockSpacing * 2.5);
  startButton.style('background-color', '#ff8c42');
  startButton.style('border', 'none');
  startButton.style('border-radius', '14px');
  startButton.style('font-size', '22px');
  startButton.style('font-weight', 'bold');
  startButton.style('padding', '14px 28px');
  startButton.style('color', 'white');
  startButton.style('cursor', 'pointer');
  startButton.style('box-shadow', '0 4px 10px rgba(0,0,0,0.2)');
}

function drawPandaInterface() {
  background(map(mood, -10, 10, 255, 0), map(mood, -10, 10, 0, 255), 100);

  drawFace();

  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  text("You said: " + runningText, 20, height - 100);
  text("Mood: " + mood, 20, height - 60);

  if (isSpeaking) {
    fill(255, 0, 0);
    ellipse(width - 50, 50, 20, 20);
  }
}

function drawFace() {
  push();
  translate(width / 2, height / 2);
  imageMode(CENTER);

  let scaleFactor = 400 / pandaW;
  image(pandaImg, 0, 0, pandaW * scaleFactor, pandaH * scaleFactor);

  drawMouth();
  pop();
}

function drawMouth() {
  stroke(0);
  strokeWeight(10);
  noFill();

  let mouthY = 100;
  let mouthXOffset = 60;

  if (mood > 2) {
    beginShape();
    vertex(-mouthXOffset, mouthY);
    quadraticVertex(0, mouthY + 20, mouthXOffset, mouthY);
    endShape();
  } else if (mood < -2) {
    beginShape();
    vertex(-mouthXOffset, mouthY + 20);
    quadraticVertex(0, mouthY - 10, mouthXOffset, mouthY + 20);
    endShape();
  } else {
    line(-mouthXOffset, mouthY, mouthXOffset, mouthY);
  }
}

function gotSpeech() {
    if (isSpeaking) return; //Don’t analyze while speaking
  if (speechRec.resultValue) {
    runningText = speechRec.resultString;
    analyzeSentiment(runningText);
    checkCommands(runningText);
  }
}

function analyzeSentiment(text) {
  let words = text.split(/\W+/);
  let moodChange = 0;

  for (let word of words) {
    word = word.toLowerCase();
    if (sentimentRef.hasOwnProperty(word)) {
      moodChange += sentimentRef[word];
    }
  }

  mood = constrain(mood + moodChange, -20, 20);
}

function checkCommands(phrase) {
  if (!voicesLoaded) return;

  phrase = phrase.toLowerCase().trim();
  const now = Date.now();
  const cooldown = 5000;

 if (/\b(hello|hi|hey)\b/.test(phrase)) {
    if (lastCommand !== "greeting" || now - lastCommandTime > cooldown) {
      speakResponse("Hi, my name is Panda.");
      lastCommand = "greeting";
      lastCommandTime = now;
    }

  } else if (/(how are you|how you doing)/.test(phrase)) {
    if (lastCommand !== "howareyou" || now - lastCommandTime > cooldown) {
      speakResponse("I'm doing great, thank you!");
      lastCommand = "howareyou";
      lastCommandTime = now;
    }

  } else if (/(your name|what's your name)/.test(phrase)) {
    if (lastCommand !== "name" || now - lastCommandTime > cooldown) {
      speakResponse("My name is Panda.");
      lastCommand = "name";
      lastCommandTime = now;
    }

  } else if (/(tell me a joke|make me laugh)/.test(phrase)) {
    if (lastCommand !== "joke" || now - lastCommandTime > cooldown) {
      speakResponse("Why do pandas hold strong opinions? Because they're black and white creatures.");
      lastCommand = "joke";
      lastCommandTime = now;
    }

  } else if (/(what's up|sup|how's it going)/.test(phrase)) {
    if (lastCommand !== "whatsup" || now - lastCommandTime > cooldown) {
      speakResponse("Just chillin’ how bout you?");
      lastCommand = "whatsup";
      lastCommandTime = now;
    }

  } else if (/(are you real|are you alive)/.test(phrase)) {
    if (lastCommand !== "existential" || now - lastCommandTime > cooldown) {
      speakResponse("I’m real in your heart... and in this browser tab.");
      lastCommand = "existential";
      lastCommandTime = now;
    }

  } else if (/(i love you|cute|you are awesome)/.test(phrase)) {
    if (lastCommand !== "love" || now - lastCommandTime > cooldown) {
      speakResponse("Aww, thank you! You're the best too!");
      lastCommand = "love";
      lastCommandTime = now;
    }

  } else if (/(dance|can you dance|show me moves)/.test(phrase)) {
    if (lastCommand !== "dance" || now - lastCommandTime > cooldown) {
      speakResponse("I'd dance if I had legs! But imagine me doing the shuffle.");
      lastCommand = "dance";
      lastCommandTime = now;
    }

  } else if (/(goodbye|see you|bye)/.test(phrase)) {
    if (lastCommand !== "goodbye" || now - lastCommandTime > cooldown) {
      speakResponse("Bye-bye! Come back soon!");
      lastCommand = "goodbye";
      lastCommandTime = now;
    }

  } else if (/do you sleep/.test(phrase)) {
    if (lastCommand !== "sleep" || now - lastCommandTime > cooldown) {
      speakResponse("I take micro-naps between your sentences!");
      lastCommand = "sleep";
      lastCommandTime = now;
    }

  } else if (/are you hungry/.test(phrase)) {
    if (lastCommand !== "hungry" || now - lastCommandTime > cooldown) {
      speakResponse("Always. Got any bamboo?");
      lastCommand = "hungry";
      lastCommandTime = now;
    }

  } else if (/what's your favorite food/.test(phrase)) {
    if (lastCommand !== "food" || now - lastCommandTime > cooldown) {
      speakResponse("Bamboo pizza");
      lastCommand = "food";
      lastCommandTime = now;
    }

  } else if (/do you like movies/.test(phrase)) {
    if (lastCommand !== "movies" || now - lastCommandTime > cooldown) {
      speakResponse("Yes! Especially the ones in black and white.");
      lastCommand = "movies";
      lastCommandTime = now;
    }

  } else if (/are you smart/.test(phrase)) {
    if (lastCommand !== "smart" || now - lastCommandTime > cooldown) {
      speakResponse("I know how to find the best bamboo and a joke about pandas. Pretty clever, huh?");
      lastCommand = "smart";
      lastCommandTime = now;
    }
      } else if (/(how's your mood|how are you feeling|how do you feel)/.test(phrase)) {
    if (lastCommand !== "moodcheck" || now - lastCommandTime > cooldown) {
      if (mood >= 0) {
        speakResponse("I'm feeling good, thank you!");
      } else {
        speakResponse("I'm not feeling too well... try saying some positive things to me.");
      }
      lastCommand = "moodcheck";
      lastCommandTime = now;
    }
  }
}

function speakResponse(text) {
  if (!voicesLoaded) return;
  if (isSpeaking) speechSynth.stop();

  speechSynth.setRate(0.9);
  speechSynth.onStart = () => isSpeaking = true;
  speechSynth.onEnd = () => isSpeaking = false;
  speechSynth.speak(text);
}

function voicesReady() {
  voicesLoaded = true;
  if (speechSynth.voices.length > 0) {
    speechSynth.setVoice(speechSynth.voices[0].name);
  }
}
