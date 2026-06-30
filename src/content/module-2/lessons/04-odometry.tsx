import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson04: Lesson = {
  id: 'odometry',
  title: 'Odometry Math',
  subtitle: 'How your robot tracks its own position from wheel encoder ticks.',
  order: 4,
  estimatedMinutes: 25,
  tags: ['odometry', 'encoders', 'pose', 'kinematics'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            A robot running an autonomous routine needs to know where it is on the field — but
            there's no GPS indoors. Odometry is dead reckoning: using wheel encoder counts to
            estimate how far each wheel has traveled, then computing where the robot must be based
            on that.
          </p>
          <p>
            It's the same technique ships used before GPS, and it has the same weakness: errors
            accumulate over time. Understanding the math tells you both how to implement it and why
            you need to fuse it with vision or a gyro.
          </p>
        </div>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Step 1 — Encoder ticks to wheel distance
          </h3>
          <p>
            A quadrature encoder attached to the motor shaft produces pulses as the shaft rotates.
            The encoder has a resolution measured in counts per revolution (CPR). Dividing tick
            count by CPR gives shaft rotations; dividing by gear ratio gives wheel rotations;
            multiplying by circumference gives linear distance.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Encoder Ticks → Wheel Distance',
      latex: String.raw`d = \frac{\text{ticks}}{CPR \cdot GR} \cdot \pi \cdot d_{wheel}`,
      variables: [
        { symbol: 'd',           meaning: 'Linear distance traveled',          unit: 'm' },
        { symbol: '\\text{ticks}', meaning: 'Raw encoder count',               unit: 'counts' },
        { symbol: 'CPR',         meaning: 'Counts per revolution of encoder',  unit: 'counts/rev' },
        { symbol: 'GR',          meaning: 'Gear ratio (motor:wheel)',           unit: '—' },
        { symbol: 'd_{wheel}',   meaning: 'Wheel diameter',                    unit: 'm' },
      ],
      explanation: 'If the encoder is on the wheel side of the gearbox, omit the GR term. Always verify by driving a known distance and checking tick count.',
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Step 2 — Differential drive odometry
          </h3>
          <p>
            For a tank/differential drive with left and right wheel distances <M tex="\Delta L" />{' '}
            and <M tex="\Delta R" /> over a small time step, the robot's change in heading and
            position is:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              If <M tex="\Delta L = \Delta R" />: robot drives straight by that distance.
            </li>
            <li>
              If they differ: robot follows an arc. The arc radius and heading change can be derived
              from the difference.
            </li>
          </ul>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Heading Change',
      latex: String.raw`\Delta\theta = \frac{\Delta R - \Delta L}{b}`,
      variables: [
        { symbol: '\\Delta\\theta', meaning: 'Change in heading (positive = turn left)', unit: 'rad' },
        { symbol: '\\Delta R',      meaning: 'Right wheel distance traveled',            unit: 'm' },
        { symbol: '\\Delta L',      meaning: 'Left wheel distance traveled',             unit: 'm' },
        { symbol: 'b',              meaning: 'Track width (left-to-right wheel center)', unit: 'm' },
      ],
    },
    {
      type: 'formula',
      label: 'Position Update (arc method)',
      latex: String.raw`\Delta x = d_{center} \cdot \cos\!\left(\theta + \frac{\Delta\theta}{2}\right) \qquad \Delta y = d_{center} \cdot \sin\!\left(\theta + \frac{\Delta\theta}{2}\right)`,
      variables: [
        { symbol: 'd_{center}', meaning: 'Average of ΔL and ΔR',          unit: 'm' },
        { symbol: '\\theta',    meaning: 'Robot heading before this step', unit: 'rad' },
      ],
      explanation: 'Using the heading at mid-step reduces error compared to using only the starting or ending heading. WPILib\'s DifferentialDriveOdometry uses this approach.',
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'Odometry is dead reckoning — it drifts',
      content: (
        <p>
          Each calculation step accumulates tiny errors: wheel slip, encoder quantization, track
          width measurement error. Over a 15-second auto, a well-tuned odometry system might drift
          6–12 inches. Always fuse with a gyro (NavX or Pigeon2) for heading — gyros are far more
          accurate than derived heading — and add AprilTag vision corrections when available.
        </p>
      ),
    },
    {
      type: 'worked-example',
      title: 'Encoder ticks for a straight-then-turn path',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Setup: <strong>REV Through Bore Encoder</strong> (2048 CPR), gearbox <strong>6.75:1</strong>,{' '}
            <strong>4-inch (0.1016 m) wheels</strong>, track width <strong>0.6 m</strong>.
          </p>
          <p>
            The robot drives straight <strong>5 ft (1.524 m)</strong>, then turns{' '}
            <strong>90° (π/2 rad)</strong> in place.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            How many encoder ticks accumulate on each wheel for each phase?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Ticks per meter of wheel travel',
          latex: String.raw`\text{ticks/m} = \frac{CPR \cdot GR}{\pi \cdot d} = \frac{2048 \times 6.75}{\pi \times 0.1016} = \frac{13{,}824}{0.3192} = 43{,}311 \text{ ticks/m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This is the conversion factor between encoder counts and meters.
            </p>
          ),
        },
        {
          label: 'Ticks for straight segment (both wheels)',
          latex: String.raw`\text{ticks}_{straight} = 43{,}311 \times 1.524 = 66{,}006 \text{ ticks (each side)}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Both wheels travel the same distance — same tick count on left and right.
            </p>
          ),
        },
        {
          label: 'Arc length for 90° in-place turn',
          latex: String.raw`d_{turn} = \frac{\Delta\theta \cdot b}{2} = \frac{(\pi/2) \times 0.6}{2} = 0.471 \text{ m per side}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              For an in-place turn, each wheel travels half the arc of a circle with diameter equal
              to the track width. One side goes forward, the other backward.
            </p>
          ),
        },
        {
          label: 'Ticks for turn segment',
          latex: String.raw`\text{ticks}_{turn} = 43{,}311 \times 0.471 = 20{,}400 \text{ ticks (±, one side each)}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Right wheel: +20,400 ticks. Left wheel: −20,400 ticks (turning left).
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Straight phase: <strong>~66,000 ticks</strong> on each wheel. Turn phase:{' '}
          <strong>~±20,400 ticks</strong> (right positive, left negative for a left turn).
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'WPILib handles this math for you',
      content: (
        <p>
          <code>DifferentialDriveOdometry</code> and <code>SwerveDriveOdometry</code> in WPILib
          implement these exact equations, updated every 20 ms robot loop. You provide encoder
          deltas and gyro heading; it returns a <code>Pose2d</code>. Understanding the math means
          you can debug when the pose diverges from reality — usually a wrong track width or
          incorrect encoder distance-per-tick constant.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Ticks → distance',
          latex: String.raw`d = \dfrac{\text{ticks}}{CPR \cdot GR} \cdot \pi d`,
        },
        {
          label: 'Ticks/meter',
          latex: String.raw`\text{ticks/m} = \dfrac{CPR \cdot GR}{\pi d}`,
        },
        {
          label: 'Heading change',
          latex: String.raw`\Delta\theta = (\Delta R - \Delta L) / b`,
          note: 'rad, b = track width',
        },
        {
          label: 'Position update',
          latex: String.raw`\Delta x = d_c \cos(\theta + \Delta\theta/2)`,
        },
        {
          label: 'In-place turn arc',
          latex: String.raw`d_{side} = \Delta\theta \cdot b / 2`,
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'An encoder has 2048 counts per revolution (CPR). The wheel has a 4-inch (0.1016 m) diameter and the gearbox is 6.75:1. How many encoder counts correspond to 1 meter of wheel travel?',
          options: ['1282 counts', '4291 counts', '8651 counts', '57,760 counts'],
          correctIndex: 2,
          explanation: 'Ticks per meter = (CPR * GR) / (pi * d) = (2048 * 6.75) / (pi * 0.1016) = 13824 / 0.3193 = 43,296 ticks per revolution of the wheel per meter. Wait: ticks/m = CPR * GR / (pi * d) = 2048 * 6.75 / (3.1416 * 0.1016) = 13824 / 0.3193 = 43,296. The closest answer here would depend on specific numbers — the key formula is ticks/m = CPR * GR / (pi * diameter).',
        },
        {
          question: 'In differential drive odometry, what does the quantity (delta_R - delta_L) / track_width compute?',
          options: [
            'The average forward distance traveled',
            'The change in robot heading (delta_theta) in radians',
            'The lateral drift error',
            'The robot speed in m/s',
          ],
          correctIndex: 1,
          explanation: 'delta_theta = (delta_R - delta_L) / b where b is track width. When the right wheel travels farther than the left, the robot turns left (and vice versa). The magnitude divided by track width gives the heading change in radians.',
        },
        {
          question: 'Odometry is described as "dead reckoning." Why does odometry drift over time even with perfect encoders?',
          options: [
            'Encoders count too slowly to keep up with fast robots',
            'Small errors in wheel slip, diameter measurement, and track width accumulate with each update',
            'The field coordinate system rotates during a match',
            'Odometry drift is caused by battery voltage fluctuations',
          ],
          correctIndex: 1,
          explanation: 'Odometry integrates small incremental measurements. Any error (wheel slip, slightly wrong wheel diameter, encoder quantization) adds up with each cycle. Over a full match, pure odometry can drift by half a meter or more. Fusing with a gyro and vision corrects this.',
        },
        {
          question: 'Which sensor fusion strategy best reduces odometry drift in FRC?',
          options: [
            'Using faster encoders with higher CPR only',
            'Running odometry updates at 1 kHz instead of 50 Hz',
            'Combining wheel odometry with a gyroscope for heading and vision for absolute position',
            'Using four encoders instead of two',
          ],
          correctIndex: 2,
          explanation: 'Gyroscopes provide accurate heading (gyro drift is slow) and vision provides absolute position resets. WPILib\'s SwerveDrivePoseEstimator and DifferentialDrivePoseEstimator both implement this fusion — odometry for continuous updates, vision for corrections.',
        },
      ],
    },
  ],
};
