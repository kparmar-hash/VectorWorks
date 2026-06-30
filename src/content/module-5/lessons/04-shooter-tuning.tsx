import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson04: Lesson = {
  id: 'shooter-tuning',
  title: 'Practical Shooter Tuning',
  subtitle: 'Interpolation tables, vision feedback, and the math behind ready-to-shoot checks.',
  order: 4,
  estimatedMinutes: 20,
  tags: ['tuning', 'interpolation', 'lookup-table', 'shooter'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            The physics formula tells you where to start. The data tells you where to end up.
            Real shooters have unknowns that the ideal model ignores: ball deformation varies
            between balls of the same nominal size, wheels wear down during a match, air resistance
            adds up over long shots, and the compression factor shifts with hood gap tolerance.
          </p>
          <p>
            The professional approach is to combine both: use physics to get within 10% of the
            right RPM, then characterize the shooter empirically at 5–8 known distances, build
            an interpolation table, and let vision handle everything in between. This lesson
            covers the math that makes this workflow precise.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Physics gets you 80% there',
      content: (
        <p>
          At competitions, you don't have unlimited time to characterize your shooter. Teams that
          understand the physics can calculate a rough RPM table in 30 minutes, then spend the
          remaining practice time measuring the correction factor instead of starting from scratch.
          The table from the last lesson is your starting point — this lesson is the correction.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Building the lookup table</h3>
          <p>
            Set up targets at 4–8 known distances from the robot. For each distance:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Calculate the physics-predicted RPM from the previous lesson</li>
            <li>Set that RPM and shoot 5 balls</li>
            <li>Measure where they land relative to target center</li>
            <li>Adjust RPM until consistent hits, record the actual RPM</li>
            <li>Note the correction factor: <M tex="\eta_{actual} = RPM_{physics} / RPM_{measured}" /></li>
          </ol>
          <p>
            Once you have measured RPMs at 4+ distances, you can interpolate to any distance in
            between using linear interpolation.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Linear Interpolation',
      latex: String.raw`y = y_1 + \frac{(y_2 - y_1)(x - x_1)}{x_2 - x_1}`,
      variables: [
        { symbol: 'y', meaning: 'Interpolated RPM at distance x',  unit: 'RPM' },
        { symbol: 'x', meaning: 'Robot distance to target',         unit: 'm' },
        { symbol: 'x_1, x_2', meaning: 'Nearest measured distances below/above x', unit: 'm' },
        { symbol: 'y_1, y_2', meaning: 'Measured RPMs at x₁ and x₂',              unit: 'RPM' },
      ],
      explanation:
        'This assumes RPM changes linearly between the two nearest data points. For better accuracy, use more data points (quadratic interpolation) or spline fits — but linear is usually sufficient.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ready-to-shoot check</h3>
          <p>
            Before firing, you need to verify the flywheel is at the target speed. Check the
            percent difference between actual and target RPM. Fire only when within tolerance:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Velocity Tolerance Check',
      latex: String.raw`\text{ready} = \left|\frac{N_{actual} - N_{target}}{N_{target}}\right| < \epsilon`,
      variables: [
        { symbol: 'N_{actual}',  meaning: 'Current measured flywheel RPM', unit: 'RPM' },
        { symbol: 'N_{target}',  meaning: 'Required RPM from table',        unit: 'RPM' },
        { symbol: '\\varepsilon', meaning: 'Tolerance (typically 0.02–0.05)', unit: '—' },
      ],
      explanation:
        'A 2–5% tolerance is typical. At 4000 RPM target, 2% tolerance = ±80 RPM window. Tighter tolerances improve accuracy but increase shot delay. Tune ε against your actual shot variance.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Auto: shoot from fixed positions',
      content: (
        <p>
          In autonomous, always shoot from a pre-planned, odometry-verified position. That lets you
          use a single known-good RPM value with no interpolation, no vision latency, and no
          uncertainty about distance. Save the interpolation table for teleop, where the robot can
          be anywhere on the field.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vision-aided distance measurement</h3>
          <p>
            With a camera targeting retroreflective tape or AprilTags, you can measure distance
            without driving to a known position. The relationship between target apparent height in
            the image and real distance:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Distance from Vision',
      latex: String.raw`d = \frac{(h_{target} - h_{camera}) \times f_y}{\Delta y_{pixels}}`,
      variables: [
        { symbol: 'd',              meaning: 'Distance to target',           unit: 'm' },
        { symbol: 'h_{target}',     meaning: 'Height of target center',      unit: 'm' },
        { symbol: 'h_{camera}',     meaning: 'Height of camera center',      unit: 'm' },
        { symbol: 'f_y',            meaning: 'Camera focal length (pixels)',  unit: 'px' },
        { symbol: '\\Delta y_{pixels}', meaning: 'Vertical pixel offset of target center', unit: 'px' },
      ],
      explanation:
        'This is the pinhole camera model for vertical distance. Many teams use PhotonVision or Limelight, which compute this internally — understanding the formula helps debug incorrect distance reads.',
    },

    {
      type: 'worked-example',
      title: 'Interpolating RPM for a robot at 3.2 m',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Your measured table has two data points: at <strong>2.0 m</strong>, the correct RPM is{' '}
            <strong>3,400</strong>; at <strong>4.0 m</strong>, it is <strong>4,800</strong>. The
            robot is at <strong>3.2 m</strong>.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            What RPM should the shooter target? Is it ready to fire if it's currently at 4,050 RPM
            with a 3% tolerance?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Identify bracketing data points',
          latex: String.raw`x_1 = 2.0 \text{ m},\ y_1 = 3400 \text{ RPM}, \quad x_2 = 4.0 \text{ m},\ y_2 = 4800 \text{ RPM}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The robot at 3.2 m sits between the 2 m and 4 m data points.
            </p>
          ),
        },
        {
          label: 'Apply linear interpolation',
          latex: String.raw`y = 3400 + \frac{(4800 - 3400)(3.2 - 2.0)}{4.0 - 2.0} = 3400 + \frac{1400 \times 1.2}{2.0}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The fraction (3.2 − 2.0) / (4.0 − 2.0) = 1.2/2.0 = 0.6 tells us we're 60% of the
              way between the two points.
            </p>
          ),
        },
        {
          label: 'Evaluate',
          latex: String.raw`y = 3400 + 1400 \times 0.6 = 3400 + 840 = 4240 \text{ RPM}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Target RPM at 3.2 m: <strong>4,240 RPM</strong>.
            </p>
          ),
        },
        {
          label: 'Ready-to-fire check',
          latex: String.raw`\left|\frac{4050 - 4240}{4240}\right| = \frac{190}{4240} = 0.0448 = 4.48\% > 3\%`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At 4,050 RPM with a 3% tolerance, the shooter is NOT ready — it's 4.5% off. Wait for
              the flywheel to spin up to within 127 RPM of 4,240 (= 3% × 4,240).
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Target RPM: <strong>4,240</strong>. Current at 4,050 is 4.5% off — <strong>not ready</strong>{' '}
          at 3% tolerance. Wait for flywheel to reach ~4,113 RPM or above.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'Shooting on the move',
      content: (
        <p>
          Advanced teams compensate for robot velocity during the shot. If the robot is moving
          sideways at <M tex="v_r" />, the ball's horizontal velocity adds vectorially to the exit
          velocity. Aim offset = <M tex="\arctan(v_r / v_{exit,x})" />. Most FRC scoring is done
          while stationary — this is a tiebreaker optimization, not a priority for most teams.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Linear interpolation',
          latex: String.raw`y = y_1 + \dfrac{(y_2-y_1)(x-x_1)}{x_2-x_1}`,
        },
        {
          label: 'Ready check',
          latex: String.raw`\left|\dfrac{N_{actual}-N_{target}}{N_{target}}\right| < \varepsilon`,
          note: 'ε = 0.02–0.05 typical',
        },
        {
          label: 'Tolerance window',
          latex: String.raw`\Delta N_{max} = \varepsilon \times N_{target}`,
        },
        {
          label: 'Vision distance',
          latex: String.raw`d = \dfrac{(h_t - h_c) \cdot f_y}{\Delta y_{px}}`,
          note: 'Pinhole camera model',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'At 1.5 m: 3000 RPM. At 3.5 m: 5000 RPM. Robot is at 2.5 m. What is the interpolated target RPM?',
          options: ['3500 RPM', '4000 RPM', '4500 RPM', '5000 RPM'],
          correctIndex: 1,
          explanation: 'x is midway between 1.5 m and 3.5 m (fraction = (2.5-1.5)/(3.5-1.5) = 1/2). y = 3000 + (5000-3000) × 0.5 = 3000 + 1000 = 4000 RPM.',
        },
        {
          question: 'Your target RPM is 4000 and the flywheel reads 3880. With a 3% tolerance, is the shooter ready?',
          options: [
            'Yes — 3880 is within 3% of 4000',
            'No — 3880 is exactly 3% off, which does not satisfy strict less-than',
            'Yes — any reading above 3500 RPM is acceptable',
            'No — 3880 is 3.0% off, which exceeds the 3% tolerance',
          ],
          correctIndex: 3,
          explanation: '|3880-4000|/4000 = 120/4000 = 3.0%. At exactly 3%, the |diff/target| < 0.03 check fails (not strictly less than). The shooter is not ready.',
        },
        {
          question: 'Why should autonomous shooting be done from fixed, pre-planned positions rather than anywhere on the field?',
          options: [
            'The robot cannot move in autonomous mode',
            'Fixed positions eliminate distance uncertainty, allowing a single known-good RPM without interpolation',
            'Vision processing is unavailable during autonomous',
            'Interpolation tables are only valid for teleop distances',
          ],
          correctIndex: 1,
          explanation: 'From a known position, distance is guaranteed by odometry. You can use one pre-measured RPM with zero interpolation error and no vision latency. This is more reliable than interpolating from a vision estimate.',
        },
        {
          question: 'Why does a physics-only approach not produce the exact correct RPM for a real shooter?',
          options: [
            'The kinematic equations are approximations that only work at low velocities',
            'Ball compression factor, wheel wear, air resistance, and tolerance stack-ups introduce real-world deviations not captured by the ideal model',
            'Motors cannot maintain constant RPM, so the physics model is meaningless',
            'FRC game pieces are too unpredictable for any mathematical model',
          ],
          correctIndex: 1,
          explanation: 'The ideal model ignores real effects: compression varies between balls, wheels wear during the match, air drag adds up on long shots, and manufacturing tolerances shift the gap. Physics gets you close; empirical data closes the gap.',
        },
      ],
    },
  ],
};
