import { type Lesson } from '../../../types/curriculum';

export const lesson07: Lesson = {
  id: 'statistics',
  title: 'Statistics: Scouting Data & Sensor Noise',
  subtitle: 'Your encoder does not lie — it just tells the truth with error bars.',
  order: 7,
  estimatedMinutes: 20,
  tags: ['statistics', 'sensors', 'scouting', 'filtering', 'kalman'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Statistics is the math of uncertainty, and FRC is full of it. Encoder readings jitter.
            Cameras miss detections. Scouting data varies between observers and matches. A team
            that can quantify uncertainty — not just ignore it — makes better alliance picks,
            tunes better controllers, and builds more reliable sensors pipelines.
          </p>
        </div>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Mean and standard deviation</h3>
          <p>
            The mean is the center. The standard deviation describes the spread — how far typical
            values stray from the center. In sensor terms: mean is bias, standard deviation is
            noise.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Sample mean',
      latex: String.raw`\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i`,
    },

    {
      type: 'formula',
      label: 'Sample standard deviation',
      latex: String.raw`s = \sqrt{\frac{1}{n-1} \sum_{i=1}^{n}(x_i - \bar{x})^2}`,
      explanation: 'Use n − 1 (not n) for sample data to get an unbiased estimate. When n is large the difference is negligible.',
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Using std dev for scouting',
      content: (
        <p>
          If Team A scores an average of 18 game pieces per match with σ = 2, and Team B averages
          20 with σ = 8, Team A is more predictable. In elimination rounds, a consistent 18 may be
          more valuable than a boom-or-bust 20. Scouting apps should report both average and
          standard deviation for every metric.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Moving average: simple sensor filtering</h3>
          <p>
            A moving average smooths noisy sensor readings by averaging the last N samples. It
            trades responsiveness (large N = slower response) for noise rejection (large N = less
            noise). It's the first filter to reach for when an encoder or gyro reading is jittery.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'N-sample moving average',
      latex: String.raw`\bar{x}_{t} = \frac{1}{N}\sum_{k=0}^{N-1} x_{t-k}`,
      explanation: 'WPILib\'s LinearFilter.movingAverage(N) implements this. For derivatives (velocity from position), use a larger N to suppress noise amplification.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Weighted averages and Kalman filters</h3>
          <p>
            A Kalman filter is a weighted average that takes two noisy estimates — a prediction
            from a model and a measurement from a sensor — and combines them weighted by their
            respective uncertainties. The more trustworthy source gets more weight.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Kalman update (simplified 1D)',
      latex: String.raw`\hat{x}_{new} = \hat{x} + K(z - \hat{x}) \qquad K = \frac{P}{P + R}`,
      variables: [
        { symbol: '\\hat{x}', meaning: 'Current state estimate',              unit: 'varies' },
        { symbol: 'z',        meaning: 'Measurement from sensor',              unit: 'varies' },
        { symbol: 'K',        meaning: 'Kalman gain (0–1)',                    unit: '—' },
        { symbol: 'P',        meaning: 'Estimate uncertainty (covariance)',    unit: 'varies²' },
        { symbol: 'R',        meaning: 'Measurement noise covariance',         unit: 'varies²' },
      ],
      explanation:
        'When R is small (sensor trustworthy), K → 1 and the estimate jumps to the measurement. When R is large (sensor noisy), K → 0 and the model prediction dominates. WPILib\'s SwerveDrivePoseEstimator implements the full multi-dimensional version.',
    },

    {
      type: 'worked-example',
      title: 'Interpreting noisy gyro data',
      problem: (
        <div className="text-sm space-y-1">
          <p>
            A gyro reads these headings over 5 samples: 90.1°, 89.8°, 90.3°, 89.9°, 90.2°. What
            is the mean reading and standard deviation? Would a 5-sample moving average help?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Mean',
          latex: String.raw`\bar{x} = \frac{90.1 + 89.8 + 90.3 + 89.9 + 90.2}{5} = \frac{450.3}{5} = 90.06°`,
          explanation: <p className="text-sm text-slate-600">The gyro is centered very close to 90°.</p>,
        },
        {
          label: 'Deviations squared',
          latex: String.raw`(0.04)^2 + (0.26)^2 + (0.24)^2 + (0.16)^2 + (0.14)^2 = 0.0016 + 0.0676 + 0.0576 + 0.0256 + 0.0196 = 0.172`,
          explanation: <p className="text-sm text-slate-600">Subtract mean from each reading and square.</p>,
        },
        {
          label: 'Standard deviation',
          latex: String.raw`s = \sqrt{\frac{0.172}{4}} = \sqrt{0.043} \approx 0.21°`,
          explanation: <p className="text-sm text-slate-600">Divide by n − 1 = 4, then take the square root.</p>,
        },
      ],
      answer: (
        <p className="text-sm">
          Mean: <strong>90.06°</strong>, std dev: <strong>±0.21°</strong>. A 5-sample moving
          average would report ~90.06° and reduce the noise — useful if your heading updates
          faster than your control loop needs. For odometry, most teams trust the gyro reading
          directly (it's already good) but filter velocity estimates.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Mean',         latex: String.raw`\bar{x} = \frac{1}{n}\sum x_i` },
        { label: 'Std dev',      latex: String.raw`s = \sqrt{\frac{\sum(x_i - \bar{x})^2}{n-1}}` },
        { label: 'Moving avg',   latex: String.raw`\bar{x}_t = \frac{1}{N}\sum_{k=0}^{N-1}x_{t-k}` },
        { label: 'Kalman gain',  latex: String.raw`K = P / (P + R)` },
        { label: 'Kalman update', latex: String.raw`\hat{x}_{new} = \hat{x} + K(z - \hat{x})` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'Team A scores an average of 15 game pieces per match with standard deviation σ = 1. Team B averages 17 with σ = 9. In a high-stakes elimination match, which team is likely more valuable as an alliance partner?',
          options: [
            'Team B — higher average always wins',
            'Team A — lower standard deviation means more predictable, consistent performance',
            'It depends only on their ranking points, not these stats',
            'They are equivalent because the averages are close',
          ],
          correctIndex: 1,
          explanation: 'Team A\'s low σ = 1 means you can count on 14–16 pieces. Team B\'s σ = 9 means output ranges widely from 8 to 26. In eliminations, consistency reduces risk. Both average AND std dev matter for alliance selection.',
        },
        {
          question: 'Five encoder readings (in ticks) are: 1001, 999, 1002, 998, 1000. What is the sample mean?',
          options: ['999', '1000', '1001', '1002'],
          correctIndex: 1,
          explanation: 'Mean = (1001 + 999 + 1002 + 998 + 1000) / 5 = 5000 / 5 = 1000. The readings are centered on the true value — this illustrates how averaging reduces random noise.',
        },
        {
          question: 'A moving average filter with N = 10 vs N = 3 is applied to a jittery velocity sensor. Which statement is correct?',
          options: [
            'N = 10 responds faster to real velocity changes but has more noise',
            'N = 3 responds faster to real velocity changes but has more noise',
            'Both filters have identical noise rejection',
            'N = 10 always produces a more accurate reading regardless of how fast velocity changes',
          ],
          correctIndex: 1,
          explanation: 'A larger N averages more samples, which rejects more noise but introduces more lag. N = 3 is noisier but reacts faster to actual changes. The tradeoff is noise vs. responsiveness.',
        },
        {
          question: 'In the Kalman gain formula K = P / (P + R), what happens when the sensor measurement noise R is very large?',
          options: [
            'K approaches 1 and the estimate jumps to the measurement',
            'K approaches 0 and the estimate relies mostly on the model prediction',
            'K becomes negative and the estimate moves away from the measurement',
            'K equals 0.5 and the estimate is exactly halfway between prediction and measurement',
          ],
          correctIndex: 1,
          explanation: 'When R >> P, K = P/(P + R) ≈ P/R ≈ 0. The update x_new = x + K(z - x) barely moves toward the measurement — we don\'t trust the noisy sensor. The model prediction dominates.',
        },
      ],
    },
  ],
};
