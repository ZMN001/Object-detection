import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    const initializeTf = async () => {
      await tf.ready(); // Initialize TensorFlow
      setIsTfReady(true);

      // Load TensorFlow model
      const modelJson = require('./assets/model/model.json');
      const modelWeights = require('./assets/model/weights.bin');
      const loadedModel = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
      setModel(loadedModel);
    };

    initializeTf();
  }, []);

  const handleCameraStream = async (imageTensor) => {
    if (model) {
      const predictions = await model.executeAsync(imageTensor);
      const parsedPredictions = parsePredictions(predictions);
      setPredictions(parsedPredictions);
    }
  };

  const parsePredictions = (predictions) => {
    const [boxes, scores, classes] = predictions;
    const threshold = 0.5;
    const detectedObjects = [];

    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > threshold) {
        const [yMin, xMin, yMax, xMax] = boxes[i];
        detectedObjects.push({
          bbox: [xMin * screenWidth, yMin * screenHeight, (xMax - xMin) * screenWidth, (yMax - yMin) * screenHeight],
          class: classes[i],
          score: scores[i],
        });
      }
    }
    return detectedObjects;
  };

  const processFrame = (frame) => {
    return tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(frame);
      return imageTensor.resizeBilinear([300, 300]).expandDims(0).toFloat();
    });
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {isTfReady ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          onCameraReady={async () => {
            if (cameraRef.current) {
              const frame = await cameraRef.current.takePictureAsync();
              const imageTensor = processFrame(frame);
              handleCameraStream(imageTensor);
            }
          }}
        />
      ) : (
        <Text>Loading TensorFlow...</Text>
      )}

      <Svg style={styles.overlay}>
        {predictions.map((prediction, index) => (
          <React.Fragment key={index}>
            <Rect
              x={prediction.bbox[0]}
              y={prediction.bbox[1]}
              width={prediction.bbox[2]}
              height={prediction.bbox[3]}
              stroke="red"
              strokeWidth="2"
              fill="none"
            />
            <SvgText
              x={prediction.bbox[0]}
              y={prediction.bbox[1] - 5}
              fill="red"
              fontSize="14"
            >
              {`${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: screenWidth,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
});

