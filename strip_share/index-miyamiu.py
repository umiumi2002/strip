from flask import Flask, jsonify,request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# クラスの定義
class Airplane:
    def __init__(self,id,name,runway,time):
        self.id = id
        self.name = name
        self.runway = runway
        self.time = time
        self.is_completed = False

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "runway": self.runway,
            "time": time_str,
            "is_completed": self.is_completed
        }

class FlightStrip:
    def __init__(self):
        self.departures = []
        self.arrivals = []

    def get_arrivals(self):
        """到着機のリストを取得する"""
        return [airplane.to_dict() for airplane in self.arrivals]
    
    def add_arrival(self, airplane):
        """到着機を追加する"""
        self.arrivals.append(airplane)

    def remove_arrival(self, airplane_id):
        """到着機を ID に基づいて削除する"""
        self.arrivals = [airplane for airplane in self.arrivals if airplane.id != airplane_id]


flightStrip = FlightStrip()

# シーン1のデータを追加
flightStrip.departures.append(Airplane(1,"dep1","16L",1813))
flightStrip.departures.append(Airplane(2,"dep2","16L",1814))
flightStrip.departures.append(Airplane(3,"dep3","16L",1816))
flightStrip.departures.append(Airplane(4,"dep4","16L",1818))
flightStrip.departures.append(Airplane(5,"dep5","16L",1819))
flightStrip.departures.append(Airplane(6,"dep6","16L",1822))
flightStrip.departures.append(Airplane(7,"dep7","16L",1824))
flightStrip.departures.append(Airplane(8,"dep8","16L",1826))
flightStrip.departures.append(Airplane(9,"dep9","16L",1828))
flightStrip.departures.append(Airplane(10,"dep10","16L",1833))
flightStrip.departures.append(Airplane(11,"dep11","16L",1838))
flightStrip.departures.append(Airplane(12,"dep12","16L",1850))
flightStrip.departures.append(Airplane(13,"dep13","16L",1854))
flightStrip.departures.append(Airplane(14,"dep14","16L",1855))
flightStrip.arrivals.append(Airplane(1,"arr1","16L",1802))
flightStrip.arrivals.append(Airplane(2,"arr2","16L",1803))
flightStrip.arrivals.append(Airplane(3,"arr3","16L",1805))
flightStrip.arrivals.append(Airplane(4,"arr4","16L",1807))

# シーン2のデータを追加
# flightStrip.departures.append(Airplane(1,"dep1","34R",1402))
# flightStrip.departures.append(Airplane(2,"dep2","34R",1408))
# flightStrip.departures.append(Airplane(3,"dep3","34R",1419))
# flightStrip.departures.append(Airplane(4,"dep4","34R",1422))
# flightStrip.arrivals.append(Airplane(1,"arr1","34R",1406))
# flightStrip.arrivals.append(Airplane(2,"arr2","34R",1409))
# flightStrip.arrivals.append(Airplane(3,"arr3","34R",1412))
# flightStrip.arrivals.append(Airplane(4,"arr4","34R",1417))
# flightStrip.arrivals.append(Airplane(5,"arr5","34R",1420))
# flightStrip.arrivals.append(Airplane(6,"arr6","34R",1424))
# flightStrip.arrivals.append(Airplane(7,"arr7","16L",1436))
# flightStrip.arrivals.append(Airplane(8,"arr8","16L",1439))
# flightStrip.arrivals.append(Airplane(9,"arr9","16L",1442))
# flightStrip.arrivals.append(Airplane(10,"arr10","16L",1444))
# flightStrip.arrivals.append(Airplane(11,"arr11","16L",1449))
# flightStrip.arrivals.append(Airplane(12,"arr12","16L",1451))

# シーン3のデータを追加
# flightStrip.departures.append(Airplane(1,"dep1","34R","0"+str(623)))
# flightStrip.departures.append(Airplane(2,"dep2","34R","0"+str(631)))
# flightStrip.departures.append(Airplane(3,"dep3","34R","0"+str(635)))
# flightStrip.departures.append(Airplane(4,"dep4","34R","0"+str(650)))
# flightStrip.arrivals.append(Airplane(1,"arr1","34R","0"+str(605)))
# flightStrip.arrivals.append(Airplane(2,"arr2","34R","0"+str(609)))
# flightStrip.arrivals.append(Airplane(3,"arr3","34R","0"+str(611)))
# flightStrip.arrivals.append(Airplane(4,"arr4","34R","0"+str(618)))
# flightStrip.arrivals.append(Airplane(5,"arr5","34R","0"+str(621)))


@app.route("/",methods=["GET"])
def hello():
    return jsonify({"departures": [{"id":airplane.id,"name":airplane.name,"runway":airplane.runway,"time":airplane.time,"is_completed":airplane.is_completed} for airplane in flightStrip.departures],"arrivals": [{"id":airplane.id,"name":airplane.name,"runway":airplane.runway,"time":airplane.time,"is_completed":airplane.is_completed} for airplane in flightStrip.arrivals]})


# 緊急ボタンが押されたときの処理
@app.route('/update_emergency', methods=['POST'])
def update_emergency():
    try:
        # 現在の到着機データを取得（flightdata.arrivalsの長さ）
        arrival_count = len(flightStrip.arrivals)

        # 最後列データのtimeを取得
        last_arrival_time = flightStrip.arrivals[-1].time

        # 新しい到着機データを作成
        new_flight = Airplane(arrival_count + 1, f'arr{arrival_count + 1}', '16L', last_arrival_time + 5)

        # 新しい到着機を arrivals に追加
        flightStrip.add_arrival(new_flight)

        # 更新後の到着機データを返す
        return jsonify({
            'message': 'Emergency flight added successfully',
            'arrivals': flightStrip.get_arrivals()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/remove_emergency', methods=['POST'])
def remove_emergency():
    try:
        airplane_id = request.json.get('id')  # 削除したい飛行機の ID を取得

        if airplane_id is None:
            return jsonify({'error': 'No airplane ID provided'}), 400
        
        # 到着機リストから指定された ID の飛行機を削除
        flightStrip.remove_arrival(airplane_id)

        # 更新後の到着機データを返す
        return jsonify({
            'message': f'Emergency flight with ID {airplane_id} removed successfully',
            'arrivals': flightStrip.get_arrivals()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



# 仮のストリップデータ
strips_data = {
    'departures': [],
    'arrivals': []
}






@app.route('/add_strip', methods=['GET','POST'])
def add_strip():
    data = request.get_json()
    airplane_type = data['type']
    strip_data = data['strip_data']
    airplane_id = strip_data['id']

   
    # 出発機または到着機のストリップを追加
    # if airplane_type == 'departure':
    #     strips_data['departures'].append(strip_data)
    # elif airplane_type == 'arrival':
    #     strips_data['arrivals'].append(strip_data)
    # return jsonify({"status": "success"})

    # すでに同じIDの航空機が存在するか確認
    for strip in strips_data[airplane_type + 's']:
        if strip['id'] == airplane_id:
            return jsonify({"error": "Airplane with the same ID already exists"}), 400


    # 新しいストリップを追加
    strips_data[airplane_type + 's'].append(strip_data)
    return jsonify({"status": "success"})
    





@app.route('/update_status', methods=["GET", "POST"])
def update_status():
    # リクエストの Content-Type を確認
    if request.content_type != 'application/json':
        return jsonify({"error": "Unsupported Media Type"}), 415

    data = request.get_json()  # JSONデータを受け取る
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    airplane_id = data.get("id")
    airplane_type = data.get("type")

    # 受け取ったidに基づいて、arrivals または departuresのいずれかのリストを更新
    if airplane_type == "arrival":
        target_list = flightStrip.arrivals
    else:
        target_list = flightStrip.departures

    # idに該当する航空機データを見つけて、is_completedを切り替える
    for plane in target_list:
        if plane.id == airplane_id:
            plane.is_completed = not plane.is_completed  # 完了状態を切り替え

            update_strips_data(airplane_type, plane)  # ストリップデータを更新

            return jsonify({"message": "Updated successfully", "updated_plane": plane.to_dict()}), 200
    return jsonify({"error": "Airplane not found"}), 404

   
def update_strips_data(airplane_type, updated_plane):
    # `strips_data` を更新する
    target_list = strips_data["arrivals"] if airplane_type == "arrival" else strips_data["departures"]

    for strip in target_list:
        if strip["id"] == updated_plane.id:
            strip["is_completed"] = updated_plane.is_completed
            break

@app.route('/get_strips', methods=['GET'])
def get_strips():
    # 保存されている出発機と到着機の情報を返す
   # 最後に更新された情報のみを返す
    return jsonify(strips_data)

@app.route('/update_strip', methods=['POST'])
def update_strip():
    data = request.get_json()
    airplane_id = int(data['id'])  # ID
    new_type = data['type']  # 'departure' or 'arrival'

    # 現在のストリップデータから該当IDを検索して移動
    moved_strip = None
    for strip in strips_data['departures']:
        if strip['id'] == airplane_id:
            moved_strip = strip
            strips_data['departures'].remove(strip)
            break
    for strip in strips_data['arrivals']:
        if strip['id'] == airplane_id:
            moved_strip = strip
            strips_data['arrivals'].remove(strip)
            break

    if moved_strip:
        if new_type == "departure":
            strips_data['departures'].append(moved_strip)
        elif new_type == "arrival":
            strips_data['arrivals'].append(moved_strip)

        return jsonify({"status": "success", "message": f"Strip {airplane_id} moved to {new_type}"})
    else:
        return jsonify({"status": "error", "message": "Strip not found"}), 404

@app.route('/update_order', methods=['POST'])
def update_order():
    data = request.get_json()
    airplane_type = data['type']  # "departure" または "arrival"
    new_order = data['order']    # 新しい順序 ['1', '3', '4', '2'] など

    # 更新対象リストを選択
    if airplane_type == 'departure':
        target_list = strips_data['departures']
    elif airplane_type == 'arrival':
        target_list = strips_data['arrivals']
    else:
        return jsonify({"error": "Invalid airplane type"}), 400

    # 新しい順序でソート
    try:
        target_list.sort(key=lambda x: new_order.index(str(x['id'])))
    except ValueError as e:
        return jsonify({"error": f"Invalid ID in order: {e}"}), 400

    return jsonify({"status": "success", "updated_data": target_list})

@app.route('/update_arrivals', methods=['POST'])
def update_arrivals():
    # リクエストからJSONデータを取得
    data = request.get_json()

    if 'arrivals' in data:
        # 新しいarrivalsのデータが含まれている場合
        flightStrip['arrivals'] = data['arrivals']
        print("Arrivals updated:", flightStrip['arrivals'])

        # 成功のレスポンスを返す
        return jsonify({'status': 'success', 'message': 'Arrivals updated successfully'}), 200
    else:
        # arrivalsデータが含まれていない場合のエラーハンドリング
        return jsonify({'status': 'error', 'message': 'No arrivals data provided'}), 400


if __name__ == "__main__":
    app.run(debug=True)