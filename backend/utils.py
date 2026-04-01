"""
Image preprocessing utilities for crop disease prediction.

The preprocessing MUST match what was used during model training.
MobileNetV2 models expect pixels in [-1, 1] range (via preprocess_input).
"""

from PIL import Image
import numpy as np
import tensorflow as tf


def preprocess_image(
    image: Image.Image,
    target_size: tuple[int, int] = (224, 224),
) -> np.ndarray:
    """
    Resize an RGB PIL image, apply MobileNetV2-compatible preprocessing,
    and add a batch dimension.

    The preprocessing pipeline:
    1. Resize to target_size (must match training input size)
    2. Convert to float32 numpy array
    3. Apply MobileNetV2 preprocess_input (scales pixels to [-1, 1])
    4. Add batch dimension → shape (1, H, W, 3)

    Parameters
    ----------
    image : PIL.Image.Image
        Input image (must already be RGB).
    target_size : tuple[int, int]
        (width, height) the model expects.

    Returns
    -------
    np.ndarray
        Array of shape (1, height, width, 3) with float values in [-1, 1].
    """
    # Resize using high-quality resampling
    image = image.resize(target_size, Image.LANCZOS)

    # Convert to float32 array
    img_array = np.array(image, dtype=np.float32)

    # Apply MobileNetV2 preprocessing: scales [0,255] → [-1,1]
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    return img_array