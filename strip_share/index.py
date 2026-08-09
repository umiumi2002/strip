# testtest


from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mixed_order = []


# クラスの定義
class Airplane:
    def __init__(self, id, name, model, runway, time, callsign=None):
        self.id = id
        self.name = name
        self.model = model  # モデル名
        self.runway = runway
        self.time = time
        self.is_completed = False
        # ★ コールサイン（表示名用）。未指定なら name にフォールバック。
        #    識別キーは従来通り id。name も残す（内部照合用）。
        self.callsign = callsign if callsign else name

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "callsign": self.callsign,   # ★ 追加
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
# name をコールサインに直接変更（id は識別キーなので不変）。旧: dep7/arr2 等 → 便名表示。
# ===== DEPARTURES (C滑走路, 離陸時刻順) =====
flightStrip.departures.append(Airplane(7, "ANA557", "B763/H", "34R", 0))    # MY03122 (旧 dep7)
flightStrip.departures.append(Airplane(1, "JAL525", "A359/H", "34R", 0))    # MY03119 (旧 dep1)
flightStrip.departures.append(Airplane(10, "ANA537", "E190/M", "34R", 0))   # MY03128 (旧 dep10)
flightStrip.departures.append(Airplane(8, "ACA2", "B738/M", "34R", 0))      # MY03125 (旧 dep8)
flightStrip.departures.append(Airplane(11, "DAL8", "A339/H", "34R", 0))     # MY03103 (旧 dep11)
flightStrip.departures.append(Airplane(13, "SNJ79", "B788/H", "34R", 0))    # MY03124 (旧 dep13)
flightStrip.departures.append(Airplane(2, "JAL545", "B738/M", "34R", 0))    # MY03157 (旧 dep2)
flightStrip.departures.append(Airplane(5, "ANA657", "B737/M", "34R", 0))    # MY03173 (旧 dep5)
flightStrip.departures.append(Airplane(12, "JAL557", "B738/M", "34R", 0))   # MY03164 (旧 dep12)
flightStrip.departures.append(Airplane(3, "JAL613", "B763/H", "34R", 0))    # MY03159 (旧 dep3)
flightStrip.departures.append(Airplane(6, "JAL329", "B763/H", "34R", 0))    # MY03162 (旧 dep6)
flightStrip.departures.append(Airplane(4, "ANA267", "B78X/H", "34R", 0))    # MY03141 (旧 dep4)
flightStrip.departures.append(Airplane(19, "SNJ25", "B763/H", "34R", 0))    # MY03214 (旧 dep19)
flightStrip.departures.append(Airplane(21, "JAL669", "B788/H", "34R", 0))   # MY03232 (旧 dep21)
flightStrip.departures.append(Airplane(17, "ANA891", "B772/H", "34R", 0))   # MY03211 (旧 dep17)
# //flightStrip.departures.append(Airplane(30, "ANA75", "B789/H", "34R", 0))  # MY03272 (旧 dep30)

# 31,33,32の順番だった
flightStrip.departures.append(Airplane(28, "JAL579", "B738/M", "34R", 0))   # MY03256 (旧 dep28)
flightStrip.departures.append(Airplane(31, "ANA407", "B763/H", "34R", 0))   # MY03283 (旧 dep32)
flightStrip.departures.append(Airplane(33, "SFJ53", "B738/M", "34R", 0))    # MY03277 (旧 dep31)
flightStrip.departures.append(Airplane(32, "JAL566", "B738/M", "34R", 0))   # MY03289 (旧 dep33)

# ===== ARRIVALS (C滑走路, 着陸時刻順) =====
flightStrip.arrivals.append(Airplane(2, "JAL556", "B763/H", "34R", 1757))    # MY02819 (旧 arr2)
flightStrip.arrivals.append(Airplane(4, "ANA70", "B788/H", "34R", 1800))     # MY02866 (旧 arr4)
flightStrip.arrivals.append(Airplane(7, "ANA750", "B738/M", "34R", 1804))    # MY03017 (旧 arr7)
flightStrip.arrivals.append(Airplane(10, "JAL9", "B789/H", "34R", 1807))     # MY02407 (旧 arr10)
flightStrip.arrivals.append(Airplane(12, "ADO60", "B763/H", "34R", 1811))    # MY02953 (旧 arr12)
flightStrip.arrivals.append(Airplane(16, "ANA92", "B788/H", "34R", 1817))    # MY02722 (旧 arr16)
flightStrip.arrivals.append(Airplane(20, "JAL914", "E190/M", "34R", 1822))   # MY03003 (旧 arr20)
flightStrip.arrivals.append(Airplane(23, "ANA1896", "B738/M", "34R", 1826))  # MY03148 (旧 arr23)
flightStrip.arrivals.append(Airplane(26, "ANA72", "B788/H", "34R", 1831))    # MY02999 (旧 arr26)
flightStrip.arrivals.append(Airplane(29, "SNJ62", "B738/M", "34R", 1836))    # MY03031 (旧 arr29)
flightStrip.arrivals.append(Airplane(32, "JAL518", "A359/H", "34R", 1840))   # MY03045 (旧 arr32)
flightStrip.arrivals.append(Airplane(34, "ANA115", "B789/H", "34R", 1842))   # MY02542 (旧 arr34)


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return ("", 200)


@app.route("/", methods=["GET"])
def hello():
    return jsonify({
        "departures": [
            {"id": airplane.id, "name": airplane.name, "callsign": airplane.callsign,
             "model": airplane.model, "runway": airplane.runway, "time": airplane.time,
             "is_completed": airplane.is_completed}
            for airplane in flightStrip.departures
        ],
        "arrivals": [
            {"id": airplane.id, "name": airplane.name, "callsign": airplane.callsign,
             "model": airplane.model, "runway": airplane.runway, "time": airplane.time,
             "is_completed": airplane.is_completed}
            for airplane in flightStrip.arrivals
        ]
    })


def add_minutes_hhmm(t, minutes):
    """HHMM形式の整数に分を足して繰り上げる（例: 1757 + 20 -> 1817）"""
    try:
        t = int(t)
    except (TypeError, ValueError):
        return t
    h, m = divmod(t, 100)
    total = (h * 60 + m + minutes) % (24 * 60)  # 24時をまたいだら0時に戻す
    return (total // 60) * 100 + (total % 60)


# 緊急ボタンが押されたときの処理
@app.route('/update_emergency', methods=['POST'])
def update_emergency():
    try:
        # 現在の到着機データを取得（flightdata.arrivalsの長さ）
        arrival_count = len(flightStrip.arrivals)

        # 最後列データのtimeを取得
        last_arrival_time = flightStrip.arrivals[-1].time

        # 新しい到着機データを作成（コールサインは便名にフォールバック）
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


# ゴーアラウンド：指定した到着機と同じ便名で、着陸予定を20分後にした到着ストリップを
# 「未表示プール(flightStrip.arrivals)」へ追加する。
# → 押した瞬間には出ず、add strip を押したときに時刻順で出てくる。
@app.route('/goaround', methods=['POST'])
def goaround():
    try:
        data = request.get_json(silent=True) or {}
        try:
            airplane_id = int(data.get('id'))
        except (TypeError, ValueError):
            return jsonify({'error': 'invalid id'}), 400

        # ゴーアラウンドした機体を、表示中の到着ストリップから探す
        original = next((s for s in strips_data['arrivals'] if s['id'] == airplane_id), None)
        if original is None:
            return jsonify({'error': 'arrival strip not found'}), 404

        # 着陸予定を20分後にする
        new_time = add_minutes_hhmm(original.get('time'), 20)

        # 既存の全到着ID（未表示プール + 表示中）と重複しない新ID
        existing_ids = [a.id for a in flightStrip.arrivals] + [s['id'] for s in strips_data['arrivals']]
        new_id = (max(existing_ids) if existing_ids else 0) + 1

        # 未表示プール(master)に追加し、着陸時刻順に並べ替える
        # （add strip はこのプールの先頭の未表示便から順に出すので、時刻順で登場する）
        flightStrip.arrivals.append(
            Airplane(new_id, original.get('name'), original.get('model'),
                     original.get('runway'), new_time, original.get('callsign'))  # ★ コールサイン引き継ぎ
        )
        flightStrip.arrivals.sort(key=lambda a: int(a.time))

        return jsonify({'status': 'success', 'added': {
            'id': new_id,
            'name': original.get('name'),
            'callsign': original.get('callsign'),   # ★ 追加
            'model': original.get('model'),
            'runway': original.get('runway'),
            'time': new_time,
        }}), 200

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


@app.route('/add_strip', methods=['GET', 'POST'])
def add_strip():
    data = request.get_json()
    airplane_type = data['type']
    strip_data = data['strip_data']
    airplane_id = strip_data['id']

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


wind_data = {"dir": 20, "spd": 4, "dir2": 90, "spd2": 6}  # デフォルト値（2局分）


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