import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson02: Lesson = {
  id: 'trig-linkages',
  title: 'Trigonometry & Arm Angles',
  subtitle: 'Your arm fights gravity differently at every angle. Trig tells you by how much.',
  order: 2,
  estimatedMinutes: 30,
  tags: ['trig', 'arms', 'linkages', 'torque', 'vision'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            An arm motor that can hold a game piece at 90° might stall and fail at 45°. The load
            did not change — the <em>geometry</em> did. Trigonometry lets you calculate the exact
            torque your motor must produce at every position, so you can size it correctly before
            you build anything.
          </p>
          <p>
            The same math shows up in vision targeting (what angle does the camera need to aim?),
            four-bar linkage design (where does the end effector actually go?), and swerve odometry
            (resolving velocity into field-relative components). Trig is the universal language of
            geometry on robots.
          </p>
        </div>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">SOH-CAH-TOA — the fast version</h3>
          <p>
            For a right triangle with hypotenuse <M tex="r" />, angle <M tex="\theta" /> at the
            origin, and sides opposite (<M tex="o" />) and adjacent (<M tex="a" />):
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Trig identities',
      latex: String.raw`\sin\theta = \frac{o}{r} \quad \cos\theta = \frac{a}{r} \quad \tan\theta = \frac{o}{a}`,
      explanation:
        'In robot arm math, θ is the arm angle from horizontal, r is the arm length, and the components give horizontal and vertical displacements of the end effector.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Gravity torque on an arm</h3>
          <p>
            When an arm holds a mass at its end, gravity pulls that mass straight down. The
            <em> torque</em> that gravity applies to the pivot depends on the <em>perpendicular
            distance</em> from the pivot to the line of gravity — the moment arm. That distance
            changes with angle.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Gravity torque on a horizontal arm',
      latex: String.raw`\tau_{gravity} = m \cdot g \cdot L \cdot \cos\theta`,
      variables: [
        { symbol: '\\tau_{gravity}', meaning: 'Torque from gravity at the pivot', unit: 'N·m' },
        { symbol: 'm',              meaning: 'Mass at end of arm (+ arm itself)',  unit: 'kg' },
        { symbol: 'g',              meaning: 'Gravitational acceleration',          unit: '9.81 m/s²' },
        { symbol: 'L',              meaning: 'Distance from pivot to center of mass', unit: 'm' },
        { symbol: '\\theta',        meaning: 'Arm angle measured from horizontal',  unit: 'rad or °' },
      ],
      explanation:
        'At θ = 0° (arm horizontal), cos θ = 1 — maximum gravity torque. At θ = 90° (arm straight up), cos θ = 0 — gravity torque is zero. Your motor works hardest near horizontal.',
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Why this matters for motor sizing',
      content: (
        <p>
          Size your arm motor for the <em>worst-case angle</em> — usually 0° (horizontal). If the
          motor can hold the arm at horizontal, it can hold it anywhere. Many teams discover during
          inspection or at the event that their arm stalls out at mid-range because they only tested
          at the top and bottom positions.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Arm motor torque requirement',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            An arm is <strong>0.6 m long</strong> and holds a game piece weighing{' '}
            <strong>0.5 kg</strong>. The arm itself weighs <strong>1.2 kg</strong> with its center
            of mass <strong>0.3 m</strong> from the pivot. What torque must the motor produce to
            hold the arm at <strong>30°</strong> above horizontal?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Torque from game piece',
          latex: String.raw`\tau_{piece} = 0.5 \times 9.81 \times 0.6 \times \cos(30°) = 0.5 \times 9.81 \times 0.6 \times 0.866 = 2.55 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600">
              The game piece acts at the end of the arm (L = 0.6 m). cos(30°) ≈ 0.866.
            </p>
          ),
        },
        {
          label: 'Torque from arm weight',
          latex: String.raw`\tau_{arm} = 1.2 \times 9.81 \times 0.3 \times \cos(30°) = 1.2 \times 9.81 \times 0.3 \times 0.866 = 3.06 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600">
              The arm's weight acts at its center of mass (0.3 m from pivot).
            </p>
          ),
        },
        {
          label: 'Total torque required',
          latex: String.raw`\tau_{total} = \tau_{piece} + \tau_{arm} = 2.55 + 3.06 = 5.61 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600">
              Add both contributions. Note: at 0° (horizontal) this increases to 6.48 N·m — that's
              your worst case for motor sizing.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          The motor must produce at least <strong>5.61 N·m</strong> at 30°, and{' '}
          <strong>6.48 N·m</strong> at horizontal. Size your gearbox so the motor's output torque
          (stall torque × gear ratio) comfortably exceeds 6.48 N·m with margin.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Inverse trig: finding angles</h3>
          <p>
            Sometimes you know a distance and need the angle. The inverse trig functions —
            arcsin, arccos, arctan — run the formulas backwards. In FRC, you use these constantly:
            "the target is 2.4 m away horizontally and 1.0 m above the camera — what angle do I
            aim at?"
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Vision targeting angle',
      latex: String.raw`\theta_{aim} = \arctan\!\left(\frac{\Delta h}{\Delta d}\right)`,
      variables: [
        { symbol: '\\theta_{aim}', meaning: 'Camera tilt angle needed', unit: 'rad → convert to °' },
        { symbol: '\\Delta h',     meaning: 'Height difference (target − camera)', unit: 'm' },
        { symbol: '\\Delta d',     meaning: 'Horizontal distance to target',        unit: 'm' },
      ],
      explanation:
        'arctan is atan() in Java/C++, Math.atan() in Python. Convert the result from radians to degrees by multiplying by 180/π if needed.',
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Gravity torque',      latex: String.raw`\tau = mgL\cos\theta`,            note: 'θ from horizontal' },
        { label: 'Component: horizontal', latex: String.raw`x = r\cos\theta`,              note: '' },
        { label: 'Component: vertical',   latex: String.raw`y = r\sin\theta`,              note: '' },
        { label: 'Find angle',           latex: String.raw`\theta = \arctan(y / x)`,        note: 'Use atan2(y,x) in code' },
        { label: 'Radians ↔ degrees',   latex: String.raw`\theta_{deg} = \theta_{rad} \times \frac{180}{\pi}`, note: '' },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'An arm is horizontal (0° from horizontal). How does the gravity torque at this position compare to when the arm is straight up (90°)?',
          options: [
            'Gravity torque is the same at both positions',
            'Gravity torque is maximum at 0° and zero at 90°',
            'Gravity torque is zero at 0° and maximum at 90°',
            'Gravity torque is maximum at 45°',
          ],
          correctIndex: 1,
          explanation: 'Torque = mgL × cos(θ). At θ = 0°, cos(0°) = 1 — maximum torque. At θ = 90°, cos(90°) = 0 — zero torque. The motor works hardest when the arm is horizontal.',
        },
        {
          question: 'A camera sees a target that is 2.0 m higher than the camera and 3.0 m away horizontally. What angle should the camera tilt upward?',
          options: ['33.7°', '41.8°', '56.3°', '48.2°'],
          correctIndex: 0,
          explanation: 'θ = arctan(Δh / Δd) = arctan(2.0 / 3.0) = arctan(0.667) ≈ 33.7°. Use the vision targeting formula with the vertical height difference in the numerator and horizontal distance in the denominator.',
        },
        {
          question: 'An arm is 0.8 m long with a 1.0 kg mass at its tip. At 45° above horizontal, what is the gravity torque at the pivot? (g = 9.81 m/s²)',
          options: ['7.85 N·m', '5.55 N·m', '3.92 N·m', '11.1 N·m'],
          correctIndex: 1,
          explanation: 'τ = mgL × cos(45°) = 1.0 × 9.81 × 0.8 × 0.707 = 7.848 × 0.707 ≈ 5.55 N·m. cos(45°) ≈ 0.707, not 1.0.',
        },
        {
          question: 'In robot code, why should you use atan2(y, x) instead of atan(y/x) when finding a direction angle?',
          options: [
            'atan2 is faster to compute',
            'atan2 correctly handles all four quadrants and the case when x = 0',
            'atan only works in radians, atan2 works in degrees',
            'atan2 gives the result in the range 0° to 360° instead of -180° to 180°',
          ],
          correctIndex: 1,
          explanation: 'atan(y/x) fails when x = 0 (division by zero) and returns the wrong quadrant when x < 0. atan2(y, x) takes both components separately and handles all cases correctly.',
        },
      ],
    },
  ],
};
