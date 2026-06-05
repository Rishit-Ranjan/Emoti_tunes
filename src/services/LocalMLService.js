import * as tf from '@tensorflow/tfjs';

const EMOTION_LABELS = ['Joy', 'Sadness', 'Anger', 'Excitement', 'Melancholy', 'Peaceful'];

class LocalMLService {
    constructor() {
        this.model = null;
        this.initialized = false;
    }

    /**
     * Initializes the custom neural network architecture
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Build a Sequential model
            this.model = tf.sequential();
            
            // Input layer: 3 features (Energy, Freq, Stability)
            this.model.add(tf.layers.dense({
                units: 16,
                activation: 'relu',
                inputShape: [3]
            }));
            
            // Hidden layer for pattern recognition
            this.model.add(tf.layers.dense({
                units: 8,
                activation: 'relu'
            }));
            
            // Output layer: Softmax for multi-class probability
            this.model.add(tf.layers.dense({
                units: EMOTION_LABELS.length,
                activation: 'softmax'
            }));

            this.model.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // Seed the model with initial weights (simulating pre-training)
            await this.seedModel();
            this.initialized = true;
            console.log("🧠 Custom ML Model (AER) online.");
        } catch (error) {
            console.error("Local ML initialization failed:", error);
        }
    }

    async seedModel() {
        // Synthetic data representing mood patterns
        const data = [
            [0.9, 0.8, 0.9], // High energy, high freq, stable -> Joy
            [0.1, 0.2, 0.3], // Low energy, low freq, unstable -> Sadness
            [0.9, 0.5, 0.2], // High energy, mid freq, unstable -> Anger
            [0.9, 0.9, 0.7], // Max energy, high freq -> Excitement
            [0.3, 0.4, 0.5], // Low energy, mid freq -> Melancholy
            [0.4, 0.3, 0.9], // Low energy, low freq, very stable -> Peaceful
        ];
        const labels = [0, 1, 2, 3, 4, 5];

        const xs = tf.tensor2d(data);
        const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), EMOTION_LABELS.length);

        await this.model.fit(xs, ys, { epochs: 30, verbose: 0 });
        xs.dispose();
        ys.dispose();
    }

    predict(features) {
        if (!this.initialized || !features) return null;

        return tf.tidy(() => {
            const freqNorm = Math.min((features.avgFreq || 150) / 1000, 1);
            const input = tf.tensor2d([[
                features.avgEnergy || 0.5,
                freqNorm,
                features.stability || 0.5
            ]]);
            
            const prediction = this.model.predict(input);
            const index = prediction.argMax(1).dataSync()[0];
            return EMOTION_LABELS[index];
        });
    }
}

export const localML = new LocalMLService();