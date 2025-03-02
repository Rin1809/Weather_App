const hourHand = document.querySelector('.hour-hand');
const minuteHand = document.querySelector('.minute-hand');
const secondHand = document.querySelector('.second-hand');
const digitalClock = document.querySelector('.digital-clock');
const dateElement = document.querySelector('.date');
const numbers = document.querySelectorAll('.number');
const background = document.querySelector('.background-image');
const topLine = document.querySelector('.top-line');
const bottomLine = document.querySelector('.bottom-line');

let currentHighlightedNumber = null;
let isNeonActive = false;

function setDate() {
  const now = new Date();

  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  const secondsDegrees = ((seconds + milliseconds / 1000) / 60) * 360;
  secondHand.style.transform = `translateX(-50%) rotate(${secondsDegrees}deg)`;

  const minutes = now.getMinutes();
  const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6);
  minuteHand.style.transform = `translateX(-50%) rotate(${minutesDegrees}deg)`;

  const hours = now.getHours();
  const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30);
  hourHand.style.transform = `translateX(-50%) rotate(${hoursDegrees}deg)`;

  digitalClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = now.toLocaleDateString('vi-VN', options);

  changeBackground(hours);

  requestAnimationFrame(setDate);
}

function changeBackground(hours) {
    const body = document.querySelector("body");
    const isDarkMode = body.classList.contains("dark-mode");
  
    if (isDarkMode) {
      background.style.backgroundImage = "url('../static/images/dem.jpg')";
    } else {
      background.style.backgroundImage = "url('../static/images/ngay.jpg')";
    }
  }

function highlightSecondNumber() {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  const secondsDegrees = ((seconds + milliseconds / 1000) / 60) * 360;

  let numberIndex = Math.floor(secondsDegrees / 30) + 1;
  if (numberIndex > 12) numberIndex = 1;

  const numberToHighlight = document.querySelector(`.number-${numberIndex}`);

  if (currentHighlightedNumber && currentHighlightedNumber !== numberToHighlight) {
    currentHighlightedNumber.classList.remove('highlight');
  }

  numberToHighlight.classList.add('highlight');
  currentHighlightedNumber = numberToHighlight;
}

function toggleNeonEffect() {
    isNeonActive = !isNeonActive;
  
    if (isNeonActive) {
      digitalClock.classList.add('neon-effect');
      dateElement.classList.add('neon-effect');
      topLine.classList.add('neon-effect');
      bottomLine.classList.add('neon-effect');
    } else {
      digitalClock.classList.remove('neon-effect');
      dateElement.classList.remove('neon-effect');
      topLine.classList.remove('neon-effect');
      bottomLine.classList.remove('neon-effect');
    }
  }
  
  setInterval(toggleNeonEffect, 5000);

setInterval(highlightSecondNumber, 1000);
requestAnimationFrame(setDate);