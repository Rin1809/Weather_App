import json
import requests
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_from_directory # Thêm send_from_directory
from datetime import datetime, timedelta
import google.generativeai as genai
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import re
from markdown import Markdown
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")

API_KEY = '650f613b4c5426ef7a24e828e1dd0791'
BASE_URL = "http://api.openweathermap.org/data/2.5/weather?"
FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast?"
USER_DATA_DIR = 'user_data'
USERS_FILE = 'users.json'

GOOGLE_GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GOOGLE_GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY chưa set")

genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 8000,
}
model = genai.GenerativeModel(
    model_name="gemini-pro",
    generation_config=generation_config,
)

chat_history = []
chat_session = model.start_chat(history=chat_history)

# Tạo thư mục user_data nếu chưa tồn tại
if not os.path.exists(USER_DATA_DIR):
    os.makedirs(USER_DATA_DIR)

# Cấu hình đường dẫn tĩnh
@app.route('/static/<path:path>')
def static_dir(path):
  return send_from_directory('static', path)

def get_weather(city_name=None, lat=None, lon=None):
    if city_name:
        url = f"{BASE_URL}appid={API_KEY}&q={city_name}&lang=vi&units=metric"
    elif lat and lon:
        url = f"{BASE_URL}appid={API_KEY}&lat={lat}&lon={lon}&lang=vi&units=metric"
    else:
        return None

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        main = data['main']
        weather_data = {
            "coord": data['coord'],
            "thanh_pho": data['name'],
            "nhiet_do": main['temp'],
            "cam_giac": main['feels_like'],
            "mo_ta": data['weather'][0]['description'],
            "icon": data['weather'][0]['icon'],
            "do_am": main['humidity'],
            "ap_suat": main['pressure'],
            "gio": data['wind']['speed'],
            "huong_gio": data['wind'].get('deg'),
            "may": data['clouds']['all'],
            "tam_nhin": data.get('visibility'),
            "sunrise": datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M'),
            "sunset": datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M'),
            "forecast": get_forecast(data['coord']['lat'], data['coord']['lon'])
        }
        return weather_data
    else:
        return None

def get_forecast(lat, lon):
    url = f"{FORECAST_URL}lat={lat}&lon={lon}&appid={API_KEY}&lang=vi&units=metric"
    response = requests.get(url)
    forecast_data = []

    if response.status_code == 200:
        data = response.json()
        if 'list' in data:
            for item in data['list']:
                forecast_data.append({
                    "thoi_gian": datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d %H:%M:%S'),
                    "nhiet_do": item['main']['temp'],
                    "mo_ta": item['weather'][0]['description'],
                    "icon": item['weather'][0]['icon'],
                    "pop": item['pop'] * 100
                })
        return forecast_data
    else:
        print(f"Lỗi khi truy vấn API dự báo: {response.status_code}")
        return forecast_data

def get_user_history_file(username):
    return os.path.join(USER_DATA_DIR, f"{username}_history.json")

def save_search_history(username, city_name, weather_data):
    history_file = get_user_history_file(username)
    try:
        with open(history_file, 'r+', encoding='utf-8') as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []
            
            # Cập nhật trạng thái đã xem (viewed)
            for item in history:
                if item["thanh_pho"].lower() == city_name.lower():
                    item["data"] = weather_data
                    item["timestamp"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    item["viewed"] = True  # Đã xem
                    break
            else:
                history.append({
                    "thanh_pho": city_name,
                    "data": weather_data,
                    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    "viewed": True  # Mặc định là đã xem khi vừa tra cứu
                })

            history.sort(key=lambda x: x["timestamp"], reverse=True)

            f.seek(0)
            json.dump(history, f, ensure_ascii=False, indent=4)
            f.truncate()

    except FileNotFoundError:
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump([{
                "thanh_pho": city_name,
                "data": weather_data,
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "viewed": True
            }], f, ensure_ascii=False, indent=4)

def get_search_history(username, limit=None, page=1, search_query=None):
    history_file = get_user_history_file(username)
    try:
        with open(history_file, 'r', encoding='utf-8') as f:
            history = json.load(f)

            # Tìm kiếm nếu có search_query
            if search_query:
                search_query = search_query.lower()
                history = [item for item in history if search_query in item["thanh_pho"].lower()]

            # Sắp xếp theo thời gian
            history.sort(key=lambda x: x["timestamp"], reverse=True)

            # Phân trang
            if limit is not None:
                start = (page - 1) * limit
                end = start + limit
                history = history[start:end]

            return history
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    
def mark_history_as_viewed(username, city_name):
    history_file = get_user_history_file(username)
    try:
        with open(history_file, 'r+', encoding='utf-8') as f:
            history = json.load(f)
            for item in history:
                if item["thanh_pho"].lower() == city_name.lower():
                    item["viewed"] = True
                    break
            f.seek(0)
            json.dump(history, f, ensure_ascii=False, indent=4)
            f.truncate()
    except (FileNotFoundError, json.JSONDecodeError):
        pass

def get_icon_class(iconCode):
    switch = {
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
    }
    return switch.get(iconCode, 'fa-question-circle')

def load_users():
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=4)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/delete_history", methods=["POST"])
@login_required
def delete_history():
    username = session.get('username')
    city_to_delete = request.form["city"]
    history_file = get_user_history_file(username)
    try:
        with open(history_file, "r+", encoding="utf-8") as f:
            history = json.load(f)
            new_history = [item for item in history if item["thanh_pho"].lower() != city_to_delete.lower()]
            f.seek(0)
            json.dump(new_history, f, ensure_ascii=False, indent=4)
            f.truncate()
        return jsonify({"success": True})
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({"success": False})

@app.route("/clear_history", methods=["POST"])
@login_required
def clear_history():
    username = session.get('username')
    history_file = get_user_history_file(username)
    try:
        with open(history_file, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=4)
        return jsonify({"success": True})
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({"success": False})

@app.route('/login', methods=['GET', 'POST'])
def login():
    next_url = request.args.get('next')
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        users = load_users()

        if username in users and check_password_hash(users[username]['password'], password):
            session['logged_in'] = True
            session['username'] = username
            if next_url:
                return redirect(next_url)
            else:
                return redirect(url_for('index'))
        else:
            return jsonify({'success': False, 'errors': {'general': 'Sai tên đăng nhập hoặc mật khẩu'}}), 401
    return render_template('login.html', next=next_url)

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    confirm_password = request.form['confirm_password']
    users = load_users()

    errors = {}

    if not re.match(r'^\w+$', username):
        errors['username'] = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'

    if username in users:
        errors['username'] = 'Tên đăng nhập đã tồn tại'

    if password != confirm_password:
        errors['confirm_password'] = 'Mật khẩu không trùng khớp'

    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    users[username] = {
        'email': email,
        'password': generate_password_hash(password)
    }
    save_users(users)
    return jsonify({'success': True}), 200

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    username = session.get('username')
    weather_data = None
    error_message = None
    
    # Lấy các tham số cho phân trang và tìm kiếm
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 3, type=int)  # Số lượng mặc định là 3
    search_query = request.args.get('search_query', None, type=str)

    # Lấy lịch sử tìm kiếm, có phân trang và tìm kiếm
    history = get_search_history(username, limit=limit, page=page, search_query=search_query)

    if request.method == "POST":
        city_name = request.form.get("city")
        lat = request.form.get("lat")
        lon = request.form.get("lon")

        if city_name:
            weather_data = get_weather(city_name=city_name)
        elif lat and lon:
            weather_data = get_weather(lat=lat, lon=lon)

        if weather_data:
            if city_name:
                save_search_history(username, city_name, weather_data)
            # Cập nhật lại lịch sử sau khi tra cứu
            history = get_search_history(username, limit=limit, page=page, search_query=search_query)
            weather_info = f"Thời tiết hiện tại ở {weather_data['thanh_pho']}: {weather_data['nhiet_do']}°C, {weather_data['mo_ta']}."
            chat_history.append({
                'role': 'user',
                'parts': [weather_info]
            })
            return jsonify({'weather': weather_data, 'history': history, 'error': None})
        else:
            error_message = "Không tìm thấy vị trí. Vui lòng thử lại."
            return jsonify({'weather': None, 'history': history, 'error': error_message})

    # Hiển thị thời tiết dựa trên vị trí khi mới đăng nhập
    if not weather_data and not error_message:
        return render_template("index.html", weather=None, error=None, history=history,
                               get_icon_class=get_icon_class)

    return render_template("index.html", weather=weather_data, error=error_message, history=history,
                           get_icon_class=get_icon_class)

@app.route("/search_history", methods=["GET"])
@login_required
def search_history_route():
    username = session.get('username')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 3, type=int)
    search_query = request.args.get('search_query', '', type=str)

    history = get_search_history(username, limit=limit, page=page, search_query=search_query)
    return jsonify(history)

@app.route("/cities")
@login_required
def get_cities():
    query = request.args.get('q')
    try:
        with open('city.list.json', 'r', encoding='utf-8') as f:
            cities = json.load(f)
    except FileNotFoundError:
        print("Lỗi: Không tìm thấy file 'city.list.json'. Hãy chắc chắn file này nằm cùng thư mục với app.py.")
        return jsonify([])

    matching_cities = []
    for city in cities:
        if city['name'].lower().startswith(query.lower()):
            matching_cities.append(city['name'])
            if len(matching_cities) >= 10:
                break

    return jsonify(matching_cities)

@app.route("/ask_ai", methods=["POST"])
@login_required
def ask_ai():
    global chat_session, chat_history

    user_message = request.form["message"]
    weather_info = request.form.get("weatherInfo", "")
    chat_history_text = request.form.get("chatHistory", "")

    prompt_parts = [
        f"Bạn là một trợ lý thời tiết có tên là Rin. Hãy trả lời câu hỏi của người dùng dựa trên thông tin thời tiết sau đây (phân tích và đánh giá tác động của thời tiết đến cơ thể, sức khỏe con người - với phân đánh và giá mức của thời tiết) và lịch sử đoạn chat.\n\n[Thông tin thời tiết]\n{weather_info}\n\n[Lịch sử chat]\n{chat_history_text}\n\n[Câu hỏi của người dùng]\n{user_message}"
        "**Lưu ý:** Trả lời bằng ngôn ngữ Markdown để có thể định dạng văn bản (in đậm, in nghiêng, gạch chân, v.v.). Và luôn có các Emoji ASCII kiểu này chữ kiểu này: *(o゜▽゜)o☆* *o(≧▽≦)o* tùy theo cảm xúc của thời tiết và promt người dùng. Cách dòng đàng hoàng cho dễ đọc"
        "**Không sử dụng Markdown nếu không cần thiết. Tránh bao quanh toàn bộ nội dung bằng các ký tự định dạng như `*`, `_`, `-`, `+` nếu không cần thiết**",
        "**Ví dụ:**",
        " - Để in đậm, sử dụng cú pháp: `**nội dung cần in đậm**`",
        " - Để in nghiêng, sử dụng cú pháp: `*nội dung cần in nghiêng*`",
        " - Để gạch chân, sử dụng cú pháp: `<u>nội dung cần gạch chân</u>`",
        " - Để tô màu chữ, sử dụng cú pháp HTML: `<span style=\"color: red;\">nội dung cần tô màu đỏ</span>`",
        " - Để tạo danh sách, sử dụng dấu `-` hoặc `*` ở đầu mỗi dòng:",
        "   ```",
        "   - Mục 1",
        "   - Mục 2",
        "   ```",
        " - **Không làm:** `*Toàn bộ nội dung trả lời đều in nghiêng và có dấu chấm đầu dòng như thế này*`",
        "   ```",
        "   * - Toàn bộ nội dung trả lời*",
        "   * - Đều in nghiêng*",
        "   * - Và có dấu chấm*",
        "   ```",
        " - **Hãy làm:**",
        "   ```",
        "   Đây là câu trả lời bình thường.",
        "   **Đây là phần in đậm.**",
        "   *Đây là phần in nghiêng.*",
        "   - Đây là một danh sách:",
        "     - Mục 1",
        "     - Mục 2",
        "   ```"

    ]

    prompt = "\n".join(prompt_parts)

    try:
        chat_history.append({
            'role': 'user',
            'parts': [user_message]
        })

        response = chat_session.send_message(prompt)

        chat_history.append({
            'role': 'model',
            'parts': [response.text]
        })

        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Error in ask_ai: {e}")
        return jsonify({"error": "Xảy ra lỗi bên Google (AI)"}), 500


@app.route('/api/music')
@login_required
def get_music_list():
    music_dir = os.path.join(app.static_folder, 'music')
    folders = [f for f in os.listdir(music_dir) if os.path.isdir(os.path.join(music_dir, f))]
    tracks = []
    for folder in folders:
        folder_path = os.path.join(music_dir, folder)
        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        mp3_file = next((f for f in files if f.endswith('.mp3')), None)
        image_file = next((f for f in files if f.endswith(('.jpg', '.png', '.jpeg'))), None)

        if mp3_file and image_file:
            song_name = mp3_file[:-4]  # Bỏ đuôi .mp3
            tracks.append({
                "name": song_name,
                "path": url_for('static', filename=f'music/{folder}/{mp3_file}'),
                "image": url_for('static', filename=f'music/{folder}/{image_file}')
            })

    return jsonify(tracks)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)