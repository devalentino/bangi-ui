function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toHex(value) {
  return value.toString(16).padStart(2, "0");
}

function randomColourShade(baseColour, opacity) {
  var base = String(baseColour || "").toLowerCase();
  var alpha = typeof opacity === "number" ? opacity : 1;
  var r;
  var g;
  var b;

  if (base === "red") {
    r = randomInRange(128, 255);
    g = randomInRange(0, 127);
    b = randomInRange(0, 127);
  } else if (base === "green") {
    r = randomInRange(0, 127);
    g = randomInRange(128, 255);
    b = randomInRange(0, 127);
  } else if (base === "blue") {
    r = randomInRange(0, 127);
    g = randomInRange(0, 127);
    b = randomInRange(128, 255);
  } else {
    throw new Error("baseColour must be red, green, or blue");
  }

  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

module.exports = {
  randomColourShade: randomColourShade,
};
