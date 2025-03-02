$(document).ready(function () {
    let forecastData = null;
    let chart = null;
    let isTyping = false;
    let typingTimer;
    let isResizing = false;
    let currentPage = 1;
    let totalPages = 1;
    let currentLimit = 3;
    let currentSearchQuery = '';
    let currentLayer = "temp_new"; // Default Layer
    let layers = {}; // Lưu các layer và trạng thái của nó
    const mapLayers = $('.map-layers');
    const toggleLayersButton = $('#toggleLayers');

    const userAvatarUrl = "/static/images/user_avatar.png";
    const aiAvatarUrl = "/static/images/ai_avatar.png";
    const markdownIt = window.markdownit(); 

    function updateBackgroundImage() {
        const body = $("body");
        const backgroundImage = $(".background-image");
        const isDarkMode = body.hasClass("dark-mode");

        backgroundImage.removeClass("active");

        setTimeout(() => {
            if (isDarkMode) {
                backgroundImage.css("background-image", "url('../static/images/dem.jpg')");
            } else {
                backgroundImage.css("background-image", "url('../static/images/ngay.jpg')");
            }

            backgroundImage.addClass("active");
        }, 50);
    }

    function setLightMode() {
        $("body").removeClass("dark-mode");
        $("#darkModeToggle").html('<i class="fas fa-moon"></i>');
        localStorage.setItem("darkMode", "disabled");
        updateBackgroundImage();
        if (chart) {
            updateChartColors();
        }
    }

    if (localStorage.getItem("loggedIn") === "true") {
        setLightMode();
    } else {
        if (localStorage.getItem("darkMode") === "enabled") {
            $("body").addClass("dark-mode");
            $("#darkModeToggle").html('<i class="fas fa-sun"></i>');
            updateBackgroundImage();
        }
    }
    // Dark Mode
    $("#darkModeToggle").click(function () {
        $("body").toggleClass("dark-mode");
        if ($("body").hasClass("dark-mode")) {
            $("#darkModeToggle").html('<i class="fas fa-sun"></i>');
            localStorage.setItem("darkMode", "enabled");
        } else {
            $("#darkModeToggle").html('<i class="fas fa-moon"></i>');
            localStorage.setItem("darkMode", "disabled");
        }

        updateBackgroundImage();
        if (chart) {
            updateChartColors();
        }
    });

    if (localStorage.getItem("darkMode") === "enabled") {
        $("body").addClass("dark-mode");
        $("#darkModeToggle").html('<i class="fas fa-sun"></i>');
    }

    var map = L.map("map").setView([21.0285, 105.8542], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    var marker;

    function getGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            console.error("Geolocation không được hỗ trợ bởi trình duyệt này.");
        }
    }

    function showPosition(position) {
        $("#latitude").val(position.coords.latitude);
        $("#longitude").val(position.coords.longitude);
        $("form").submit();
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("Người dùng từ chối yêu cầu Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Thông tin vị trí không khả dụng.");
                break;
            case error.TIMEOUT:
                console.error("Yêu cầu lấy vị trí người dùng đã hết thời gian.");
                break;
            case error.UNKNOWN_ERROR:
                console.error("Một lỗi không xác định đã xảy ra.");
                break;
        }
    }

    if (localStorage.getItem("loggedIn") === "true" && !$("#cityInput").val()) {
        getGeolocation();
    }

    function getIconClass(iconCode) {
        const switchMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '03d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03n': 'fa-cloud-moon',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-showers-heavy',
            '09n': 'fa-cloud-showers-heavy',
            '10d': 'fa-cloud-sun-rain',
            '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-bolt',
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog',
        };
        return switchMap[iconCode] || 'fa-question-circle';
    }

    function deleteHistoryItem(city, element) {
        $.ajax({
            url: "/delete_history",
            method: "POST",
            data: { city: city },
            success: function (response) {
                $(element).closest('.history-item').fadeOut(500, function () {
                    $(this).remove();
                    if ($("#historyContainer").children().length === 0) {
                        $("#historyContainer").html('<div class="col-12"><p class="text-center">Không có lịch sử tra cứu.</p></div>');
                        $("#prevPage").hide();
                        $("#nextPage").hide();
                      }
                });
            },
            error: function () {
                console.error("Error deleting history item");
            },
        });
    }

    function clearAllHistory() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
            $.ajax({
                url: "/clear_history",
                method: "POST",
                success: function (response) {
                    $("#historyContainer").empty();
                    $("#prevPage").hide();
                    $("#nextPage").hide();
                    $("#historyContainer").html('<div class="col-12"><p class="text-center">Không có lịch sử tra cứu.</p></div>');
                },
                error: function () {
                    console.error("Error clearing history");
                },
            });
        }
    }

    function renderHistoryItem(item) {
        return `
            <div class="col-md-4 mb-3 history-item" data-city="${item.thanh_pho}">
                <div class="card h-100 history-card" data-city="${item.thanh_pho}" data-viewed="${item.viewed}">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex align-items-center">
                                ${!item.viewed ? '<i class="fas fa-eye-slash viewed-icon mr-2" title="Chưa xem"></i>' : '<i class="fas fa-eye viewed-icon mr-2" title="Đã xem"></i>'}
                                <h5 class="card-title city-name">${item.thanh_pho}</h5>
                            </div>
                            <button class="btn btn-outline-danger btn-sm delete-history" data-city="${item.thanh_pho}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <p class="card-text small text-muted mt-2 timestamp">
                            <i class="fas fa-clock"></i> ${item.timestamp}
                        </p>
                        <div class="d-flex align-items-center mt-2 flex-grow-1">
                            <i class="fas fa-2x ${getIconClass(item.data.icon)}"></i>
                            <div class="ml-2">
                                <p class="mb-0 temp">${item.data.nhiet_do}°C</p>
                                <p class="mb-0 small desc">${item.data.mo_ta}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function loadHistory(page = 1, limit = currentLimit, searchQuery = currentSearchQuery) {
        $.ajax({
            url: "/search_history",
            method: "GET",
            data: { page: page, limit: limit, search_query: searchQuery },
            success: function (history) {
                $("#historyContainer").empty();
                // Không xóa tiêu đề "Lịch sử tra cứu" ở đây
    
                if (history.length > 0) {
                    history.forEach(item => {
                        $("#historyContainer").append(renderHistoryItem(item));
                    });
    
                    const totalItems = history.length; // Đây là số lượng item trả về từ server sau khi đã lọc
                    totalPages = Math.ceil(totalItems / limit);
    
                    if (totalItems > limit) {
                        $("#prevPage").toggle(currentPage > 1);
                        $("#nextPage").toggle(currentPage < totalPages);
                    } else {
                        $("#prevPage").hide();
                        $("#nextPage").hide();
                    }
                } else {
                    $("#historyContainer").html('<div class="col-12"><p class="text-center">Không có lịch sử tra cứu.</p></div>');
                    $("#prevPage").hide();
                    $("#nextPage").hide();
                }
            },
            error: function () {
                console.error("Error fetching search history");
            },
        });
    }
    
    
    
    
    
    
    $("#prevPage").click(function () {
        if (currentPage > 1) {
            currentPage--;
            loadHistory(currentPage, currentLimit, currentSearchQuery);
        }
    });

    $("#nextPage").click(function () {
        if (currentPage < totalPages) {
            currentPage++;
            loadHistory(currentPage, currentLimit, currentSearchQuery);
        }
    });

    // $("#searchHistoryInput").on("input", function () {
    //     currentSearchQuery = $(this).val();
    //     currentPage = 1; // Reset về trang đầu tiên khi tìm kiếm
    //     loadHistory(currentPage, currentLimit, currentSearchQuery);
    // });

    loadHistory();

    function getChartColors() {
        if ($("body").hasClass("dark-mode")) {
            return {
                textColor: '#fff',
                gridColor: 'rgba(255, 255, 255, 0.2)',
                tempColor: '#ffafaf',
                popColor: '#00FFFF',
            };
        } else {
            return {
                textColor: '#000',
                gridColor: 'rgba(0, 0, 0, 0.2)',
                tempColor: 'rgba(255, 99, 132, 1)',
                popColor: 'rgba(54, 162, 235, 1)',
            };
        }
    }

    function createForecastChart(forecastData) {
        if (chart) {
            chart.destroy();
        }

        const colors = getChartColors();
        const ctx = document.getElementById('weatherChart').getContext('2d');
        const labels = forecastData.map(item => item.thoi_gian.split(' ')[1].substring(0, 5)); // Chỉ lấy giờ
        const tempData = forecastData.map(item => item.nhiet_do);
        const popData = forecastData.map(item => item.pop);

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nhiệt độ (°C)',
                    data: tempData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: colors.tempColor,
                    borderWidth: 2,
                    yAxisID: 'y-axis-temp',
                }, {
                    label: 'Xác suất mưa (%)',
                    data: popData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: colors.popColor,
                    borderWidth: 2,
                    yAxisID: 'y-axis-pop',
                }]
            },
            options: {
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: colors.textColor,
                        }
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ nhiệt độ và xác suất mưa (5 ngày/3 giờ)',
                        font: {
                            size: 16,
                        },
                        color: colors.textColor,
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function (tooltipItems) {
                                return tooltipItems[0].label.substring(0, 5) + ' - ' + forecastData[tooltipItems[0].dataIndex].thoi_gian.split(' ')[0];
                            },
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label +=': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y + (context.dataset.yAxisID === 'y-axis-temp' ? '°C' : '%');
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    'y-axis-temp': {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Nhiệt độ (°C)',
                            font: {
                                weight: 'bold',
                            },
                            color: colors.textColor,
                        },
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1);
                            },
                            color: colors.textColor,
                        },
                        grid: {
                            color: colors.gridColor,
                        }
                    },
                    'y-axis-pop': {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Xác suất mưa (%)',
                            font: {
                                weight: 'bold',
                            },
                            color: colors.textColor,
                        },
                        ticks: {
                            beginAtZero: true,
                            max: 100,
                            callback: function (value) {
                                return value + '%';
                            },
                            color: colors.textColor,
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: colors.gridColor,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian (Ngày/Giờ)',
                            font: {
                                weight: 'bold',
                            },
                            color: colors.textColor,
                        },
                        ticks: {
                            color: colors.textColor,
                        },
                        grid: {
                            color: colors.gridColor,
                        }
                    }
                }
            }
        });
    }

    function updateChartColors() {
        if (!chart) return;

        const colors = getChartColors();

        // Cập nhật màu sắc cho datasets
        chart.data.datasets[0].borderColor = colors.tempColor;
        chart.data.datasets[1].borderColor = colors.popColor;

        // Cập nhật màu sắc cho các phần tử khác của biểu đồ
        chart.options.plugins.legend.labels.color = colors.textColor;
        chart.options.plugins.title.color = colors.textColor;
        chart.options.scales['y-axis-temp'].title.color = colors.textColor;
        chart.options.scales['y-axis-temp'].ticks.color = colors.textColor;
        chart.options.scales['y-axis-temp'].grid.color = colors.gridColor;
        chart.options.scales['y-axis-pop'].title.color = colors.textColor;
        chart.options.scales['y-axis-pop'].ticks.color = colors.textColor;
        chart.options.scales['y-axis-pop'].grid.color = colors.gridColor;
        chart.options.scales.x.title.color = colors.textColor;
        chart.options.scales.x.ticks.color = colors.textColor;
        chart.options.scales.x.grid.color = colors.gridColor;

        chart.update();
    }

    $("#toggleView").click(function () {
        const mapContainer = $("#map");
        const chartContainer = $("#weatherChart");
        const container = $(".map-chart-container");

        if (container.hasClass("chart-mode")) {
            container.removeClass("chart-mode");
            mapContainer.css("opacity", "0");
            chartContainer.css("opacity", "0");
            chartContainer.hide();
            mapContainer.show();
            setTimeout(() => {
                mapContainer.css("opacity", "1");
            }, 10);
            $("#toggleView").attr("title", "Chuyển sang Biểu đồ");
        } else {
            container.addClass("chart-mode");
            mapContainer.css("opacity", "0");
            chartContainer.css("opacity", "0");
            mapContainer.hide();
            chartContainer.show();
            setTimeout(() => {
                chartContainer.css("opacity", "1");
            }, 10);
            $("#toggleView").attr("title", "Chuyển sang Bản đồ");
            if (forecastData) {
                createForecastChart(forecastData);
            }
        }
    });

    function createTemperatureBarTicks(minTemp, maxTemp) {
        $(".temperature-bar-ticks").remove(); // Xóa vạch chia cũ
        const tickContainer = document.createElement("div");
        tickContainer.classList.add("temperature-bar-ticks");
        $(".temperature-bar-container").append(tickContainer);
    
        const tickInterval = 1; // Mỗi độ 1 vạch
        const numTicks = Math.ceil((maxTemp - minTemp) / tickInterval);
    
        for (let i = 0; i <= numTicks; i++) {
            const temp = minTemp + i * tickInterval;
            const tick = document.createElement("div");
            
            // Vạch chia lớn mỗi 5 độ
            if (i % 5 === 0) {
                tick.classList.add("tick", "major");
    
                const label = document.createElement("span");
                label.classList.add("tick-label");
                label.textContent = temp;
                tick.appendChild(label);
    
                // Điều chỉnh vị trí label cho vạch đầu và cuối
                if (i === 0) {
                    label.style.transform = "translateX(0%)";
                    label.style.left = "0";
                } else if (i === numTicks) {
                    label.style.transform = "translateX(-100%)";
                    label.style.left = "100%";
                }
            } else {
                tick.classList.add("tick", "minor");
            }
    
            tick.style.left = `${(i / numTicks) * 100}%`;
            tickContainer.appendChild(tick);
        }
    }

    $("form").submit(function (event) {
        event.preventDefault();
        const city = $("#cityInput").val();
        const lat = $("#latitude").val();
        const lon = $("#longitude").val();

        $(".weather-info .card-body").addClass("loading");
        $(".city-title, .temperature, .feels-like, .description, .humidity, .pressure, .wind").css("opacity", 0);
        $(".weather-icon-main i").css("opacity", 0);
        $(".temperature-bar").css("width", "0%");

        let requestData = {};
        if (city) {
            requestData.city = city;
        } else if (lat && lon) {
            requestData.lat = lat;
            requestData.lon = lon;
        }

        $.ajax({
            url: "/",
            method: "POST",
            data: requestData,
            success: function (response) {
                if (response.weather) {
                    // Cập nhật thông tin thời tiết
                    $(".city-title").text(response.weather.thanh_pho).animate({ opacity: 1 }, 500);

                    $(".weather-icon-main i").removeClass().addClass("fas " + getIconClass(response.weather.icon)).animate({ opacity: 1 }, 500);

                    $(".temperature").text(response.weather.nhiet_do + "°C").animate({ opacity: 1 }, 500);
                    $(".feels-like").text("Cảm giác như: " + response.weather.cam_giac + "°C").animate({ opacity: 1 }, 500);
                    $(".description").text("Mô tả: " + response.weather.mo_ta).animate({ opacity: 1 }, 500);
                    $(".humidity").html(`<i class="fas fa-tint"></i> Độ ẩm: ${response.weather.do_am}%`).animate({ opacity: 1 }, 500);
                    $(".pressure").html(`<i class="fas fa-tachometer-alt"></i> Áp suất: ${response.weather.ap_suat} hPa`).animate({ opacity: 1 }, 500);
                    $(".wind").html(`<i class="fas fa-wind"></i> Tốc độ gió: ${response.weather.gio} m/s`).animate({ opacity: 1 }, 500);

      
                    const temp = response.weather.nhiet_do;
                    let tempWidth = 0;

                    if (temp < 0) {
                        tempWidth = 0;
                    } else if (temp > 45) {
                        tempWidth = 100;
                    } else {
                        tempWidth = (temp / 45) * 100
                    }

                    $(".temperature-bar").css("width", tempWidth + "%");

                    $(".temperature-bar-ticks").remove();

                    createTemperatureBarTicks(0, 45); 
                    const lat = response.weather.coord.lat;
                    const lon = response.weather.coord.lon;
                    map.setView([lat, lon], 10);
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${response.weather.thanh_pho}</b>`).openPopup();
                    forecastData = response.weather.forecast;
                    if ($(".map-chart-container").hasClass("chart-mode") && forecastData) {
                        createForecastChart(forecastData);
                    }

                    // Modal data
                    $("#weatherModalLabel").text("Thông tin chi tiết về " + response.weather.thanh_pho);
                    $("#sunrise").text(response.weather.sunrise);
                    $("#sunset").text(response.weather.sunset);
                    $("#windDirection").text(response.weather.huong_gio + "°");
                    $("#cloudCover").text(response.weather.may);
                    $("#visibility").text(response.weather.tam_nhin);
                    $("#feelsLikeModal").text(response.weather.cam_giac + "°C");

                    $("#hourlyForecast").empty();
                    if (response.weather.forecast && response.weather.forecast.length > 0) {
                        response.weather.forecast.forEach(hour => {
                            let hourlyItem = `
                        <div class="hourly-item">
                            <p>${hour.thoi_gian}</p>
                            <i class="fas ${getIconClass(hour.icon)}"></i>
                            <p>${hour.nhiet_do}°C</p>
                            <p class="small">${hour.mo_ta}</p>
                            ${hour.pop > 0 ? `<p class="small">💧 ${hour.pop}%</p>` : ''}
                        </div>
                    `;
                            $("#hourlyForecast").append(hourlyItem);
                        });
                    } else {
                        $("#hourlyForecast").html("<p>Không có dữ liệu dự báo theo giờ.</p>");
                    }

                    $(".weather-info .card-body").removeClass("loading");
                    $(".alert-container").hide();
                    loadHistory();
                } else {
                    $(".error-message").text(response.error);
                    $(".alert-container").fadeIn(500);
                }
                updateBackgroundImage();
            },
            error: function () {
                console.error("Error fetching weather data");
                $(".error-message").text("Đã xảy ra lỗi khi tải dữ liệu.");
                $(".alert-container").fadeIn(500);
            },
            complete: function () {
                $(".weather-info .card-body").removeClass("loading");
            }
        });
    });

    $(document).on("click", ".delete-history", function (e) {
        e.stopPropagation();
        const city = $(this).data("city");
        deleteHistoryItem(city, this);
    });

    $("#clearHistory").click(function () {
        clearAllHistory();
    });

    $(document).on("click", ".history-card", function () {
        const city = $(this).data("city");
        $("#cityInput").val(city);
        $("form").submit();
        // Đánh dấu lịch sử là đã xem
        markHistoryAsViewed(city);
    });
    
    function markHistoryAsViewed(city) {
        $(`.history-card[data-city="${city}"]`).data("viewed", true);
        $(`.history-card[data-city="${city}"] .viewed-icon`).removeClass("fa-eye-slash").addClass("fa-eye");
    }

    $("#cityInput").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/cities",
                dataType: "json",
                data: {
                    q: request.term
                },
                success: function (data) {
                    response(data);
                }
            });
        },
        minLength: 2,
        select: function (event, ui) {
            $("#cityInput").val(ui.item.value);
            $("form").submit();
            return false;
        }
    });

    $("#toggleView").tooltip({
        placement: 'bottom'
    });

    $("#showMoreBtn").click(function () {
        $("#weatherModal").modal("show");
    });

    // Thay đổi sự kiện click cho avatar AI và chữ "Hỏi AI"
    $(document).off("click", ".show-ai-chat");
    $(document).on("click", ".show-ai-chat", function () { 
        if ($("#aiChatSidebar").hasClass("active")) {
            $("#aiChatSidebar").removeClass("active");
            $("#aiChatSidebar").css("left", "-1000px");
            map.invalidateSize();
        } else {
            $("#aiChatSidebar").addClass("active");
            $("#aiChatSidebar").css("left", "0");
            map.invalidateSize();
        }
    });

    $("#closeAiChatBtn").click(function () {
        $("#aiChatSidebar").removeClass("active");
        $("#aiChatSidebar").css("left", "-1000px");
    });

    function showTypingIndicator() {
        if (!isTyping) {
            $("#aiChatHistory").append(`
<div class="message typing-indicator" id="typingIndicator">
  <div class="message-content">
    <span></span>
    <span></span>
    <span></span>
  </div>
</div>
`);
            $("#aiChatHistory").scrollTop($("#aiChatHistory")[0].scrollHeight);
            isTyping = true;
        }
    }

    function hideTypingIndicator() {
        $("#typingIndicator").remove();
        isTyping = false;
    }

    function sendUserMessage(message) {
        $("#aiChatHistory").append(`
<div class="message-container user-message-container">
<div class="message user-message">
  <div class="message-content">
    ${message}
  </div>
</div>
<img src="${userAvatarUrl}" alt="User Avatar" class="avatar user-avatar">
</div>
`);
        $("#aiChatHistory").scrollTop($("#aiChatHistory")[0].scrollHeight);
    }

    function sendAIMessage(response) {
        // Chuyển đổi Markdown thành HTML
        const formattedResponse = markdownIt.render(response);
    
        const aiMessageContainer = document.createElement('div');
        aiMessageContainer.classList.add('message-container', 'ai-message-container');
        aiMessageContainer.innerHTML = `
            <img src="${aiAvatarUrl}" alt="AI Avatar" class="avatar ai-avatar">
            <div class="message ai-message">
                <div class="message-content"></div>
            </div>
        `;
    
        $("#aiChatHistory").append(aiMessageContainer);
        const messageContentDiv = aiMessageContainer.querySelector('.message-content');
    
        // Thêm hiệu ứng đánh máy
        typewriterEffect(messageContentDiv, formattedResponse);
    
        $("#aiChatHistory").scrollTop($("#aiChatHistory")[0].scrollHeight);
    }
    
    function typewriterEffect(element, text, i = 0) {
        const typingSpeed = 5; 
    
        if (i < text.length) {
            // Kiểm tra xem ký tự hiện tại có phải là một phần của thẻ HTML không
            if (text.charAt(i) === '<') {
                // Tìm vị trí của ký tự đóng thẻ
                const closingTagIndex = text.indexOf('>', i);
                if (closingTagIndex !== -1) {
                    // Thêm toàn bộ thẻ vào element.innerHTML
                    element.innerHTML += text.substring(i, closingTagIndex + 1);
                    // Tiếp tục với ký tự sau thẻ đóng
                    typewriterEffect(element, text, closingTagIndex + 1);
                }
            } else {
                // Thêm ký tự vào element.innerHTML
                element.innerHTML += text.charAt(i);
                // Cuộn xuống nếu cần
                element.scrollTop = element.scrollHeight;
                setTimeout(() => typewriterEffect(element, text, i + 1), typingSpeed);
            }
        }
    }

    $("#sendAiChatBtn").click(function () {
        const message = $("#aiChatInput").val();
        $("#aiChatInput").val("");

        if (message.trim() === "") return;

        sendUserMessage(message);
        showTypingIndicator();

        const weatherInfo = `
Khu vực: ${$(".city-title").text().replace("Khu vực: ", "")}
Nhiệt độ: ${$(".temperature").text()}
Cảm giác như: ${$(".feels-like").text()}
Mô tả: ${$(".description").text()}
Độ ẩm: ${$(".humidity").text()}
Áp suất: ${$(".pressure").text()}
Tốc độ gió: ${$(".wind").text()}
`.trim();
        const chatHistory = $("#aiChatHistory .message")
            .map(function () {
                return $(this).find(".message-content").text().trim();
            })
            .get()
            .join("\n");

        // Gửi tin nhắn đến server
        $.ajax({
            url: "/ask_ai",
            method: "POST",
            data: { message: message, weatherInfo: weatherInfo, chatHistory: chatHistory },
            success: function (response) {
                hideTypingIndicator();
                if (response.response) {
                    sendAIMessage(response.response);
                } else {
                    sendAIMessage(response.error);
                }
            },
            error: function () {
                hideTypingIndicator();
                sendAIMessage(" Error khi kết nối đến AI.");
            },
        });
    });

    $("#aiChatInput").keypress(function (event) {
        if (event.which == 13) {
            $("#sendAiChatBtn").click();
            event.preventDefault();
        }
    });

    $("#clearChatBtn").click(function () {
        $("#aiChatHistory").empty();
    });

    $("#aiChatSidebar").addClass("resizable");

    let originalWidth = 0;
    let originalMouseX = 0;

    $("#aiChatSidebar").mousedown(function (e) {
        if (e.target === this || e.target === $("#aiChatSidebar .header")[0] || $(e.target).closest("#aiChatSidebar .header").length) {
            isResizing = true;
            originalMouseX = e.pageX;
            originalWidth = $(this).width();
            $(document).mousemove(handleMouseMove);
            $(document).mouseup(handleMouseUp);
            e.preventDefault();
        }
    });

    function handleMouseMove(e) {
        if (isResizing) {
            const widthChange = e.pageX - originalMouseX;
            let newWidth = originalWidth + widthChange;
            newWidth = Math.max(380, Math.min(newWidth, 800));
            $("#aiChatSidebar").width(newWidth);
        }
    }

    function handleMouseUp() {
        isResizing = false;
        $(document).off("mousemove", handleMouseMove);
        $(document).off("mouseup", handleMouseUp);
    }

    // Clock
    function initializeClock() {
        $(".clock-sidebar").addClass("active");
    }
    initializeClock();

// ---- Phần code mới cho chức năng tìm kiếm lịch sử ----

    function showSearchHistoryPopup() {
        $("#searchHistoryModal").modal("show");
    }

    function searchHistory() {
        const searchCity = $("#searchCityInput").val();
        const searchDate = $("#searchDateInput").val();
        currentSearchQuery = searchCity; 

        currentPage = 1;
        loadHistory(currentPage, currentLimit, currentSearchQuery);
        $("#searchHistoryModal").modal("hide");
    }

    $("#searchHistoryBtn").click(function () {
        showSearchHistoryPopup();
    });

    $("#searchHistorySubmit").click(function () {
        searchHistory();
    });

    // ------------------------MUSIC------------------------
    // Các biến toàn cục
    const audio = new Audio();
    const albumArt = $('.music-player-sidebar .album-art img');
    const progressBar = $('.music-player-sidebar .progress-bar');
    const progress = $('.music-player-sidebar .progress');
    const currentTime = $('.music-player-sidebar .current-time');
    const duration = $('.music-player-sidebar .duration');
    const btnPlayPause = $('.music-player-sidebar .btn-play-pause');
    const btnPrev = $('.music-player-sidebar .btn-prev');
    const btnNext = $('.music-player-sidebar .btn-next');
    const volumeSlider = $('.music-player-sidebar .volume-slider');
    const btnRandom = $('.music-player-sidebar .btn-random');
    const btnRepeat = $('.music-player-sidebar .btn-repeat');
    const btnList = $('.music-player-sidebar .btn-list');
    const playlist = $('.music-player-sidebar .playlist');
    const playlistUl = $('.music-player-sidebar .playlist ul');
    const visualizer = $('.music-player-sidebar .visualizer');
    const musicPlayer = $('.music-player-sidebar .music-player');
    const songNameDisplay = $('.music-player-sidebar .song-name');
    let audioContext;
    let analyser;
    let frequencyData;
    const songInfo = $('.music-player-sidebar .song-info');
    const separator = $('.music-player-sidebar .separator');

    let isPlaying = false;
    let isRandom = false;
    let isListOpen = false;
    let isRepeat = false;
    let currentTrackIndex = 0;
    let tracks = [];

    // Hàm tải danh sách bài hát
    async function loadTrackList() {
        try {
            const response = await fetch('/api/music'); // Thay đổi đường dẫn
            if (!response.ok) {
                throw new Error('Không thể truy cập danh sách nhạc');
            }
            tracks = await response.json(); // Lấy dữ liệu JSON
    
            renderPlaylist();
            loadTrack(currentTrackIndex);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài hát:", error);
        }
    }
    // Hàm tìm nạp các tệp tin từ một thư mục cụ thể
    async function fetchFilesFromDirectory(directory) {
        const response = await fetch(directory);
        if (!response.ok) {
            throw new Error(`Không thể truy cập thư mục ${directory}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(text, 'text/html');
        return Array.from(htmlDoc.querySelectorAll('a'))
            .map(a => a.href)
            .filter(href => !href.endsWith('/')) // Lọc bỏ các thư mục con
            .map(href => {
                const url = new URL(href);
                return url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
            });
    }

    // Hàm hiển thị danh sách bài hát
    function renderPlaylist() {
        playlistUl.empty();
        tracks.forEach((track, index) => {
            const li = $('<li></li>');

            // Tạo div chứa ảnh
            const imageDiv = $('<div></div>').addClass('playlist-item-image');

            // Tạo thẻ img và thiết lập src
            const img = $('<img>').attr('src', track.image).attr('alt', 'Album Art');

            // Thêm img vào div chứa ảnh
            imageDiv.append(img);

            // Tạo span chứa tên bài hát
            const span = $('<span></span>').text(track.name);

            // Thêm div chứa ảnh và span vào li
            li.append(imageDiv).append(span);

            // Thêm sự kiện click vào li
            li.on('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                playTrack();
            });

            // Thêm li vào ul
            playlistUl.append(li);
        });
    }

    // Hàm tải một bài hát cụ thể
    function loadTrack(index) {
        if (tracks.length === 0) return;

        const track = tracks[index];
        audio.src = track.path;
        albumArt.attr('src', track.image);
        audio.load();

        // Hiển thị tên bài hát bên cạnh avatar
        songNameDisplay.text(track.name);

        updatePlaylistHighlight();
    }

    // Hàm phát bài hát
    function playTrack() {
        if (tracks.length === 0) return;

        if (!audioContext) {
            setupVisualizer();
        }

        audio.play().then(() => {
            isPlaying = true;
            btnPlayPause.html('<i class="fas fa-pause"></i>');

            // Thêm class để bắt đầu animation
            songInfo.addClass('animate');

        }).catch(error => {
            console.error("Lỗi khi phát nhạc:", error);
            isPlaying = false;
            btnPlayPause.html('<i class="fas fa-play"></i>');
        });
    }

    // Hàm tạm dừng bài hát
    function pauseTrack() {
        audio.pause();
        isPlaying = false;
        btnPlayPause.html('<i class="fas fa-play"></i>');

        // Xóa class để animation chạy về vị trí cũ
        songInfo.removeClass('animate');
    }

    // Hàm phát/tạm dừng
    function playPause() {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }

    // Hàm chuyển bài tiếp theo
    function nextTrack() {
        if (isRandom) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * tracks.length);
            } while (newIndex === currentTrackIndex && tracks.length > 1);
            currentTrackIndex = newIndex;
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        }
        loadTrack(currentTrackIndex);
        playTrack();
    }

    // Hàm quay lại bài trước đó
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        playTrack();
    }

    // Hàm cập nhật thanh tiến trình
    function updateProgress() {
        if (audio.readyState > 2) {
            const { currentTime: current, duration: dur } = audio;

            if (!isNaN(dur)) {
                const progressPercent = (current / dur) * 100;
                progress.css('width', `${progressPercent}%`);
                currentTime.text(formatTime(current));
                duration.text(formatTime(dur));
            }
        }
    }

    // Hàm thiết lập tiến trình
    function setProgress(e) {
        const width = progressBar.width();
        const clickX = e.offsetX;
        const duration = audio.duration;

        if (!isNaN(duration)) {
            const newTime = (clickX / width) * duration;
            audio.currentTime = newTime;
            const progressPercent = (newTime / duration) * 100;
            progress.css('width', `${progressPercent}%`);
        }
    }

    // Hàm định dạng thời gian
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Hàm thiết lập âm lượng
    function setVolume() {
        audio.volume = volumeSlider.val();
    }

    // Hàm bật/tắt chế độ random
    function toggleRandom() {
        isRandom = !isRandom;
        btnRandom.toggleClass('active', isRandom);
    }

    // Hàm bật/tắt chế độ lặp lại
    function toggleRepeat() {
        isRepeat = !isRepeat;
        btnRepeat.toggleClass('active', isRepeat);
    }

    // Hàm bật/tắt danh sách phát
    function toggleList() {
        isListOpen = !isListOpen;
        playlist.toggleClass('open', isListOpen);
    }

    // Hàm cập nhật đánh dấu bài hát đang phát
    function updatePlaylistHighlight() {
        $('.playlist li').each(function (index) {
            $(this).toggleClass('playing', index === currentTrackIndex);
        });
    }

    // Hàm thiết lập visualizer
    function setupVisualizer() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 64;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
            createBars();
        }
    }

    // Hàm tạo các cột visualizer
    function createBars() {
        visualizer.empty();
        const numberOfBars = frequencyData.length;
        for (let i = 0; i < numberOfBars; i++) {
            const bar = $('<div></div>').addClass('bar');
            visualizer.append(bar);
        }
    }

    // Hàm vẽ visualizer
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        if (!isPlaying) {
            $('.bar').each(function () {
                $(this).height(0);
            });
            return;
        }

        analyser.getByteFrequencyData(frequencyData);

        $('.bar').each(function (index) {
            const height = frequencyData[index] * 0.6;
            $(this).height(height);
        });
    }

    // Hàm xử lý khi bài hát kết thúc
    function handleTrackEnded() {
        if (isRepeat) {
            playTrack();
        } else {
            nextTrack();
        }
    }

    // Gắn các sự kiện vào các phần tử
    btnPlayPause    .on('click', playPause);
    btnNext.on('click', nextTrack);
    btnPrev.on('click', prevTrack);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnded);
    progressBar.on('click', setProgress);
    volumeSlider.on('input', setVolume);
    btnRandom.on('click', toggleRandom);
    btnList.on('click', toggleList);
    btnRepeat.on('click', toggleRepeat);
    audio.addEventListener('play', () => {
        isPlaying = true;
        drawVisualizer();
    });
    audio.addEventListener('pause', () => {
        isPlaying = false;
    });
    audio.addEventListener('loadeddata', () => {
        const { duration: dur } = audio;
        if (!isNaN(dur)) {
            duration.text(formatTime(dur));
        }
    });

    // Khởi tạo music player
    function initializeMusicPlayer() {
        $(".music-player-sidebar").addClass("active");
        loadTrackList();
    }

    initializeMusicPlayer();
    // Danh sách các layer của OpenWeatherMap. Bạn có thể thêm vào khi cần thiết
    const openWeatherMapLayers = {
        temp_new: {
          url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=' + '650f613b4c5426ef7a24e828e1dd0791',
          attribution: 'Weather data by OpenWeatherMap',
          layer: null
        },
        wind_new: {
          url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=' + '650f613b4c5426ef7a24e828e1dd0791',
          attribution: 'Weather data by OpenWeatherMap',
          layer: null
        },
        pressure_new: {
            url: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=' + '650f613b4c5426ef7a24e828e1dd0791',
            attribution: 'Weather data by OpenWeatherMap',
            layer: null
        },
        precipitation_new: {
            url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + '650f613b4c5426ef7a24e828e1dd0791',
            attribution: 'Weather data by OpenWeatherMap',
            layer: null
        },
          clouds_new: {
            url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=' + '650f613b4c5426ef7a24e828e1dd0791',
            attribution: 'Weather data by OpenWeatherMap',
            layer: null
        }
    };

    function initializeLayers() {
        for(const layerName in openWeatherMapLayers) {
            const { url, attribution } = openWeatherMapLayers[layerName];
            const tileLayer = L.tileLayer(url, {
                attribution: attribution
            });
            layers[layerName] = tileLayer;
            if(layerName !== 'temp_new'){
               tileLayer.addTo(map);
               map.removeLayer(tileLayer);
           } else {
             layers[layerName].addTo(map);
           }
       }
    }

    initializeLayers();

    // Hàm chuyển layer
    function switchLayer(layerName) {
        if(layerName == currentLayer) return;
        
        map.removeLayer(layers[currentLayer]);
        layers[layerName].addTo(map);
        currentLayer = layerName;
    }

    toggleLayersButton.click(function (e) {
        e.stopPropagation();
        mapLayers.toggleClass('open');
    
        // Giữ nguyên phần này
        if (mapLayers.hasClass('open')) {
            mapLayers.find('li').each(function (index) {
                $(this).css('animation-delay', index * 0.1 + 's');
            });
        } else {
            mapLayers.find('li').css('animation-delay', '0s');
        }
    });

    $(document).click(function(){
        if(mapLayers.hasClass('open')){
            mapLayers.removeClass('open');
            // Giữ nguyên phần này
            mapLayers.find('li').css('animation-delay', '0s');
        }
    })
  

    mapLayers.on('click', 'li', function(e) {
        e.stopPropagation();
        const layerName = $(this).data('layer');
        mapLayers.find('li.active').removeClass('active');
        $(this).addClass('active');
        switchLayer(layerName);
        mapLayers.removeClass('open')
         // Thêm phần này để reset animation delay
        mapLayers.find('li').css('animation-delay', '0s');
    });
});