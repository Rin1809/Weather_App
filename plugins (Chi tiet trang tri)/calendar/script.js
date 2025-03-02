const currentYearElement = document.getElementById('currentYear');
const prevYearButton = document.getElementById('prevYear');
const nextYearButton = document.getElementById('nextYear');
const monthsContainer = document.querySelector('.months-container');

let currentYear = new Date().getFullYear();

function createMonth(year, month) {
    const monthDiv = document.createElement('div');
    monthDiv.classList.add('month');
  
    const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
    const monthNameDiv = document.createElement('div');
    monthNameDiv.classList.add('month-name');
    monthNameDiv.textContent = monthName;
    monthDiv.appendChild(monthNameDiv);
  
    const arrowLine = document.createElement('div');
    arrowLine.classList.add('arrow-line');
    monthDiv.appendChild(arrowLine);
  
    const arrowHead = document.createElement('div');
    arrowHead.classList.add('arrow-head');
    arrowLine.appendChild(arrowHead);
  
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
  
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDot = document.createElement('div');
      dayDot.classList.add('day-dot');
  
      const dayDate = new Date(year, month, day);
      const position = (day / daysInMonth) * 100;
      dayDot.style.left = `calc(${position}% - 4px)`;
  
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayDot.classList.add('today');
      }
      
      // Thêm sự kiện ở đây, ví dụ:
      if (day === 5 && month === 5) {
        dayDot.classList.add('event'); 
      }
  
      dayDot.addEventListener('click', () => {
        alert(`Clicked on ${day} ${monthName} ${year}`);
      });
  
      arrowLine.appendChild(dayDot);
  
      // Thêm label cho ngày
      const dayLabel = document.createElement('div');
      dayLabel.classList.add('day-label');
      dayLabel.textContent = day;
      dayLabel.style.left = `calc(${position}% - 4px)`;
      dayLabel.style.top = '10px'; 
      arrowLine.appendChild(dayLabel);
    }
  
    monthsContainer.appendChild(monthDiv);
}

function updateCalendar() {
  monthsContainer.innerHTML = '';
  for (let month = 0; month < 12; month++) {
    createMonth(currentYear, month);
  }
}

prevYearButton.addEventListener('click', () => {
  currentYear--;
  if (currentYear < 2023) {
      currentYear = 2023;
      alert("Lịch bắt đầu từ năm 2023.");
      return;
  }
  currentYearElement.textContent = currentYear;
  updateCalendar();
});

nextYearButton.addEventListener('click', () => {
  currentYear++;
  if (currentYear > 2026) {
      currentYear = 2026;
      alert("Lịch kết thúc vào năm 2026.");
      return;
  }
  currentYearElement.textContent = currentYear;
  updateCalendar();
});

updateCalendar();