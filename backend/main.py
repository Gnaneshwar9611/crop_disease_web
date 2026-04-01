"""
AgriScan Backend — Crop Disease Prediction API
Runs fully offline using local .h5 TensorFlow/Keras models.
Returns human-readable disease names with confidence scores.
"""

import os
import sys
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image
import numpy as np

# ── Keras compatibility patch ────────────────────────────────────
import keras

_PATCH_LAYERS = [
    keras.layers.Dense,
    keras.layers.Conv2D,
    keras.layers.DepthwiseConv2D,
    keras.layers.BatchNormalization,
]

for _layer_cls in _PATCH_LAYERS:
    _orig = _layer_cls.from_config

    @classmethod  # type: ignore[misc]
    def _patched_from_config(cls, config, _orig=_orig):
        config.pop("quantization_config", None)
        return _orig.__func__(cls, config)

    _layer_cls.from_config = _patched_from_config

import tensorflow as tf

from utils import preprocess_image

# ── Model configuration ─────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MIN_MODEL_SIZE_BYTES = 1_000
LOW_CONFIDENCE_THRESHOLD = 50.0  # percentage — below this, warn the user

CROP_CONFIG = {
    "chilli": {
        "file": "chilli_model.h5",
        "input_size": (128, 128),
    },
    "rice": {
        "file": "rice_model.h5",
        "input_size": (224, 224),
    },
    "finger_millet": {
        "file": "finger_millet_model.h5",
        "input_size": (224, 224),
    },
    "sugarcane": {
        "file": "sugarcane_model.h5",
        "input_size": (224, 224),
    },
}

# ── Disease class names ──────────────────────────────────────────
# Order MUST match alphabetical folder order used during training
CLASS_NAMES: dict[str, list[str]] = {
    "chilli": [
        "Bacterial Spot",
        "Cercospora Leaf Spot",
        "Healthy",
        "Leaf Curl",
        "Leaf Spot",
        "Powdery Mildew",
        "Whitefly",
        "Yellowish",
    ],
    "rice": [
        "Bacterial Leaf Blight",
        "Blast",
        "Brown Spot",
        "Healthy",
        "Leaf Scald",
        "Tungro",
    ],
    "finger_millet": [
        "Blast",
        "Healthy",
        "Leaf Spot",
        "Millet Rust",
        "Mosaic Streak Virus",
        "Wilt",
    ],
    "sugarcane": [
        "Healthy",
        "Red Rot",
        "Rust",
    ],
}

# ── Load all models at startup ───────────────────────────────────
models: dict[str, tf.keras.Model | None] = {}
model_errors: dict[str, str | None] = {}

print("\n" + "=" * 60)
print("AgriScan — Loading ML models")
print("=" * 60)

for crop_key, cfg in CROP_CONFIG.items():
    model_path = os.path.join(MODELS_DIR, cfg["file"])

    print(f"\n[{crop_key}]")
    print(f"  Path   : {model_path}")
    print(f"  Exists : {os.path.exists(model_path)}")

    if not os.path.exists(model_path):
        models[crop_key] = None
        model_errors[crop_key] = f"File not found: {model_path}"
        print(f"  ✘ File not found")
        continue

    file_size = os.path.getsize(model_path)
    print(f"  Size   : {file_size:,} bytes ({file_size / 1024 / 1024:.1f} MB)")

    if file_size < MIN_MODEL_SIZE_BYTES:
        reason = "File is a Git LFS pointer or corrupted."
        models[crop_key] = None
        model_errors[crop_key] = reason
        print(f"  ✘ {reason}")
        continue

    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        models[crop_key] = model
        model_errors[crop_key] = None

        # Verify model architecture
        output_shape = model.output_shape
        expected_classes = len(CLASS_NAMES[crop_key])
        actual_classes = output_shape[-1]

        # Verify the last layer uses softmax
        last_layer = model.layers[-1]
        activation = getattr(last_layer, "activation", None)
        activation_name = getattr(activation, "__name__", "unknown") if activation else "unknown"

        print(f"  Output : {output_shape} (classes: {actual_classes})")
        print(f"  Activation : {activation_name}")

        if actual_classes != expected_classes:
            print(f"  ⚠ WARNING: Model has {actual_classes} classes but CLASS_NAMES has {expected_classes}!")

        if activation_name != "softmax":
            print(f"  ⚠ WARNING: Last layer activation is '{activation_name}', expected 'softmax'")
            print(f"    Predictions will be passed through softmax at inference time.")

        print(f"  ✔ Loaded successfully")

    except Exception as exc:
        models[crop_key] = None
        model_errors[crop_key] = str(exc)
        print(f"  ✘ Failed to load: {exc}")

loaded_count = sum(1 for m in models.values() if m is not None)
print(f"\n{'=' * 60}")
print(f"Models loaded: {loaded_count} / {len(CROP_CONFIG)}")
print("=" * 60 + "\n")

# ── FastAPI application ─────────────────────────────────────────
app = FastAPI(
    title="AgriScan API",
    description="Crop disease prediction — fully offline",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health-check / welcome endpoint."""
    return {"message": "Welcome to the AgriScan API"}


@app.get("/health")
def health_check():
    """Diagnostic endpoint showing model load status."""
    status = {}
    for crop_key in CROP_CONFIG:
        model_path = os.path.join(MODELS_DIR, CROP_CONFIG[crop_key]["file"])
        file_exists = os.path.exists(model_path)
        file_size = os.path.getsize(model_path) if file_exists else 0

        status[crop_key] = {
            "loaded": models[crop_key] is not None,
            "file": CROP_CONFIG[crop_key]["file"],
            "file_exists": file_exists,
            "file_size_bytes": file_size,
            "error": model_errors.get(crop_key),
        }

    all_loaded = all(v["loaded"] for v in status.values())
    return {
        "status": "ok" if all_loaded else "degraded",
        "models": status,
    }


@app.post("/predict")
async def predict(crop: str = Form(...), file: UploadFile = File(...)):
    """
    Accept a crop name and an image, return:
    - predicted disease name
    - confidence score (percentage)
    - whether the confidence is reliable
    - raw prediction probabilities (for debugging)
    """

    # 1. Validate crop name
    if crop not in CROP_CONFIG:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid crop '{crop}'. Choose from: {list(CROP_CONFIG)}",
        )

    # 2. Check model availability
    model = models[crop]
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Model for '{crop}' is not available. "
                f"Error: {model_errors.get(crop, 'Unknown')}. "
                "Please ensure a valid .h5 model file is in backend/models/."
            ),
        )

    # 3. Read and preprocess the uploaded image
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
        target_size = CROP_CONFIG[crop]["input_size"]
        processed = preprocess_image(image, target_size=target_size)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Image processing error: {exc}")

    # 4. Run prediction
    try:
        raw_predictions = model.predict(processed, verbose=0)

        # Debug: print raw prediction array
        print(f"\n[PREDICT] crop={crop}")
        print(f"  Raw predictions: {raw_predictions[0]}")
        print(f"  Sum: {np.sum(raw_predictions[0]):.4f}")

        # If model doesn't use softmax internally, apply it
        predictions = raw_predictions[0]
        pred_sum = float(np.sum(predictions))

        # Check if output looks like valid probabilities
        if abs(pred_sum - 1.0) > 0.01 or np.any(predictions < 0):
            print(f"  ⚠ Applying softmax (sum was {pred_sum:.4f})")
            predictions = tf.nn.softmax(predictions).numpy()
            print(f"  After softmax: {predictions}")

        # Get top prediction
        predicted_class = int(np.argmax(predictions))
        confidence = float(np.max(predictions))
        confidence_pct = round(confidence * 100, 2)

        # Get top 3 predictions for transparency
        top_indices = np.argsort(predictions)[::-1][:3]
        top_predictions = []
        class_names = CLASS_NAMES[crop]
        for idx in top_indices:
            if idx < len(class_names):
                top_predictions.append({
                    "disease": class_names[idx],
                    "confidence": round(float(predictions[idx]) * 100, 2),
                })

        print(f"  Top prediction: {class_names[predicted_class]} ({confidence_pct}%)")
        print(f"  Top 3: {top_predictions}")

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}")

    # 5. Build response
    disease_name = CLASS_NAMES[crop][predicted_class]

    response = {
        "crop": crop,
        "disease": disease_name,
        "confidence": confidence_pct,
        "top_predictions": top_predictions,
    }

    # 6. Low confidence warning
    if confidence_pct < LOW_CONFIDENCE_THRESHOLD:
        response["warning"] = (
            "Low confidence prediction. The model is not confident about this diagnosis. "
            "Please try uploading a clearer, well-lit image of the affected leaf."
        )

    return response