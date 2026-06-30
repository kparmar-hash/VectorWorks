import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson04: Lesson = {
  id: 'coordinate-systems',
  title: 'Coordinate Systems & Robot Pose',
  subtitle: 'Autonomous navigation is impossible if you disagree on where (0, 0) is.',
  order: 4,
  estimatedMinutes: 20,
  tags: ['coordinates', 'odometry', 'pose', 'autonomous', 'wpilib'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            A robot that does not know where it is cannot run autonomous reliably. Pose estimation
            — tracking position and heading — is the foundation of everything from simple auto
            routines to PathPlanner trajectories. All of it rests on having a clear, consistent
            coordinate system that your code, your field measurements, and your team all agree on.
          </p>
          <p>
            WPILib defines this for you. Understanding the convention means you can reason about
            pose math instead of guessing why your robot drives the wrong direction.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'WPILib field coordinate convention',
      content: (
        <ul className="space-y-1 text-sm list-disc list-inside">
          <li><strong>Origin (0, 0):</strong> Blue alliance right corner (driver-right, field-level)</li>
          <li><strong>+X:</strong> Toward the red alliance wall (down-field)</li>
          <li><strong>+Y:</strong> Toward the left side of the field (from blue driver perspective)</li>
          <li><strong>+θ (heading):</strong> Counter-clockwise from +X axis</li>
          <li>All units in <strong>meters</strong>. Always.</li>
        </ul>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Robot pose</h3>
          <p>
            Pose is the complete description of where the robot is and which way it faces. In 2D it
            is three numbers: <M tex="(x, y, \theta)" />.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Robot pose',
      latex: String.raw`\text{Pose} = \begin{pmatrix} x \\ y \\ \theta \end{pmatrix} \qquad x,y \in \mathbb{R}\text{ (m)},\quad \theta \in [-\pi, \pi]\text{ (rad)}`,
      explanation: 'WPILib\'s Pose2d class stores exactly this. Rotation2d wraps θ and handles angle arithmetic so you never deal with ±π wrap-around bugs manually.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Odometry: dead reckoning from encoders</h3>
          <p>
            Odometry estimates pose by integrating wheel encoder data. Each encoder tick represents
            a known arc length; sum the left and right arcs to get a change in x, y, and θ.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Differential drive odometry (one time step)',
      latex: String.raw`\Delta x = d_{avg} \cos\theta \qquad \Delta y = d_{avg} \sin\theta \qquad \Delta\theta = \frac{d_R - d_L}{W}`,
      variables: [
        { symbol: 'd_{avg}',  meaning: '(d_L + d_R) / 2 — average wheel travel', unit: 'm' },
        { symbol: 'd_L, d_R', meaning: 'Left and right wheel arc distances',       unit: 'm' },
        { symbol: 'W',        meaning: 'Track width (center-to-center)',            unit: 'm' },
        { symbol: '\\theta',  meaning: 'Current heading before this step',          unit: 'rad' },
      ],
      explanation:
        'In practice, WPILib\'s DifferentialDriveOdometry handles this every loop cycle. But knowing the math helps you debug why pose drifts.',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Odometry drifts — pair it with a gyro or vision',
      content: (
        <p>
          Dead reckoning accumulates error every loop. Wheel slip, measurement noise, and uneven
          carpet all add up. Use a gyro (NavX, Pigeon 2) for heading and AprilTag vision for
          periodic position resets. WPILib's <code>PoseEstimator</code> classes fuse all three with
          a Kalman filter.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Position after a curved path',
      problem: (
        <div className="text-sm space-y-1">
          <p>
            Robot starts at <M tex="(0, 0, 0°)" />. Left wheel travels <strong>0.8 m</strong>,
            right wheel travels <strong>1.2 m</strong>, track width is <strong>0.6 m</strong>.
            What is the new pose?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Find heading change',
          latex: String.raw`\Delta\theta = \frac{d_R - d_L}{W} = \frac{1.2 - 0.8}{0.6} = \frac{0.4}{0.6} = 0.667 \text{ rad} \approx 38.2°`,
          explanation: (
            <p className="text-sm text-slate-600">
              The right wheel traveled farther, so the robot turned left (CCW = positive θ).
            </p>
          ),
        },
        {
          label: 'Average distance and heading at midpoint',
          latex: String.raw`d_{avg} = \frac{0.8 + 1.2}{2} = 1.0 \text{ m} \qquad \theta_{mid} = 0 + \frac{0.667}{2} = 0.333 \text{ rad}`,
          explanation: (
            <p className="text-sm text-slate-600">
              Using the midpoint heading gives a better approximation of the arc direction.
            </p>
          ),
        },
        {
          label: 'New position',
          latex: String.raw`x' = 1.0 \cos(0.333) = 0.945 \text{ m} \qquad y' = 1.0 \sin(0.333) = 0.327 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600">cos(0.333) ≈ 0.945, sin(0.333) ≈ 0.327.</p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          New pose: <strong>(0.945 m, 0.327 m, 38.2°)</strong>. The robot curved left while moving
          down-field.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'WPILib origin', latex: String.raw`(0,0) = \text{blue alliance, driver-right corner}` },
        { label: 'Pose',         latex: String.raw`(x,\, y,\, \theta)\ \text{— meters, radians}` },
        { label: 'Odometry Δθ',  latex: String.raw`\Delta\theta = (d_R - d_L) / W` },
        { label: 'Odometry Δx',  latex: String.raw`\Delta x = d_{avg} \cos\theta` },
        { label: 'Odometry Δy',  latex: String.raw`\Delta y = d_{avg} \sin\theta` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'In WPILib\'s field coordinate system, where is the origin (0, 0)?',
          options: [
            'Center of the field',
            'Blue alliance right corner (driver-right, field-level)',
            'Red alliance right corner (driver-right, field-level)',
            'Blue alliance left corner (driver-left, field-level)',
          ],
          correctIndex: 1,
          explanation: 'WPILib places the origin at the blue alliance right corner from the driver\'s perspective. +X points toward the red alliance wall and +Y points left from the blue driver station.',
        },
        {
          question: 'A differential drive robot\'s left wheel travels 1.0 m and right wheel travels 1.4 m. Track width is 0.5 m. What is the change in heading?',
          options: ['0.4 rad', '0.8 rad', '2.4 rad', '0.2 rad'],
          correctIndex: 1,
          explanation: 'Δθ = (d_R - d_L) / W = (1.4 - 1.0) / 0.5 = 0.4 / 0.5 = 0.8 rad ≈ 45.8°. The right wheel traveled farther, so the robot turned left (positive = counter-clockwise).',
        },
        {
          question: 'Why does odometry drift over time, even with accurate encoders?',
          options: [
            'Encoders count in integers and lose fractional ticks',
            'Wheel slip, measurement noise, and carpet irregularities accumulate error each loop',
            'The field coordinate system uses a different unit than meters',
            'WPILib\'s odometry math uses an approximation that loses accuracy',
          ],
          correctIndex: 1,
          explanation: 'Odometry is dead reckoning — it integrates small errors every loop. Even tiny heading errors compound into large position errors over distance. This is why teams fuse odometry with gyros and vision.',
        },
        {
          question: 'Robot pose is stored as (x, y, θ). What does θ represent?',
          options: [
            'The angle the robot has turned since it was enabled',
            'The robot\'s heading relative to the +x axis of the field coordinate system',
            'The angle between the robot\'s drive direction and its facing direction',
            'The robot\'s tilt angle (pitch) relative to the floor',
          ],
          correctIndex: 1,
          explanation: 'θ is the robot\'s absolute heading in field coordinates — the angle its forward direction makes with the +x axis (toward the red alliance wall). It is NOT a cumulative turn count.',
        },
      ],
    },
  ],
};
