from flask import Flask, request, render_template_string, redirect, url_for
import pandas as pd
import joblib
import os

app = Flask(__name__)

# ----------------- MODEL LOAD -----------------
MODEL_FILE = "autism_model.pkl"
FEATURES_FILE = "autism_features.pkl"

model = None
feature_columns = None
model_loaded = False
model_load_error = None

if os.path.exists(MODEL_FILE) and os.path.exists(FEATURES_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        feature_columns = joblib.load(FEATURES_FILE)
        model_loaded = True
        print("✅ Model loaded successfully.")
    except Exception as e:
        model_load_error = str(e)
        print(f"❌ Error loading model: {model_load_error}")
else:
    model_load_error = "ML model not found. Using fallback rules."
    model_loaded = False
    print(f"⚠️ {model_load_error}")


# ----------------- QUESTIONS -----------------
QUESTIONS = [
    "Does the child avoid eye contact or seem not to look at people's faces?",
    "Does the child struggle with social communication (difficulty interacting or talking with others)?",
    "Does the child prefer to play alone rather than with peers?",
    "Is the child unusually sensitive to sounds, textures, lights or smells?",
    "Does the child find it hard to understand others' feelings or intentions?",
    "Does the child display repetitive movements or behaviors (e.g., hand flapping)?",
    "Does the child have difficulty with changes in routine or unexpected events?",
    "Is the child less responsive when their name is called?",
    "Does the child avoid physical affection or seem uninterested in hugs?",
    "Has the child shown delays in speech or language development?"
]


# ----------------- ML PREDICTION -----------------
def predict_with_model(age, sex, a_values, ethnicity):
    df_dict = {"Age": [age]}
    for i, v in enumerate(a_values, start=1):
        df_dict[f"A{i}"] = v

    df_dict["Sex_m"] = 1 if sex == "Male" else 0

    df = pd.DataFrame([df_dict])

    ethnicity_lower = ethnicity.lower().strip()
    if 'asian' in ethnicity_lower:
        df['Ethnicity_Asian'] = 1
    elif 'black' in ethnicity_lower:
        df['Ethnicity_Black'] = 1
    elif 'hispanic' in ethnicity_lower:
        df['Ethnicity_Hispanic'] = 1
    elif 'latino' in ethnicity_lower:
        df['Ethnicity_Latino'] = 1
    elif 'middle eastern' in ethnicity_lower:
        df['Ethnicity_Middle Eastern'] = 1
    elif 'white' in ethnicity_lower or 'caucasian' in ethnicity_lower:
        df['Ethnicity_White-European'] = 1

    df = df.reindex(columns=feature_columns, fill_value=0)
    probability = model.predict_proba(df)[0][1]
    return probability


def rule_based_predict(a_values):
    score = sum(a_values)
    if score <= 3:
        return "No Autism", score
    elif score <= 6:
        return "Medium Risk", score
    else:
        return "High Risk", score


def predict_autism(age, sex, a_values, ethnicity):
    score = sum(a_values)
    if model_loaded:
        try:
            probability = predict_with_model(age, sex, a_values, ethnicity)
            if probability < 0.33:
                return "No Autism", score
            elif probability < 0.66:
                return "Medium Risk", score
            else:
                return "High Risk", score
        except Exception as e:
            print(f"Model prediction failed, falling back to rules. Error: {e}")
            return rule_based_predict(a_values)
    else:
        return rule_based_predict(a_values)


# ----------------- TIPS -----------------
def get_tips(category):
    if category == "No Autism":
        return [
            "🌳 Encourage daily outdoor play and social interaction.",
            "📚 Promote reading and storytelling habits.",
            "💤 Maintain a healthy sleep routine.",
            "🥦 Provide balanced nutrition for growth and brain health.",
            "📵 Limit screen time to prevent social isolation."
        ]
    elif category == "Medium Risk":
        return [
             "👨‍👩‍👧 Encourage your child to join group activities.",
            "🧸 Use educational toys and games to improve focus.",
            "🗣️ Monitor speech and communication closely.",
            "📵 Reduce gadget time, promote real play.",
            "👩‍⚕️ Consult a pediatrician if concerns continue."
        ]
    else:  # High Risk
        return [
            "👩‍⚕️ Seek professional evaluation from a child specialist.",
            "🗣️ Start early therapies (speech/occupational).",
            "📅 Create a consistent daily routine for comfort.",
            "👫 Encourage small-step social interaction.",
            "❤️ Provide emotional support and celebrate progress."
        ]


# ----------------- RESULT PAGE -----------------
RESULT_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Autism Risk Result</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            background: linear-gradient(to bottom right, #a8edea, #fed6e3);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 25px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            max-width: 700px;
            width: 90%;
            animation: fadeIn 1s ease-in-out;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
        }
        .result {
            font-size: 2em;
            font-weight: bold;
            margin: 20px 0;
            padding: 15px;
            border-radius: 15px;
        }
        .low { background-color: #d4fcd2; color: #2e7d32; }
        .medium { background-color: #fff3cd; color: #856404; }
        .high { background-color: #f8d7da; color: #721c24; }
        .tips {
            margin-top: 20px;
            text-align: left;
        }
        .tips h3 {
            margin-bottom: 10px;
        }
        .tips ul {
            list-style-type: " ";
            padding-left: 20px;
        }
        .nav {
            position: absolute;
            top: 20px;
            left: 20px;
        }
        .nav a {
            margin-right: 20px;
            text-decoration: none;
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
        }
        @keyframes fadeIn {
            from {opacity: 0;}
            to {opacity: 1;}
        }
    </style>
</head>
<body>
    <div class="nav">
        <a href="{{ url_for('autism_predictor') }}">Back</a> | 
        <a href="{{ url_for('autism_predictor') }}">Home</a>
    </div>

    <div class="container">
        <h1>🌟 Your Child's Result 🌟</h1>
        <div class="result {{ category_class }}">
            {{ result }}
        </div>

        <div class="tips">
            <h3>Helpful Tips for Parents:</h3>
            <ul>
                {% for tip in tips %}
                <li>{{ tip }}</li>
                {% endfor %}
            </ul>
        </div>
    </div>
</body>
</html>
"""


# ----------------- FORM PAGE -----------------
FORM_PAGE = """
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Autism Risk Predictor</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          softBlue: '#cfe8ff',
          softPink: '#fde2e4',
          softYellow: '#fff8d6',
          softGreen: '#d4f8d4',
        }
      }
    }
  }
</script>
</head>
<body class="bg-gradient-to-r from-softBlue via-softPink to-softYellow min-h-screen flex items-center justify-center font-sans">

<div class="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-xl transform hover:scale-[1.01] transition duration-300">
  <h1 class="text-4xl font-extrabold text-center text-blue-700 drop-shadow-md">Autism Risk Predictor</h1>
  <p class="text-center text-gray-600 mt-2">Answer the questions carefully. This tool predicts <b>risk level</b>, not a medical diagnosis.</p>
  
  {% if error %}
  <div class="bg-red-100 text-red-800 p-3 rounded mt-4 text-center font-semibold animate-pulse">{{ error }}</div>
  {% endif %}

  <form method="POST" class="space-y-6 mt-6">
    <!-- Name -->
    <div class="p-4 bg-softYellow rounded-xl shadow-sm">
      <label class="font-semibold text-lg">Child's Name</label>
      <input type="text" name="name" required class="w-full p-3 border rounded-lg mt-2 focus:ring-2 focus:ring-blue-400 focus:outline-none">
    </div>

    <!-- Age & Sex -->
    <div class="grid grid-cols-2 gap-6">
      <div class="p-4 bg-softGreen rounded-xl shadow-sm">
        <label class="font-semibold text-lg">Age (1–19)</label>
        <input type="number" name="age" min="1" max="19" required class="w-full p-3 border rounded-lg mt-2 focus:ring-2 focus:ring-pink-300 focus:outline-none">
      </div>
      <div class="p-4 bg-softPink rounded-xl shadow-sm">
        <label class="font-semibold text-lg">Sex</label>
        <select name="sex" required class="w-full p-3 border rounded-lg mt-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>

    <!-- Questions -->
    {% for q in questions %}
    <div class="p-5 border rounded-2xl bg-gradient-to-r from-softBlue/40 to-softPink/40 shadow-sm hover:shadow-md transition">
      <p class="font-medium mb-3 text-lg">Q{{ loop.index }}. {{ q }}</p>
      <div class="flex space-x-6 text-lg">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="radio" name="A{{ loop.index }}" value="1" required class="w-5 h-5 accent-green-500">
          <span>Yes</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="radio" name="A{{ loop.index }}" value="0" required class="w-5 h-5 accent-pink-500">
          <span>No</span>
        </label>
      </div>
    </div>
    {% endfor %}

    <!-- Ethnicity -->
    <div class="p-4 bg-softBlue rounded-xl shadow-sm">
      <label class="font-semibold text-lg">Ethnicity</label>
      <input type="text" name="ethnicity" placeholder="e.g., Asian, Black, White, Hispanic" class="w-full p-3 border rounded-lg mt-2 focus:ring-2 focus:ring-green-400 focus:outline-none">
    </div>

    <!-- Submit -->
    <button type="submit" class="w-full bg-gradient-to-r from-blue-400 to-pink-400 hover:from-yellow-300 hover:to-green-400 text-white py-4 rounded-2xl font-bold text-xl shadow-md transform hover:scale-105 transition duration-300">
      Get Prediction
    </button>
  </form>
</div>
</body>
</html>
"""




# ----------------- ROUTES -----------------
@app.route("/", methods=["GET", "POST"])
def autism_predictor():
    error = None
    if request.method == "POST":
        try:
            name = request.form.get("name", "").strip()
            age = int(request.form.get("age", 0))
            sex = request.form.get("sex", "Male")
            a_values = [int(request.form.get(f"A{i}", 0)) for i in range(1, 11)]
            ethnicity = request.form.get("ethnicity", "Others").strip()

            if not name:
                error = "Child's name is required."
                return render_template_string(FORM_PAGE, questions=QUESTIONS, error=error)

            if age < 1 or age > 19:
                error = "Age must be between 1 and 19 years."
                return render_template_string(FORM_PAGE, questions=QUESTIONS, error=error)

            label, score = predict_autism(age, sex, a_values, ethnicity)
            return redirect(url_for("result_page", category=label))
        except Exception as e:
            error = f"An unexpected error occurred: {e}"

    return render_template_string(FORM_PAGE, questions=QUESTIONS, error=error)


@app.route("/result/<category>")
def result_page(category):
    tips = get_tips(category)
    return render_template_string(
        RESULT_PAGE,
        result=category,
        category_class=("low" if category == "No Autism" else "medium" if category == "Medium Risk" else "high"),
        tips=tips
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
