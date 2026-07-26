# testtest


from flask import Flask, jsonify,request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mixed_order = []

# クラスの定義
class Airplane:
    def __init__(self,id,name,model,runway,time):
        self.id = id
        self.name = name
        self.model = model  # モデル名
        self.runway = runway
        self.time = time
        self.is_completed = False

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "model": self.model,
            "runway": self.runway,
            "time": self.time,
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
flightStrip.departures.append(Airplane(1,"dep1","B738/M","34R",1758))
flightStrip.departures.append(Airplane(2,"dep2","A359/H","34R",1759))
flightStrip.departures.append(Airplane(3,"dep3","B772/H","34R",1759))
flightStrip.departures.append(Airplane(4,"dep4","E190/M","34R",1801))
flightStrip.departures.append(Airplane(5,"dep5","B738/M","34R",1806))
flightStrip.departures.append(Airplane(6,"dep6","B763/H","34R",1806))
flightStrip.departures.append(Airplane(7,"dep7","B763/H","34R",1807))
flightStrip.departures.append(Airplane(8,"dep8","A339/H","34R",1808))
flightStrip.departures.append(Airplane(9,"dep9","A21N/M","34R",1810))
flightStrip.departures.append(Airplane(10,"dep10","B788/H","34R",1810))
flightStrip.departures.append(Airplane(11,"dep11","B738/M","34R",1812))
flightStrip.departures.append(Airplane(12,"dep12","B738/M","34R",1813))
flightStrip.departures.append(Airplane(13,"dep13","B738/M","34R",1813))
flightStrip.departures.append(Airplane(14,"dep14","B737/M","34R",1814))
flightStrip.departures.append(Airplane(15,"dep15","B738/M","34R",1816))
flightStrip.departures.append(Airplane(16,"dep16","B788/H","34R",1816))
flightStrip.departures.append(Airplane(17,"dep17","B789/H","34R",1818))
flightStrip.departures.append(Airplane(18,"dep18","B763/H","34R",1819))
flightStrip.departures.append(Airplane(19,"dep19","B763/H","34R",1820))
flightStrip.departures.append(Airplane(20,"dep20","B738/M","34R",1822))
flightStrip.departures.append(Airplane(21,"dep21","B772/H","34R",1822))
flightStrip.departures.append(Airplane(22,"dep22","B763/H","34R",1823))
flightStrip.departures.append(Airplane(23,"dep23","B738/M","34R",1824))
flightStrip.departures.append(Airplane(24,"dep24","B78X/H","34R",1824))
flightStrip.departures.append(Airplane(25,"dep25","B788/H","34R",1828))
flightStrip.departures.append(Airplane(26,"dep26","B789/H","34R",1829))
flightStrip.departures.append(Airplane(27,"dep27","B763/H","34R",1833))
flightStrip.departures.append(Airplane(28,"dep28","B789/H","34R",1833))
flightStrip.departures.append(Airplane(29,"dep29","B738/M","34R",1835))
flightStrip.departures.append(Airplane(30,"dep30","B738/M","34R",1837))
flightStrip.departures.append(Airplane(31,"dep31","A320/M","34R",1838))
flightStrip.departures.append(Airplane(32,"dep32","B763/H","34R",1838))
flightStrip.departures.append(Airplane(33,"dep33","B738/M","34R",1840))
flightStrip.departures.append(Airplane(34,"dep34","B738/M","34R",1841))
flightStrip.departures.append(Airplane(35,"dep35","B738/M","34R",1844))
flightStrip.arrivals.append(Airplane(1,"arr1","B789/H","34R",1756))
flightStrip.arrivals.append(Airplane(2,"arr2","B763/H","34R",1757))
flightStrip.arrivals.append(Airplane(3,"arr3","B772/H","34R",1758))
flightStrip.arrivals.append(Airplane(4,"arr4","B738/M","34R",1800))
flightStrip.arrivals.append(Airplane(5,"arr5","B788/H","34R",1800))
flightStrip.arrivals.append(Airplane(6,"arr6","B788/H","34R",1802))
flightStrip.arrivals.append(Airplane(7,"arr7","B738/M","34R",1804))
flightStrip.arrivals.append(Airplane(8,"arr8","B738/M","34R",1804))
flightStrip.arrivals.append(Airplane(9,"arr9","B789/H","34R",1806))
flightStrip.arrivals.append(Airplane(10,"arr10","B789/H","34R",1807))
flightStrip.arrivals.append(Airplane(11,"arr11","B788/H","34R",1808))
flightStrip.arrivals.append(Airplane(12,"arr12","B763/H","34R",1811))
flightStrip.arrivals.append(Airplane(13,"arr13","A21N/M","34R",1812))
flightStrip.arrivals.append(Airplane(14,"arr14","A333/H","34R",1813))
flightStrip.arrivals.append(Airplane(15,"arr15","A21N/M","34R",1816))
flightStrip.arrivals.append(Airplane(16,"arr16","B788/H","34R",1817))
flightStrip.arrivals.append(Airplane(17,"arr17","B789/H","34R",1817))
flightStrip.arrivals.append(Airplane(18,"arr18","B763/H","34R",1819))
flightStrip.arrivals.append(Airplane(19,"arr19","A359/H","34R",1821))
flightStrip.arrivals.append(Airplane(20,"arr20","E190/M","34R",1821))
flightStrip.arrivals.append(Airplane(21,"arr21","B738/M","34R",1823))
flightStrip.arrivals.append(Airplane(22,"arr22","A21N/M","34R",1825))
flightStrip.arrivals.append(Airplane(23,"arr23","B738/M","34R",1826))
flightStrip.arrivals.append(Airplane(24,"arr24","B738/M","34R",1827))
flightStrip.arrivals.append(Airplane(25,"arr25","B738/M","34R",1831))
flightStrip.arrivals.append(Airplane(26,"arr26","B788/H","34R",1831))
flightStrip.arrivals.append(Airplane(27,"arr27","B77W/H","34R",1833))
flightStrip.arrivals.append(Airplane(28,"arr28","B763/H","34R",1835))
flightStrip.arrivals.append(Airplane(29,"arr29","B738/M","34R",1836))
flightStrip.arrivals.append(Airplane(30,"arr30","A320/M","34R",1837))
flightStrip.arrivals.append(Airplane(31,"arr31","E190/M","34R",1838))
flightStrip.arrivals.append(Airplane(32,"arr32","A359/H","34R",1840))
flightStrip.arrivals.append(Airplane(33,"arr33","B788/H","34R",1841))
flightStrip.arrivals.append(Airplane(34,"arr34","B789/H","34R",1842))
flightStrip.arrivals.append(Airplane(35,"arr35","A359/H","34R",1843))
flightStrip.arrivals.append(Airplane(36,"arr36","B763/H","34R",1844))


# シーン2のデータを追加
# flightStrip.departures.append(Airplane(1,"dep1","34R",1402))
# flightStrip.departures.append(Airplane(2,"dep2","34R",1408))
# flightStrip.departures.append(Airplane(3,"dep3","34R",1419))
# flightStrip.departures.append(Airplane(4,"dep4","34R",1422))
# flightStrip.arrivals.append(Airplane(1,"arr001","34R",1406))
# flightStrip.arrivals.append(Airplane(2,"arr002","34R",1409))
# flightStrip.arrivals.append(Airplane(3,"arr003","34R",1412))
# flightStrip.arrivals.append(Airplane(4,"arr004","34R",1417))
# flightStrip.arrivals.append(Airplane(5,"arr005","34R",1420))
# flightStrip.arrivals.append(Airplane(6,"arr006","34R",1424))
# flightStrip.arrivals.append(Airplane(7,"arr007","16L",1436))
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

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return ("", 200)



@app.route("/",methods=["GET"])
def hello():
    return jsonify({"departures": [{"id":airplane.id,"name":airplane.name,"model":airplane.model,"runway":airplane.runway,"time":airplane.time,"is_completed":airplane.is_completed} for airplane in flightStrip.departures],"arrivals": [{"id":airplane.id,"name":airplane.name,"model":airplane.model,"runway":airplane.runway,"time":airplane.time,"is_completed":airplane.is_completed} for airplane in flightStrip.arrivals]})


# 緊急ボタンが押されたときの処理
@app.route('/update_emergency', methods=['POST'])
def update_emergency():
    try:
        # 現在の到着機データを取得（flightdata.arrivalsの長さ）
        arrival_count = len(flightStrip.arrivals)

        # 最後列データのtimeを取得
        last_arrival_time = flightStrip.arrivals[-1].time

        # 新しい到着機データを作成
        new_flight = Airplane(arrival_count + 1, f'arr{arrival_count + 1}', 'B77W/H', '16L', last_arrival_time + 5)

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

@app.route('/remove_strip', methods=['POST'])
def remove_strip():
    try:
        data = request.get_json()
        airplane_id = data.get('id')
        airplane_type = data.get('type')  # "arrival" or "departure"

        if airplane_id is None or airplane_type not in ["arrival", "departure"]:
            return jsonify({'error': 'Invalid request'}), 400

        target_list = flightStrip.arrivals if airplane_type == "arrival" else flightStrip.departures
        target_list[:] = [a for a in target_list if a.id != airplane_id]  # リストから除外

        strips_data[airplane_type + 's'] = [s for s in strips_data[airplane_type + 's'] if s["id"] != airplane_id]  # strips_dataも更新

        return jsonify({'message': f'Strip ID {airplane_id} removed from {airplane_type} list.'}), 200

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

    # TAKE OFF / LINE UP / LAND のステータス（未設定はNone）
    strip_data.setdefault("runway_status", None)

    # 新しいストリップを追加
    strips_data[airplane_type + 's'].append(strip_data)
    return jsonify({"status": "success"})


# TAKE OFF / LINE UP / LAND ボタンでストリップにステータスを付ける
RUNWAY_STATUSES = ("takeoff", "lineup", "land", "goaround")

@app.route('/update_runway_status', methods=['POST'])
def update_runway_status():
    data = request.get_json(silent=True) or {}
    airplane_id = data.get('id')
    airplane_type = data.get('type')
    status = data.get('status')

    if airplane_type not in ("arrival", "departure"):
        return jsonify({"error": "Invalid airplane type"}), 400
    if status is not None and status not in RUNWAY_STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    try:
        airplane_id = int(airplane_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid airplane id"}), 400

    target_list = strips_data[airplane_type + 's']
    for strip in target_list:
        if strip['id'] == airplane_id:
            strip['runway_status'] = status
            return jsonify({"status": "success", "updated_strip": strip}), 200

    return jsonify({"error": "Strip not found"}), 404
    





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
    # return jsonify(strips_data)
    return jsonify({**strips_data, "mixed_order": mixed_order})




# ドラッグ＆ドロップで移動できるゾーン（フロントのコンテナIDとそのまま対応）
ALLOWED_LANES = (
    "takeoffStripContainer",
    "landingStripContainer",
    "combinedStripContainer",
    "runwayOccupancyContainer",
    "stripContainerMid",
)

@app.route('/update_order_mixed', methods=['POST'])
def update_order_mixed():
    global mixed_order
    payload = request.get_json(silent=True) or {}
    order = payload.get("order")

    if not isinstance(order, list):
        return jsonify({"ok": False, "error": "order must be a list"}), 400

    cleaned = []
    for item in order:
        if not isinstance(item, dict):
            continue
        _id = item.get("id")
        _type = item.get("type")

        # idはintに寄せる
        try:
            _id = int(_id)
        except Exception:
            continue

        # typeは departure/arrival のみ許可
        if _type not in ("departure", "arrival"):
            continue
        lane = item.get("lane")
        if lane not in ALLOWED_LANES:
            continue  # 未知のゾーンは無視する

        cleaned_item = {"id": _id, "type": _type, "lane": lane}

        # ハンドオフ済みエリアに入った時刻（自動削除の起点として使う）
        entered_at = item.get("enteredAt")
        if entered_at is not None:
            try:
                cleaned_item["enteredAt"] = int(entered_at)
            except (TypeError, ValueError):
                pass

        cleaned.append(cleaned_item)

    mixed_order = cleaned
    return jsonify({"ok": True, "saved_count": len(mixed_order), "mixed_order": mixed_order})

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

wind_data = {"dir": 270, "spd": 12, "dir2": 270, "spd2": 12}  # デフォルト値（2局分）

@app.route('/get_wind', methods=['GET'])
def get_wind():
    return jsonify(wind_data)

@app.route('/update_wind', methods=['POST'])
def update_wind():
    global wind_data
    data = request.get_json()
    for key in ("dir", "spd", "dir2", "spd2"):
        wind_data[key] = data.get(key, wind_data[key])
    return jsonify({"ok": True, "wind": wind_data})

if __name__ == "__main__":
    app.run(debug=True)
