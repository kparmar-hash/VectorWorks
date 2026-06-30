import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson04: Lesson = {
  id: 'sensor-math',
  title: 'Sensor Math',
  subtitle: 'Encoders, gyroscopes, and filters — converting raw hardware readings into reliable control inputs.',
  order: 4,
  estimatedMinutes: 25,
  tags: ['encoder', 'gyro', 'sensor', 'filter', 'unit-conversion', 'odometry'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Sensors are how your robot knows where it is and how fast it's moving. But raw sensor
            outputs aren't immediately useful — encoders return integer tick counts, gyroscopes
            return angular velocity in degrees per second, and accelerometers return noisy
            gravitational fractions. Getting these into meters, radians per second, or filtered
            heading values requires a chain of unit conversions and signal processing that must be
            exact. A factor-of-two error in your encoder scaling puts your odometry off by a factor
            of two, and your trajectory follower drives into the wall.
          </p>
          <p>
            This lesson covers the three sensor types that appear in every FRC robot — encoders,
            gyroscopes, and IMUs — plus the two filters you need to handle sensor noise without
            introducing dangerous lag into your control loops.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Every odometry system starts with these conversions',
      content: (
        <p>
          WPILib's <code>DifferentialDriveOdometry</code>, <code>SwerveDriveOdometry</code>, and{' '}
          <code>SwerveDrivePoseEstimator</code> all call your encoder and gyro reading methods on
          every loop cycle. If your conversion factor is wrong, the odometry pose diverges from
          reality and PathPlanner trajectories will be systematically off by the same factor. Get
          the math right once in your constants file and every subsystem that uses odometry benefits.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Encoders — ticks to meaningful units
          </h3>
          <p>
            An encoder reports an integer tick count that increases (or decreases) as the shaft
            rotates. The <strong>counts per revolution (CPR)</strong> is the encoder's resolution —
            how many ticks per full shaft rotation. Common values in FRC:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>2048 CPR</strong> — Falcon 500 / Kraken X60 integrated encoder</li>
            <li><strong>4096 CPR</strong> — REV Through-Bore Encoder</li>
            <li><strong>8192 CPR</strong> — CTRE CANcoder (12-bit absolute)</li>
          </ul>
          <p>
            The conversion chain from raw ticks to meters is:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Divide ticks by CPR → motor shaft rotations</li>
            <li>Divide by gear ratio → mechanism output rotations</li>
            <li>Multiply by <M tex="2\pi r" /> → linear distance in meters</li>
          </ol>
          <p>
            For angular mechanisms (arms, wrists), replace <M tex="2\pi r" /> with <M tex="2\pi" />{' '}
            for radians or <M tex="360" /> for degrees.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Encoder Position (ticks → meters)',
      latex: String.raw`x = \frac{\text{ticks}}{CPR \times GR} \times 2\pi r`,
      variables: [
        { symbol: '\\text{ticks}', meaning: 'Raw encoder count (integer)',            unit: 'counts' },
        { symbol: 'CPR',           meaning: 'Counts per revolution (encoder resolution)', unit: 'counts/rev' },
        { symbol: 'GR',            meaning: 'Gear ratio (motor:output)',               unit: '—' },
        { symbol: 'r',             meaning: 'Wheel or pulley radius',                  unit: 'm' },
        { symbol: 'x',             meaning: 'Linear position',                         unit: 'm' },
      ],
      explanation:
        'Dividing by CPR×GR converts ticks to output-shaft rotations. Multiplying by 2πr converts rotations to arc length. For WPILib motor controllers that report position in rotations (Phoenix 6, REV SparkMax), skip the CPR division and only divide by GR.',
    },

    {
      type: 'formula',
      label: 'Encoder Velocity (ticks/s → m/s)',
      latex: String.raw`v = \frac{\Delta\text{ticks} / \Delta t}{CPR \times GR} \times 2\pi r`,
      variables: [
        { symbol: '\\Delta\\text{ticks}', meaning: 'Change in tick count over one loop',  unit: 'counts' },
        { symbol: '\\Delta t',            meaning: 'Loop period',                          unit: 's' },
        { symbol: 'CPR',                  meaning: 'Counts per revolution',                unit: 'counts/rev' },
        { symbol: 'GR',                   meaning: 'Gear ratio',                           unit: '—' },
        { symbol: 'r',                    meaning: 'Wheel radius',                         unit: 'm' },
        { symbol: 'v',                    meaning: 'Wheel surface speed',                  unit: 'm/s' },
      ],
      explanation:
        'Δticks/Δt is the tick rate from two successive readings. Dividing by CPR×GR gives output-shaft rev/s; multiplying by 2πr gives m/s. Example: Falcon 500 (2048 CPR), GR=6.75 (SDS MK4i L2), r=0.0508 m → scale factor = 2π×0.0508/(2048×6.75) ≈ 2.31×10⁻⁵ m/tick.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Relative vs. absolute encoders',
      content: (
        <p>
          <strong>Relative (quadrature) encoders</strong> count from zero at power-on. They lose
          position on power cycle and require a homing routine or hard-stop calibration to establish
          a known reference. <strong>Absolute encoders</strong> (CANcoder, REV Through-Bore in
          absolute mode) report the true shaft angle regardless of power cycle, making them ideal
          for arm and wrist mechanisms that cannot safely home every match. Always store your encoder
          offsets so the absolute reading maps correctly to your mechanism's zero position.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Gyroscopes — heading, drift, and wrap
          </h3>
          <p>
            A gyroscope measures <strong>angular velocity</strong> <M tex="\omega" /> (deg/s or
            rad/s) about one or more axes. Integrating <M tex="\omega" /> over time yields a
            heading estimate. In FRC the relevant axes are:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Yaw</strong> — rotation about the vertical axis (most common in FRC: robot turning)</li>
            <li><strong>Pitch</strong> — tilting forward/back (climbing a ramp)</li>
            <li><strong>Roll</strong> — leaning left/right</li>
          </ul>
          <p>
            Because integration accumulates small measurement errors over time, all gyros{' '}
            <strong>drift</strong>. A high-quality IMU (NavX2, Pigeon 2) drifts less than 1°/minute
            under normal robot operation. Over a 2m 30s match that's under 2.5° of drift — acceptable
            for most use cases. Low-cost gyros (cheap MPU-6050 modules) can drift 10–30°/min and are
            unreliable for autonomous heading hold.
          </p>
          <p>
            <strong>Heading wrap:</strong> Headings must stay in a consistent range — either{' '}
            [−180°, +180°] or [0°, 360°). When a heading crosses ±180°, it wraps around. If you
            compute a heading error without wrapping first, the PID controller sees a 359° error
            instead of a −1° error and commands a full rotation the wrong way. Always wrap heading
            errors before feeding them to a controller.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Heading Integration',
      latex: String.raw`\theta[k] = \theta[k-1] + \omega[k] \cdot \Delta t`,
      variables: [
        { symbol: '\\theta[k]',   meaning: 'Heading at loop step k',            unit: 'deg or rad' },
        { symbol: '\\theta[k-1]', meaning: 'Heading at previous loop step',     unit: 'deg or rad' },
        { symbol: '\\omega[k]',   meaning: 'Angular velocity at step k',        unit: 'deg/s or rad/s' },
        { symbol: '\\Delta t',    meaning: 'Loop period',                       unit: 's' },
      ],
      explanation:
        'This is Euler integration. High-quality IMUs (NavX, Pigeon 2) perform this internally at >1 kHz using hardware fusion; call getAngle() to read the result. Never manually integrate raw gyro readings in robot code — the IMU\'s internal integration is far more accurate than anything you can do at 50 Hz.',
    },

    {
      type: 'formula',
      label: 'Heading Wrap to [−180°, +180°]',
      latex: String.raw`\theta_{wrapped} = \operatorname{atan2}(\sin\theta,\, \cos\theta)`,
      variables: [
        { symbol: '\\theta_{wrapped}', meaning: 'Heading in [−180°, +180°] (or [−π, π] in rad)', unit: 'deg or rad' },
        { symbol: '\\theta',           meaning: 'Raw heading (possibly outside [−180°, +180°])',   unit: 'deg or rad' },
      ],
      explanation:
        'Converting to a unit vector (sin θ, cos θ) and back via atan2 eliminates the discontinuity at ±180°. Equivalent for degrees: θ_wrapped = ((θ + 180) mod 360) − 180. Always apply this before subtracting setpoint from measurement to compute a heading error.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Filtering — smoothing noise without crippling response
          </h3>
          <p>
            Raw sensor readings contain noise: encoder quantization jumps between adjacent tick
            values, gyro readings have thermal noise, and accelerometers pick up every vibration
            from motors, belts, and field contact. Feeding noisy signals directly into a PID
            derivative term amplifies the noise by a factor of <M tex="1/\Delta t" /> — at 50 Hz
            that's a 50× amplification of every tick of encoder noise. Three practical filters
            address this in FRC:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Low-pass (exponential moving average):</strong> weights the current reading
              against the previous output. Simple, one line of code, trades off smoothing against
              lag via a single parameter α.
            </li>
            <li>
              <strong>Moving average:</strong> averages the last N readings. Constant lag of N/2
              loop cycles, uniform frequency response across the window.
            </li>
            <li>
              <strong>Complementary filter:</strong> fuses two sensors with complementary error
              profiles — typically gyro (accurate short-term, drifts long-term) plus accelerometer
              (noisy short-term, stable long-term reference).
            </li>
          </ul>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Low-Pass Filter (Exponential Moving Average)',
      latex: String.raw`y[k] = \alpha \cdot x[k] + (1 - \alpha) \cdot y[k-1]`,
      variables: [
        { symbol: 'y[k]',   meaning: 'Filtered output at step k',          unit: 'same as sensor' },
        { symbol: 'x[k]',   meaning: 'Raw sensor reading at step k',        unit: 'same as sensor' },
        { symbol: 'y[k-1]', meaning: 'Previous filtered output',            unit: 'same as sensor' },
        { symbol: '\\alpha', meaning: 'Smoothing factor (0 < α < 1)',       unit: '—' },
      ],
      explanation:
        'α close to 1 → minimal filtering, fast response (follows noise). α close to 0 → heavy smoothing, large lag. Lag time constant: τ ≈ dt/α. At 50 Hz with α=0.2: τ = 0.02/0.2 = 0.1 s. For FRC velocity D-terms, use α = 0.3–0.5 to balance noise and response. WPILib\'s LinearFilter.singlePoleIIR() implements this.',
    },

    {
      type: 'formula',
      label: 'Complementary Filter (Tilt / Heading)',
      latex: String.raw`\theta[k] = \alpha\bigl(\theta[k-1] + \omega \cdot \Delta t\bigr) + (1-\alpha)\,\theta_{accel}`,
      variables: [
        { symbol: '\\theta[k]',       meaning: 'Fused angle estimate at step k',              unit: 'deg or rad' },
        { symbol: '\\omega',          meaning: 'Gyro angular rate',                           unit: 'deg/s' },
        { symbol: '\\Delta t',        meaning: 'Loop period',                                 unit: 's' },
        { symbol: '\\theta_{accel}',  meaning: 'Angle derived from accelerometer',            unit: 'deg' },
        { symbol: '\\alpha',          meaning: 'Gyro trust weight (typically 0.96–0.98)',      unit: '—' },
      ],
      explanation:
        'α=0.98 means 98% of the output comes from gyro short-term integration; 2% from the accelerometer\'s absolute tilt reference. The gyro is accurate over milliseconds but drifts over minutes. The accelerometer is stable long-term but noisy from vibration. The complementary filter gets accurate short-term response and long-term stability from a single expression.',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Filter lag reduces PID phase margin',
      content: (
        <p>
          Every low-pass filter adds a time delay of approximately <M tex="\tau \approx \Delta t / \alpha" />.
          At 50 Hz with α = 0.1, that's 0.2 s of lag. A D term reading velocity through this
          filter receives information that is 0.2 s old — it damps based on past velocity, not
          present velocity. In a fast arm or flywheel controller, 0.2 s of lag can cause the D term
          to actively destabilize the loop. Use α ≥ 0.3 for signals going into derivative terms,
          and reserve heavy filtering (α &lt; 0.2) for display values or slow integrals.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Swerve drive module encoder → wheel velocity',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Motor: <strong>Falcon 500</strong> (2048 CPR integrated encoder).
          </p>
          <p>
            Module: <strong>SDS MK4i L2</strong> drive gear ratio = <strong>6.75:1</strong>.
          </p>
          <p>
            Wheel: <strong>4-inch diameter</strong> (radius r = 0.0508 m).
          </p>
          <p>
            Encoder counted <strong>4096 ticks</strong> over the last <strong>20 ms</strong> loop.
          </p>
          <p className="text-slate-500">Find wheel velocity in m/s and ft/s.</p>
        </div>
      ),
      steps: [
        {
          label: 'Tick rate',
          latex: String.raw`\dot{\text{ticks}} = \frac{\Delta\text{ticks}}{\Delta t} = \frac{4096}{0.020} = 204{,}800 \text{ ticks/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dividing the tick count by the 20 ms loop period gives the tick rate in ticks per second.
            </p>
          ),
        },
        {
          label: 'Motor rotations per second',
          latex: String.raw`n_{motor} = \frac{204{,}800}{2048} = 100 \text{ rev/s} \quad (6000 \text{ RPM})`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dividing by CPR converts tick rate to motor shaft rotations per second. 100 rev/s = 6000 RPM,
              which is the Falcon 500's approximate free speed — this module is running near full speed.
            </p>
          ),
        },
        {
          label: 'Wheel rotations per second (through gear ratio)',
          latex: String.raw`n_{wheel} = \frac{n_{motor}}{GR} = \frac{100}{6.75} = 14.81 \text{ rev/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The 6.75:1 reduction slows the wheel to 14.81 rev/s — the output-shaft rotational rate.
            </p>
          ),
        },
        {
          label: 'Wheel surface speed',
          latex: String.raw`v = n_{wheel} \times 2\pi r = 14.81 \times 2\pi \times 0.0508 \approx 4.73 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Multiplying by circumference (2πr) converts rotational speed to linear surface speed.
            </p>
          ),
        },
        {
          label: 'Convert to ft/s',
          latex: String.raw`v = \frac{4.73}{0.3048} \approx 15.5 \text{ ft/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              15.5 ft/s is near the theoretical top speed for a 6.75:1 MK4i module — consistent with
              near-free-speed motor operation.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Wheel velocity: <strong>≈ 4.73 m/s (15.5 ft/s)</strong>. The single conversion factor you
          would store in your constants file is{' '}
          <strong>2π × 0.0508 / (2048 × 6.75) ≈ 2.31 × 10⁻⁵ m/tick</strong>. Multiply every raw
          tick rate by this constant to get m/s instantly.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Encoder position',
          latex: String.raw`x = \frac{\text{ticks}}{CPR \times GR} \times 2\pi r`,
          note: 'ticks → rotations → meters',
        },
        {
          label: 'Encoder velocity',
          latex: String.raw`v = \frac{\Delta\text{ticks}/\Delta t}{CPR \times GR} \times 2\pi r`,
          note: 'tick rate → m/s',
        },
        {
          label: 'Heading integration',
          latex: String.raw`\theta[k] = \theta[k-1] + \omega \cdot \Delta t`,
          note: 'IMU does this at >1 kHz internally',
        },
        {
          label: 'Heading wrap',
          latex: String.raw`\theta_{wrap} = \text{atan2}(\sin\theta,\cos\theta)`,
          note: 'Always wrap before computing error',
        },
        {
          label: 'Low-pass filter',
          latex: String.raw`y[k] = \alpha x[k] + (1-\alpha)\,y[k-1]`,
          note: 'Lag τ ≈ Δt/α; use α ≥ 0.3 for D-terms',
        },
        {
          label: 'Complementary filter',
          latex: String.raw`\theta = \alpha(\theta + \omega\Delta t) + (1-\alpha)\,\theta_{accel}`,
          note: 'α ≈ 0.98 (gyro dominant)',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A Falcon 500 encoder reads 10240 ticks. The gear ratio is 5:1 and the wheel radius is 0.05 m. What is the wheel\'s linear position?',
          options: ['~3.14 m', '~0.31 m', '~6.28 m', '~0.063 m'],
          correctIndex: 1,
          explanation: 'x = ticks/(CPR×GR) × 2πr = 10240/(2048×5) × 2π×0.05 = 1.0 rotation × 0.3142 m = 0.314 m ≈ 0.31 m. The wheel made exactly one full rotation (10240 = 2048×5), so the position equals one circumference.',
        },
        {
          question: 'A heading PID receives an error of −200°. Why is this a problem, and how do you fix it?',
          options: [
            'The gyro is malfunctioning — recalibrate it',
            'The robot turns 200° the wrong way instead of 160° the short way; wrap the error to [−180°, +180°] first',
            'Negative heading errors are unsupported in WPILib',
            'Multiply the error by −1 before feeding it to the PID',
          ],
          correctIndex: 1,
          explanation: 'An error of −200° tells the PID to drive 200° in one direction, but the correct move is +160° in the other direction (the short way around). Wrapping: −200° + 360° = +160°. Always wrap heading error = atan2(sin(setpoint−measurement), cos(setpoint−measurement)) before the PID uses it.',
        },
        {
          question: 'A low-pass filter with α = 0.05 is used on encoder velocity at 50 Hz (Δt = 0.02 s). What is the approximate lag time constant?',
          options: ['0.02 s (one loop)', '0.4 s', '0.1 s', '5 s'],
          correctIndex: 1,
          explanation: 'Lag τ ≈ Δt/α = 0.02/0.05 = 0.4 s. A 0.4-second delay means the D term is reacting to velocity from almost half a second ago. For fast arm or flywheel controllers this is enough to cause instability. Use α = 0.3–0.5 for signals entering derivative terms.',
        },
        {
          question: 'A complementary filter uses α = 0.98 to fuse gyro and accelerometer readings. What does the (1−α) = 0.02 weight represent?',
          options: [
            'The fraction of output that comes from the gyro each step',
            'The long-term correction from the accelerometer that prevents gyro drift from accumulating',
            'The proportional gain applied to the sensor fusion output',
            'The loop sample period in seconds',
          ],
          correctIndex: 1,
          explanation: '(1−α) = 0.02 is the weight given to the accelerometer\'s absolute tilt estimate. The accelerometer is noisy over short times but provides a stable reference that corrects for gyro drift over the long term. The 98/2 split gives fast gyro-based response with slow drift correction from the accelerometer.',
        },
      ],
    },
  ],
};
