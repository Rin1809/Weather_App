# Weather App ᓚᘏᗢ

<!-- Vietnamese -->
<details>
  <summary>🇻🇳 Tiếng Việt</summary>

## Giới thiệu

**Weather App (Rin)** là một ứng dụng tra cứu thời tiết đa năng, cung cấp thông tin thời tiết chi tiết, dự báo, lịch sử tìm kiếm, và tích hợp trí tuệ nhân tạo (AI) để hỗ trợ người dùng. Ứng dụng được xây dựng bằng Python, sử dụng Flask framework, API của OpenWeatherMap, và Google Gemini AI.

## Tính năng

*   **Tra cứu thời tiết hiện tại:**  Xem thông tin thời tiết chi tiết cho bất kỳ thành phố nào trên thế giới, bao gồm:
    *   Tên thành phố
    *   Nhiệt độ
    *   Cảm giác như
    *   Mô tả thời tiết (ví dụ: trời nắng, có mây, mưa,...)
    *   Độ ẩm
    *   Áp suất không khí
    *   Tốc độ gió
    *   Hướng gió
    *   Độ che phủ mây
    *   Tầm nhìn
    *   Thời gian mặt trời mọc/lặn
    *   Biểu tượng thời tiết
    *   Thanh hiển thị nhiệt độ
*   **Dự báo thời tiết:** Xem dự báo thời tiết trong 5 ngày tới (mỗi 3 giờ), bao gồm:
    *   Thời gian
    *   Nhiệt độ
    *   Mô tả thời tiết
    *   Xác suất mưa
    *   Biểu đồ nhiệt độ và xác suất mưa
*   **Bản đồ thời tiết:**  Xem bản đồ thời tiết với các lớp khác nhau (nhiệt độ, gió, áp suất, lượng mưa, mây).
*   **Lịch sử tra cứu:**
    *   Lưu trữ lịch sử tìm kiếm thời tiết của người dùng.
    *   Cho phép xem lại, xóa từng mục, hoặc xóa toàn bộ lịch sử.
    *   Tìm kiếm trong lịch sử.
    *   Phân trang lịch sử.
    *   Hiển thị trạng thái "đã xem" / "chưa xem" cho các mục lịch sử.
*   **Tích hợp AI (Rin):**
    *   Trò chuyện với AI (Rin) để hỏi về thời tiết, phân tích tác động của thời tiết đến sức khỏe, và nhận các lời khuyên.
    *   Sử dụng Google Gemini AI.
    *   Hỗ trợ định dạng Markdown và emoji trong câu trả lời của AI.
    *   Có thể tùy chỉnh độ rộng của sidebar chat.
* **Đồng hồ:**
    * Hiển thị đồng hồ kim và đồng hồ số.
    * Hiển thị thời gian giây.
    * Hiển thị ngày tháng.
    * Hiển thị thứ trong tuần.
    * Hiệu ứng Neon cho số, kim và các thành phần khác của đồng hồ.
* **Trình phát nhạc:**
    * Phát nhạc nền.
    * Hiển thị ảnh album và tên bài hát.
    * Điều khiển phát/tạm dừng, chuyển bài, lặp lại, phát ngẫu nhiên.
    * Điều chỉnh âm lượng.
    * Hiển thị thanh tiến trình và thời gian bài hát.
    * Hiển thị danh sách phát (playlist).
    * Hiển thị hiệu ứng visualizer.
*   **Đăng nhập/Đăng ký:**
    *   Quản lý tài khoản người dùng.
    *   Lưu trữ lịch sử tra cứu theo từng tài khoản.
*   **Chế độ tối (Dark Mode):** Chuyển đổi giữa giao diện sáng và tối.
*   **Responsive:** Giao diện tương thích với nhiều kích thước màn hình (desktop, mobile).
* **Thông báo lỗi:** Hiển thị thông báo lỗi rõ ràng khi có lỗi xảy ra (ví dụ: không tìm thấy thành phố).
* **Autocomplete:** Gợi ý tên thành phố khi người dùng nhập.

## Cài đặt

1.  **Yêu cầu hệ thống:**
    *   Python 3.6 trở lên.
    *   Các thư viện Python: `Flask`, `requests`, `python-dotenv`, `Werkzeug`, `google-generativeai`, `markdown`, `chart.js`, `leaflet`, `jquery`, `jquery-ui`, `bootstrap`.

2.  **Các bước cài đặt (Sử dụng `run.bat` - Khuyến nghị):**

    *   Tải repository này về máy (Clone hoặc tải ZIP).
    *   Mở thư mục vừa tải về (`weather_app`).
    *   Chạy file `run.bat`. File này sẽ tự động:
        *   Tạo môi trường ảo (virtual environment) `moitruongao`.
        *   Cài đặt các thư viện cần thiết (từ file `requirements.txt`).
        *   Chạy ứng dụng.

3.  **Các bước cài đặt (Thủ công):**
    Mở terminal (command prompt hoặc PowerShell trên Windows, terminal trên Linux/macOS):

    ```bash
    # Clone repository (nếu chưa tải về)
    git clone https://github.com/Rin1809/Weather_App.git
    cd Weather_App

    # Tạo môi trường ảo (tùy chọn nhưng rất khuyến khích)
    python -m venv moitruongao

    # Kích hoạt môi trường ảo
    # Trên Windows:
    moitruongao\Scripts\activate
    # Trên Linux/macOS:
    source moitruongao/bin/activate

    # Cài đặt các thư viện
    pip install -r requirements.txt
    ```

4.  **Chạy ứng dụng:**

    ```bash
    # Đảm bảo môi trường ảo đã được kích hoạt (nếu bạn dùng môi trường ảo)
    python app/app.py
    ```
    Hoặc
    ```bash
    #Trên window
    run.bat
    ```

## Hướng dẫn sử dụng

1.  **Đăng nhập/Đăng ký:**
    *   Truy cập trang đăng nhập/đăng ký.
    *   Tạo tài khoản mới hoặc đăng nhập bằng tài khoản đã có.
    *   Lịch sử tra cứu sẽ được lưu theo từng tài khoản.

2.  **Tra cứu thời tiết:**
    *   Nhập tên thành phố vào ô tìm kiếm và nhấn Enter hoặc nút "Tra cứu".
    *   Hoặc, sử dụng định vị (geolocation) để tra cứu thời tiết tại vị trí hiện tại.
    *   Thông tin thời tiết hiện tại và dự báo sẽ được hiển thị.

3.  **Xem bản đồ thời tiết:**
    *  Chuyển đổi giữa chế độ xem bản đồ và biểu đồ bằng nút "Chuyển đổi Biểu đồ/Bản đồ".
    *   Chọn các lớp bản đồ khác nhau (nhiệt độ, gió,...) bằng nút "Lớp bản đồ".

4.  **Xem lịch sử tra cứu:**
    *   Lịch sử tra cứu sẽ được hiển thị ở phần dưới trang chính.
    *   Nhấn vào một mục lịch sử để xem lại thông tin thời tiết.
    *   Xóa từng mục lịch sử hoặc xóa toàn bộ.
    *   Tìm kiếm trong lịch sử bằng nút "Tìm kiếm" trong phần lịch sử.
    *   Chuyển trang bằng nút "Trước" và "Sau".

5.  **Sử dụng AI (Rin):**
    *   Nhấn vào biểu tượng AI hoặc chữ "Hỏi AI" để mở sidebar chat.
    *   Nhập câu hỏi vào ô chat và nhấn Enter hoặc nút gửi.
    *  Có thể kéo để tăng giảm độ rộng của sidebar.

6.  **Sử dụng đồng hồ:**
    *   Đồng hồ sẽ luôn hiển thị ở bên phải màn hình (trên desktop).

7.  **Sử dụng trình phát nhạc:**
     *   Trình phát nhạc sẽ luôn hiển thị ở bên trái màn hình (trên desktop).
     *   Nhạc sẽ tự động phát khi vào trang.

8.  **Chuyển đổi chế độ tối:**
    *   Nhấn vào nút "Chế độ tối" (hình mặt trăng/mặt trời) ở góc trên bên phải để chuyển đổi.

## API Sử Dụng

*   **OpenWeatherMap API:**  Dùng để lấy dữ liệu thời tiết hiện tại và dự báo.  Bạn cần có API key để sử dụng.  Đặt API key vào file `.env` (trong thư mục `app`) với biến `API_KEY`.
*   **Google Gemini API:**  Dùng cho tính năng AI.  Bạn cần có API key. Đặt API key vào file `.env` với biến `GEMINI_API_KEY`.

## Cấu trúc thư mục

```
weather_app/
├── app/              # Thư mục chứa code chính của ứng dụng
│   ├── .env          # File cấu hình (chứa API key, SECRET_KEY)
│   ├── app.py        # File Python chính (chứa code Flask)
│   ├── static/       # Thư mục chứa các file tĩnh (CSS, JS, images, music)
│   │   ├── css/
│   │   ├── images/
│   │   ├── js/
│   │   └── music/
│   └── templates/    # Thư mục chứa các file HTML template
│       ├── index.html
│       └── login.html
├── plugins/          # (Không dùng đến)
├── run.bat           # Script để chạy ứng dụng (Windows)
├── user_data/        # Thư mục chứa dữ liệu người dùng (lịch sử tìm kiếm)
├── city.list.json     # Danh sách thành phố
└── requirements.txt  # Danh sách các thư viện Python cần thiết
```

## Lưu ý

*   **Môi trường ảo:** Luôn sử dụng môi trường ảo để quản lý các thư viện Python.

</details>

<!-- English -->
<details>
  <summary>🇬🇧 English</summary>

## Introduction

**Weather App (Rin)** is a feature-rich weather application that provides detailed weather information, forecasts, search history, and integrates with Artificial Intelligence (AI) to assist users.  The application is built with Python, using the Flask framework, the OpenWeatherMap API, and Google Gemini AI.

## Features

*   **Current Weather:** View detailed weather information for any city in the world, including:
    *   City name
    *   Temperature
    *   Feels-like temperature
    *   Weather description (e.g., sunny, cloudy, rainy, etc.)
    *   Humidity
    *   Air pressure
    *   Wind speed
    *   Wind direction
    *   Cloud cover
    *   Visibility
    *   Sunrise/sunset times
    *   Weather icon
    * Temperature Bar
*   **Weather Forecast:** View the weather forecast for the next 5 days (every 3 hours), including:
    *   Time
    *   Temperature
    *   Weather description
    *   Probability of precipitation
    *   Temperature and precipitation probability chart
*   **Weather Map:** View a weather map with different layers (temperature, wind, pressure, precipitation, clouds).
*   **Search History:**
    *   Stores the user's weather search history.
    *   Allows reviewing, deleting individual items, or clearing the entire history.
    *   Search within the history.
    *   History pagination.
    *   Displays "viewed" / "not viewed" status for history items.
*   **AI Integration (Rin):**
    *   Chat with AI (Rin) to ask about the weather, analyze the impact of weather on health, and receive advice.
    *   Uses Google Gemini AI.
    *   Supports Markdown formatting and emojis in AI responses.
    * Adjustable sidebar width.
*   **Clock:**
    * Display analog and digital clock.
    * Display seconds.
    * Display date.
    * Display day of week.
    * Neon effect for numbers, hands and other components.
*   **Music Player:**
    *   Plays background music.
    *   Displays album art and song title.
    *   Play/pause, next track, previous track, repeat, and shuffle controls.
    *   Volume control.
    *   Displays progress bar and song time.
    *   Displays playlist.
    *   Displays visualizer.
*   **Login/Register:**
    *   User account management.
    *   Stores search history for each account.
*   **Dark Mode:** Switch between light and dark themes.
*   **Responsive:** The interface is compatible with various screen sizes (desktop, mobile).
* **Error Alert:** Display clear error messages when an error (e.g. city not found).
* **Autocomplete:** City name suggestions.

## Installation

1.  **System Requirements:**
    *   Python 3.6 or higher.
    *   Python libraries: `Flask`, `requests`, `python-dotenv`, `Werkzeug`, `google-generativeai`, `markdown`, `chart.js`, `leaflet`, `jquery`, `jquery-ui`, `bootstrap`.

2.  **Installation Steps (Using `run.bat` - Recommended):**

    *   Download this repository (Clone or download ZIP).
    *   Open the downloaded folder (`weather_app`).
    *   Run the `run.bat` file. This will automatically:
        *   Create a virtual environment (`moitruongao`).
        *   Install the necessary libraries (from `requirements.txt`).
        *   Run the application.

3.  **Installation Steps (Manual):**
    Open a terminal (command prompt or PowerShell on Windows, terminal on Linux/macOS):

    ```bash
    # Clone the repository (if not already downloaded)
    git clone https://github.com/Rin1809/Weather_App.git
    cd Weather_App

    # Create a virtual environment (optional but highly recommended)
    python -m venv moitruongao

    # Activate the virtual environment
    # On Windows:
    moitruongao\Scripts\activate
    # On Linux/macOS:
    source moitruongao/bin/activate

    # Install the libraries
    pip install -r requirements.txt
    ```

4.  **Run the Application:**

    ```bash
    # Make sure the virtual environment is activated (if you are using one)
    python app/app.py
    ```
    Or
    ```bash
    #On window
    run.bat
    ```

## Usage Instructions

1.  **Login/Register:**
    *   Access the login/registration page.
    *   Create a new account or log in with an existing account.
    *   Search history will be saved for each account.

2.  **Weather Search:**
    *   Enter the city name in the search box and press Enter or the "Search" button.
    *   Or, use geolocation to look up the weather at your current location.
    *   Current weather information and forecast will be displayed.

3.  **View Weather Map:**
    *   Switch between map and chart views using the "Toggle Chart/Map" button.
    *   Select different map layers (temperature, wind,...) using the "Map Layers" button.

4.  **View Search History:**
    *   The search history will be displayed at the bottom of the main page.
    *   Click on a history item to view the weather information again.
    *   Delete individual history items or clear the entire history.
    *   Search within the history using the "Search" button in the history section.
    *   Navigate pages with "Previous" and "Next" button.

5.  **Use AI (Rin):**
    *   Click the AI icon or the "Ask AI" text to open the chat sidebar.
    *   Enter your question in the chat box and press Enter or the send button.
    * Drag to resize sidebar.

6.  **Use the clock:**
    * The clock will always display on the right side of the screen (desktop).

7.  **Use music player:**
    * The music player will always be displayed on the left side of the screen (desktop).
    * Music will automatically play when you enter page.

8.  **Switch Dark Mode:**
    *   Click the "Dark Mode" button (moon/sun icon) in the top right corner to switch.

## APIs Used

*   **OpenWeatherMap API:** Used to retrieve current weather data and forecasts. You need an API key to use it. Put the API key in the `.env` file (in the `app` folder) with the variable `API_KEY`.
*   **Google Gemini API:** Used for the AI feature. You need an API key.  Put the API key in the `.env` file with the variable `GEMINI_API_KEY`.

## Folder Structure

```
weather_app/
├── app/              # Main application code folder
│   ├── .env          # Configuration file (contains API key, SECRET_KEY)
│   ├── app.py        # Main Python file (contains Flask code)
│   ├── static/       # Static files (CSS, JS, images, music)
│   │   ├── css/
│   │   ├── images/
│   │   ├── js/
│   │   └── music/
│   └── templates/    # HTML template files
│       ├── index.html
│       └── login.html
├── plugins/          # (Unused)
├── run.bat           # Script to run the application (Windows)
├── user_data/        # User data folder (search history)
├── city.list.json     # List of cities
└── requirements.txt  # List of required Python libraries
```

## Notes

*   **Virtual Environment:** Always use a virtual environment to manage Python libraries.

</details>

<!-- Japanese -->
<details>
  <summary>🇯🇵 日本語</summary>

## イントロダクション

**Weather App (Rin)** は、詳細な天気情報、予報、検索履歴を提供し、ユーザーを支援する人工知能 (AI) を統合した多機能天気アプリケーションです。このアプリケーションは Python で構築されており、Flask フレームワーク、OpenWeatherMap API、Google Gemini AI を使用しています。

## 機能

*   **現在の天気:** 世界中の都市の詳細な天気情報を表示します。
    *   都市名
    *   気温
    *   体感温度
    *   天気の説明 (例: 晴れ、曇り、雨など)
    *   湿度
    *   気圧
    *   風速
    *   風向
    *   雲量
    *   視程
    *   日の出/日の入り時刻
    *   天気アイコン
    * 温度バー
*   **天気予報:** 今後5日間の天気予報 (3時間ごと) を表示します。
    *   時間
    *   気温
    *   天気の説明
    *   降水確率
    *   気温と降水確率のグラフ
*   **天気図:** さまざまなレイヤー (気温、風、気圧、降水量、雲) を持つ天気図を表示します。
*   **検索履歴:**
    *   ユーザーの天気検索履歴を保存します。
    *   個々のアイテムの確認、削除、または履歴全体のクリアが可能です。
    *   履歴内検索。
    *   履歴のページネーション。
    *   履歴アイテムの「表示済み」/「未表示」ステータスを表示します。
*   **AI 統合 (Rin):**
    *   AI (Rin) とチャットして、天気について質問したり、天気による健康への影響を分析したり、アドバイスを受けたりできます。
    *   Google Gemini AI を使用します。
    *   AI の応答で Markdown 形式と絵文字をサポートします。
    * サイドバーの幅を調整可能。
*   **時計:**
    * アナログ時計とデジタル時計を表示します。
    * 秒を表示します。
    * 日付を表示します。
    * 曜日を表示します。
    * 数字、針、その他のコンポーネントにネオンエフェクト。
*   **音楽プレーヤー:**
    *   BGM を再生します。
    *   アルバムアートと曲のタイトルを表示します。
    *   再生/一時停止、次のトラック、前のトラック、リピート、シャッフルコントロール。
    *   音量調節。
    *   プログレスバーと曲の時間を表示します。
    *   プレイリストを表示します。
    *   ビジュアライザーを表示します。
*   **ログイン/登録:**
    *   ユーザーアカウント管理。
    *   アカウントごとに検索履歴を保存します。
*   **ダークモード:** ライトテーマとダークテーマを切り替えます。
*   **レスポンシブ:** インターフェイスはさまざまな画面サイズ (デスクトップ、モバイル) に対応しています。
* **エラーアラート:** エラー(都市が見つからないなど)が発生した場合、明確なエラーメッセージを表示します。
* **オートコンプリート:** 都市名の候補を表示します。

## インストール

1.  **システム要件:**
    *   Python 3.6 以上。
    *   Python ライブラリ: `Flask`, `requests`, `python-dotenv`, `Werkzeug`, `google-generativeai`, `markdown`, `chart.js`, `leaflet`, `jquery`, `jquery-ui`, `bootstrap`.

2.  **インストール手順 (`run.bat` の使用 - 推奨):**

    *   このリポジトリをダウンロードします (クローンまたは ZIP ダウンロード)。
    *   ダウンロードしたフォルダ (`weather_app`) を開きます。
    *   `run.bat` ファイルを実行します。これにより、自動的に次の処理が行われます。
        *   仮想環境 (`moitruongao`) を作成します。
        *   必要なライブラリをインストールします (`requirements.txt` から)。
        *   アプリケーションを実行します。

3.  **インストール手順 (手動):**
    ターミナル (Windows ではコマンドプロンプトまたは PowerShell、Linux/macOS ではターミナル) を開きます。

    ```bash
    # リポジトリをクローンします (まだダウンロードしていない場合)
    git clone https://github.com/Rin1809/Weather_App.git
    cd Weather_App

    # 仮想環境を作成します (オプションですが、強く推奨します)
    python -m venv moitruongao

    # 仮想環境をアクティブ化します
    # Windows の場合:
    moitruongao\Scripts\activate
    # Linux/macOS の場合:
    source moitruongao/bin/activate

    # ライブラリをインストールします
    pip install -r requirements.txt
    ```

4.  **アプリケーションの実行:**

    ```bash
    # 仮想環境がアクティブ化されていることを確認してください (使用している場合)
    python app/app.py
    ```
    または
    ```bash
    #Windowsの場合
    run.bat
    ```

## 使用方法

1.  **ログイン/登録:**
    *   ログイン/登録ページにアクセスします。
    *   新しいアカウントを作成するか、既存のアカウントでログインします。
    *   検索履歴はアカウントごとに保存されます。

2.  **天気検索:**
    *   検索ボックスに都市名を入力し、Enter キーまたは「検索」ボタンを押します。
    *   または、位置情報を使用して現在地の天気を調べます。
    *   現在の天気情報と予報が表示されます。

3.  **天気図の表示:**
    *   「グラフ/地図の切り替え」ボタンを使用して、地図ビューとグラフビューを切り替えます。
    *   「地図レイヤー」ボタンを使用して、さまざまな地図レイヤー (気温、風など) を選択します。

4.  **検索履歴の表示:**
    *   検索履歴はメインページの下部に表示されます。
    *   履歴項目をクリックすると、天気情報が再度表示されます。
    *   個々の履歴アイテムを削除するか、履歴全体をクリアします。
    * 履歴セクションの[検索]ボタンを使用して、履歴内を検索します。
    * [前へ] および [次へ] ボタンでページを移動します。

5.  **AI (Rin) の使用:**
    *   AI アイコンまたは「AI に質問」テキストをクリックして、チャットサイドバーを開きます。
    *   チャットボックスに質問を入力し、Enter キーまたは送信ボタンを押します。
    * ドラッグでサイドバーのサイズを変更できます。

6.  **時計の使用:**
    * 時計は常に画面の右側に表示されます(デスクトップ)。

7.  **音楽プレーヤーの使用:**
    * 音楽プレーヤーは、常に画面の左側に表示されます(デスクトップ)。
    * ページに入ると、音楽が自動的に再生されます。

8.  **ダークモードの切り替え:**
    *   右上隅にある「ダークモード」ボタン (月/太陽のアイコン) をクリックして切り替えます。

## 使用されている API

*   **OpenWeatherMap API:** 現在の天気データと予報を取得するために使用されます。使用するには API キーが必要です。`app` フォルダ内の `.env` ファイルに `API_KEY` 変数を使用して API キーを設定してください。
*   **Google Gemini API:** AI 機能に使用されます。API キーが必要です。`.env` ファイルに `GEMINI_API_KEY` 変数を使用して API キーを設定してください。

## フォルダ構造

```
weather_app/
├── app/              # メインアプリケーションコードフォルダ
│   ├── .env          # 設定ファイル (API キー、SECRET_KEY を含む)
│   ├── app.py        # メイン Python ファイル (Flask コードを含む)
│   ├── static/       # 静的ファイル (CSS、JS、画像、音楽)
│   │   ├── css/
│   │   ├── images/
│   │   ├── js/
│   │   └── music/
│   └── templates/    # HTML テンプレートファイル
│       ├── index.html
│       └── login.html
├── plugins/          # (未使用)
├── run.bat           # アプリケーションを実行するためのスクリプト (Windows)
├── user_data/        # ユーザーデータフォルダ (検索履歴)
├── city.list.json     # 都市リスト
└── requirements.txt  # 必要な Python ライブラリのリスト
```

## 注意事項

*   **仮想環境:** Python ライブラリを管理するには、常に仮想環境を使用してください。

</details>
