from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app) # Enable CORS so VS Code Live Server can communicate with this backend!

# Serve the main HTML file
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# API endpoint for weather data
@app.route('/weather')
def get_weather():
    city = request.args.get('city', '').lower()
    
    if not city.strip():
        return jsonify({'error': 'City not provided'}), 400

    # Mock weather data based on city explicitly requested by User
    if 'delhi' in city:
        data = {
            'location': 'New Delhi, India',
            'description': 'Severe Haze',
            'temperature': 36, 'high': 39, 'low': 30,
            'humidity': 45, 'aqi': 160, 'uv': 9
        }
    elif 'bangalore' in city or 'bengaluru' in city:
        data = {
            'location': 'Bengaluru, India',
            'description': 'Scattered Showers',
            'temperature': 24, 'high': 28, 'low': 21,
            'humidity': 85, 'aqi': 45, 'uv': 4
        }
    elif 'chennai' in city:
        data = {
            'location': 'Chennai, India',
            'description': 'Sunny & Humid',
            'temperature': 34, 'high': 36, 'low': 28,
            'humidity': 85, 'aqi': 65, 'uv': 8
        }
    else:
        # Default fallback (Mumbai context)
        data = {
            'location': city.title() + ', India',
            'description': 'Partly Cloudy',
            'temperature': 31, 'high': 34, 'low': 26,
            'humidity': 68, 'aqi': 142, 'uv': 6
        }
        
    # Apply requested Alert Logic exactly
    alerts = []
    if data['aqi'] > 150:
        alerts.append("Avoid going outside")
    if data['humidity'] > 80:
        alerts.append("High humidity, stay hydrated")
    if data['uv'] > 7:
        alerts.append("Wear sunscreen")
        
    # Append the alerts array to the API response
    data['alerts'] = alerts
    
    return jsonify(data)

if __name__ == '__main__':
    # Running on standard local port
    print("Starting modern weather server on http://localhost:5000")
    app.run(debug=True, port=5000)
