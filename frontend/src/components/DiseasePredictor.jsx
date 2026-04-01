"use client";

import { useState, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_URL = `${API_BASE}/predict`;


const CROPS = [
  {
    key: "rice",
    label: "Paddy (Rice)",
    emoji: "🌾",
    diseases: ["Blast", "Blight", "Brown Spot", "healthy", "leaf scald", "narrow brown spot"],
    description: "Detects common rice diseases including blast, blight, and brown spot, healthy, leaf scald, narrow brown spot.",
  },
  {
    key: "chilli",
    label: "Chilli",
    emoji: "🌶️",
    diseases: ["Anthracnose", "Leaf Curl", "Mites", "healthy", "whitefly", "yellowish",],
    description: "Identifies anthracnose, leaf curl, healthy, whitefly, yellowish and other chilli foliar diseases.",
  },
  {
    key: "finger_millet",
    label: "Finger Millet (Ragi)",
    emoji: "🌿",
    diseases: ["Blast", "Foot Rot", "Wilt", "healthy", "leaf spot"],
    description: "Recognises blast and other important millet diseases affecting yield.",
  },
  {
    key: "sugarcane",
    label: "Sugarcane",
    emoji: "🎋",
    diseases: ["Red Rot", "Smut", "Wilt", "red rust"],
    description: "Detects red rot, smut, red rust and other critical sugarcane diseases.",
  },
];

export default function DiseasePredictor() {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleCropSelect = (cropKey) => {
    setSelectedCrop(cropKey);
    setResult(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be less than 10 MB. Please choose a smaller file.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the image file. Please try a different file.");
      setSelectedFile(null);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePredict = async () => {
    if (!selectedCrop || !selectedFile || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("crop", selectedCrop);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch (_) { }

        // detail can be a string OR a nested object — extract a clean string
        const rawDetail = errData?.detail;
        let msg;
        if (typeof rawDetail === "string") {
          msg = rawDetail;
        } else if (rawDetail && typeof rawDetail === "object") {
          msg = rawDetail.error || rawDetail.message || JSON.stringify(rawDetail);
        } else {
          msg = errData?.error || errData?.message || `Server error (${response.status})`;
        }
        throw new Error(msg);
      }

      const data = await response.json();
      if (data.error || data.detail) {
        const raw = data.error || data.detail;
        throw new Error(typeof raw === "object" ? JSON.stringify(raw) : raw);
      }

      setResult({ ...data, crop: selectedCrop });
    } catch (err) {
      if (err.name === "TypeError" || err.message.includes("Failed to fetch")) {
        setError(`Cannot reach the prediction server. Make sure the backend is running at ${API_BASE}.`);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    clearImage();
    setSelectedCrop(null);
  };

  // Status mapping
  const isReady = selectedCrop && selectedFile;
  const cropInfo = CROPS.find((c) => c.key === selectedCrop);
  let predictHint = "Please select a crop and upload an image to enable prediction.";
  if (isReady) predictHint = `Ready to analyse ${cropInfo?.label || selectedCrop} image.`;
  else if (selectedCrop) predictHint = "Please upload a leaf image to continue.";
  else if (selectedFile) predictHint = "Please select a crop to continue.";

  return (
    <>
      <section className="predictor-section" id="predictor" aria-labelledby="pred-heading">
        <div className="section-header section-header--light">
          <div className="section-tag">AI Tool</div>
          <h2 id="pred-heading">Disease Predictor</h2>
          <p>Select your crop, upload an image, and click Predict</p>
        </div>

        <div className="predictor-card">
          {/* STEP 1: Crop Selection */}
          <div className="predictor-step" id="step-crop">
            <div className="step-label">
              <span className="step-badge" aria-hidden="true">1</span>
              Select Crop
            </div>
            <div className="crop-grid" id="cropGrid" role="radiogroup" aria-label="Select a crop">
              {CROPS.map((crop) => (
                <button
                  key={crop.key}
                  className={`crop-btn ${selectedCrop === crop.key ? "selected" : ""}`}
                  role="radio"
                  aria-checked={selectedCrop === crop.key}
                  onClick={() => handleCropSelect(crop.key)}
                >
                  <span className="crop-emoji" aria-hidden="true">{crop.emoji}</span>
                  <span className="crop-name">{crop.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divider" role="separator"></div>

          {/* STEP 2: Image Upload */}
          <div className="predictor-step" id="step-upload">
            <div className="step-label">
              <span className="step-badge" aria-hidden="true">2</span>
              Upload Leaf Image
            </div>
            <div
              className={`upload-zone ${isDragOver ? "drag-over" : ""}`}
              tabIndex="0"
              role="button"
              aria-label="Upload a leaf image by clicking or dragging"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsDragOver(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files[0]) {
                  processFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                hidden
                aria-label="File input"
                onChange={handleFileChange}
              />
              {!previewUrl ? (
                <div className="upload-placeholder">
                  <div className="upload-icon" aria-hidden="true">📂</div>
                  <p className="upload-main">Drag &amp; drop or <span className="upload-link">browse</span></p>
                  <p className="upload-hint">JPG, PNG, WebP — max 10 MB</p>
                </div>
              ) : (
                <div className="upload-preview">
                  <img src={previewUrl} alt="Selected leaf image preview" />
                  <button
                    className="remove-img"
                    title="Remove image"
                    aria-label="Remove selected image"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="divider" role="separator"></div>

          {/* STEP 3: Predict */}
          <div className="predictor-step" id="step-predict">
            <div className="step-label">
              <span className="step-badge" aria-hidden="true">3</span>
              Run Prediction
            </div>
            <button
              className="btn-predict"
              disabled={!isReady || isLoading}
              aria-live="polite"
              onClick={handlePredict}
            >
              {!isLoading ? (
                <span className="btn-text">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  {" Predict Disease"}
                </span>
              ) : (
                <span className="btn-loader" aria-label="Analyzing image, please wait">
                  <span className="spinner" aria-hidden="true"></span>
                  {" Analyzing…"}
                </span>
              )}
            </button>
            <p className="predict-hint">{predictHint}</p>
          </div>

          {/* RESULT */}
          {result && !error && (
            <div className="result-box" role="region" aria-label="Prediction result" aria-live="polite">
              <div className="result-header">
                <span className="result-icon" aria-hidden="true">🔬</span>
                <h3>Diagnosis Result</h3>
                <span className={`result-status-badge ${result.confidence >= 50 ? "" : "low-conf-badge"}`}>
                  {result.confidence >= 50 ? "Complete" : "Low Confidence"}
                </span>
              </div>

              {/* Low confidence warning */}
              {result.warning && (
                <div className="low-confidence-warning" role="alert">
                  <span aria-hidden="true">⚠️</span>
                  <p>{result.warning}</p>
                </div>
              )}

              <div className="result-body">
                <div className="result-field">
                  <span className="result-key">Crop</span>
                  <span className="result-val">{CROPS.find((c) => c.key === result.crop)?.label || result.crop}</span>
                </div>
                <div className="result-field">
                  <span className="result-key">Detected Disease</span>
                  <span className="result-val result-disease">
                    {result.disease || `Class ${result.predicted_class ?? "Unknown"}`}
                  </span>
                </div>
                <div className="result-field">
                  <span className="result-key">Confidence</span>
                  <div className="confidence-wrap">
                    <div
                      className="confidence-bar-track"
                      role="progressbar"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={Math.min(100, Math.round(result.confidence))}
                    >
                      <div
                        className={`confidence-bar-fill ${
                          result.confidence >= 75 ? "conf-high" :
                          result.confidence >= 50 ? "conf-medium" : "conf-low"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round(result.confidence))}%`
                        }}
                      ></div>
                    </div>
                    <span className={`confidence-pct ${
                      result.confidence >= 75 ? "conf-high-text" :
                      result.confidence >= 50 ? "conf-medium-text" : "conf-low-text"
                    }`}>
                      {Math.min(100, result.confidence)}%
                    </span>
                  </div>
                </div>

                {/* Top alternative predictions */}
                {result.top_predictions && result.top_predictions.length > 1 && (
                  <div className="result-field">
                    <span className="result-key">Other Possibilities</span>
                    <div className="top-predictions">
                      {result.top_predictions.slice(1).map((pred, i) => (
                        <div className="alt-prediction" key={i}>
                          <span className="alt-disease">{pred.disease}</span>
                          <span className="alt-conf">{pred.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="result-footer">
                <button className="btn-new-prediction" onClick={resetAll}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.86" /></svg>
                  {" New Prediction"}
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="error-box" role="alert" aria-live="assertive">
              <span className="error-icon" aria-hidden="true">⚠️</span>
              <div className="error-content">
                <p className="error-title">Prediction Failed</p>
                <p>{error}</p>
              </div>
              <button className="btn-retry" onClick={() => setError(null)}>Retry</button>
            </div>
          )}
        </div>
      </section>

      {/* SUPPORTED CROPS */}
      <section className="crops-section" id="crops" aria-labelledby="crops-heading">
        <div className="section-header">
          <div className="section-tag">Supported Crops</div>
          <h2 id="crops-heading">What We Can Diagnose</h2>
          <p>Our AI model currently recognises diseases across these four crops</p>
        </div>
        <div className="crops-info-grid">
          {CROPS.map((crop) => (
            <div className="crop-info-card" key={`info-${crop.key}`}>
              <span className="cic-icon" aria-hidden="true">{crop.emoji}</span>
              <h3>{crop.label}</h3>
              <p>{crop.description}</p>
              <div className="diseases-list" aria-label="Detectable diseases">
                {crop.diseases.map((d) => (
                  <span className="disease-tag" key={d}>{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
