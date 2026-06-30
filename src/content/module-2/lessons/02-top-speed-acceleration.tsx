import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson02: Lesson = {
  id: 'top-speed-acceleration',
  title: 'Top Speed vs. Acceleration',
  subtitle: 'You can have one. Choosing which one wins matches.',
  order: 2,
  estimatedMinutes: 25,
  tags: ['acceleration', 'top-speed', 'tradeoff', 'kinematics'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Here's a trap every rookie team falls into: they build the fastest robot they can, win
            the speed arms race in the shop, and then lose matches because they can't accelerate
            fast enough to reach that speed across a 26-foot field. Speed on paper and speed on the
            field are different things.
          </p>
          <p>
            The gear ratio is a single knob that trades top speed for acceleration. Turn it one way
            and the robot screams; turn it the other way and it launches off the line. Understanding
            the math lets you find the sweet spot for your game strategy.
          </p>
        </div>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Two ceilings on acceleration
          </h3>
          <p>
            When a robot accelerates, two separate limits might be the binding constraint:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Motor-limited:</strong> the motor doesn't produce enough force at the wheels
              to accelerate faster. Adding gear ratio or stronger motors helps.
            </li>
            <li>
              <strong>Traction-limited:</strong> the wheels already produce more force than friction
              allows. Adding gear ratio makes the wheels spin, not accelerate faster. Adding motors
              doesn't help either.
            </li>
          </ul>
          <p>
            Most FRC drivetrains with 4–6 brushless motors are traction-limited. That means
            acceleration is determined by <M tex="\mu \cdot g" />, not by motor power.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Drive Force at Wheels',
      latex: String.raw`F_{drive} = \frac{\tau_{stall} \cdot GR \cdot N_{motors} \cdot \eta}{r_{wheel}}`,
      variables: [
        { symbol: 'F_{drive}',    meaning: 'Wheel drive force (at stall)',   unit: 'N' },
        { symbol: '\\tau_{stall}', meaning: 'Motor stall torque',            unit: 'N·m' },
        { symbol: 'r_{wheel}',    meaning: 'Wheel radius',                   unit: 'm' },
      ],
    },
    {
      type: 'formula',
      label: 'Traction-Limited Acceleration',
      latex: String.raw`a_{traction} = \mu \cdot g \approx 0.8 \times 9.81 = 7.85 \text{ m/s}^2`,
      variables: [
        { symbol: 'a_{traction}', meaning: 'Max traction-limited acceleration', unit: 'm/s²' },
        { symbol: '\\mu',         meaning: 'Coefficient of friction (carpet)',  unit: '—' },
        { symbol: 'g',            meaning: 'Gravitational acceleration',        unit: '9.81 m/s²' },
      ],
      explanation: 'For Colson wheels on FRC carpet, μ ≈ 0.8. Omni wheels are lower (~0.5). This number is independent of gear ratio — more motors cannot improve it.',
    },
    {
      type: 'formula',
      label: 'Time to Reach Speed (traction-limited)',
      latex: String.raw`t = \frac{v_{top}}{a_{traction}}`,
      variables: [
        { symbol: 't',       meaning: 'Time to reach top speed from rest', unit: 's' },
        { symbol: 'v_{top}', meaning: 'Robot top speed',                   unit: 'm/s' },
      ],
      explanation: 'This is only valid when traction-limited. If motor-limited, use kinematic equations with the actual drive force.',
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The JVN Calculator does this automatically',
      content: (
        <p>
          The JVN Design Calculator (a community spreadsheet) has a column for traction-limited
          acceleration and time to cross the field. You are now doing that same calculation by hand.
          Understanding the math means you can modify it for your specific field game — the JVN
          sheet is a convenience, not a black box.
        </p>
      ),
    },
    {
      type: 'worked-example',
      title: '125 lb robot: which acceleration limit governs?',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Robot: <strong>125 lb (56.7 kg)</strong>, six Kraken X60 motors (stall torque 9.37 N·m
            each), <strong>6.75:1</strong> gear ratio, 4-inch (0.1016 m) wheels, efficiency = 0.88,
            μ = 0.8.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Is acceleration motor-limited or traction-limited? How long to reach 15 ft/s?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Motor-limited drive force',
          latex: String.raw`F_{drive} = \frac{9.37 \times 6.75 \times 6 \times 0.88}{0.0508} = \frac{298.5}{0.0508} = 5{,}876 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If the motors could spin freely at stall, they'd push with nearly 6,000 N — way more
              than the robot weighs.
            </p>
          ),
        },
        {
          label: 'Traction ceiling',
          latex: String.raw`F_{traction} = \mu \cdot m \cdot g = 0.8 \times 56.7 \times 9.81 = 445 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Traction allows only 445 N before the wheels spin. Motor force (5,876 N) blows past
              this — so the robot is <strong>traction-limited</strong>.
            </p>
          ),
        },
        {
          label: 'Traction-limited acceleration',
          latex: String.raw`a = \frac{F_{traction}}{m} = \frac{445}{56.7} = 7.85 \text{ m/s}^2 \approx 0.80g`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Equivalently: <M tex="a = \mu \cdot g = 0.8 \times 9.81" />. The motor power is
              irrelevant — the wheels dictate acceleration.
            </p>
          ),
        },
        {
          label: 'Top speed at 6.75:1',
          latex: String.raw`v_{top} = \frac{6000 \cdot \pi \cdot 0.1016}{6.75 \cdot 60} = 4.73 \text{ m/s} = 15.5 \text{ ft/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The robot tops out at about 15.5 ft/s theoretical.
            </p>
          ),
        },
        {
          label: 'Time to reach top speed',
          latex: String.raw`t = \frac{v_{top}}{a} = \frac{4.73}{7.85} = 0.60 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Under traction-limited acceleration, this robot reaches theoretical top speed in
              0.6 seconds from a standstill — fast enough for most auto routines.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          The robot is <strong>traction-limited</strong>. Acceleration ≈ <strong>0.8g (7.85 m/s²)</strong>;
          time to 15 ft/s ≈ <strong>0.60 s</strong>. Changing the gear ratio within a reasonable
          range won't affect these numbers — it only shifts top speed.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Picking a ratio that wins',
      content: (
        <p>
          Most elite FRC drive teams target 14–16 ft/s with 4-inch wheels and enough push to
          defend. A slower ratio (higher GR) gives more push torque and faster acceleration up to
          the traction ceiling — but the same acceleration if you're already traction-limited. A
          faster ratio (lower GR) raises top speed but only helps if you actually reach that speed
          on the field. Study your auto paths and teleop cycles to pick the range that matches your
          game strategy.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Drive force',
          latex: String.raw`F_{drive} = \dfrac{\tau_{stall} \cdot GR \cdot N \cdot \eta}{r}`,
        },
        {
          label: 'Traction accel',
          latex: String.raw`a_{max} = \mu \cdot g`,
          note: 'Independent of motors/GR',
        },
        {
          label: 'Motor accel',
          latex: String.raw`a = F_{drive} / m`,
          note: 'Use if < traction limit',
        },
        {
          label: 'Time to speed',
          latex: String.raw`t = v_{top} / a`,
        },
        {
          label: 'Which governs?',
          latex: String.raw`\text{if } F_{drive} > F_{traction} \Rightarrow \text{traction-limited}`,
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A traction-limited robot with mu = 0.9 has maximum acceleration of approximately:',
          options: ['0.9 m/s²', '1.8 m/s²', '8.83 m/s²', '9.81 m/s²'],
          correctIndex: 2,
          explanation: 'Traction-limited acceleration = mu * g = 0.9 * 9.81 = 8.83 m/s^2. Notice this is independent of mass — a heavier robot does not accelerate faster even though it has more traction, because the extra mass also requires more force to accelerate.',
        },
        {
          question: 'Increasing gear ratio (going from 6:1 to 8:1) while keeping motor and wheel size constant will:',
          options: [
            'Increase both top speed and acceleration',
            'Decrease top speed but increase available drive force',
            'Increase top speed but decrease drive force',
            'Have no effect once traction-limited',
          ],
          correctIndex: 1,
          explanation: 'Higher gear ratio reduces output shaft speed (lower top speed) but increases output torque and therefore drive force. This is the fundamental speed-torque tradeoff for any gearbox.',
        },
        {
          question: 'A 56 kg robot starting from rest with traction-limited acceleration of 8 m/s^2 needs how long to reach 4 m/s?',
          options: ['0.25 s', '0.5 s', '2 s', '32 s'],
          correctIndex: 1,
          explanation: 't = v / a = 4 / 8 = 0.5 s. Starting from rest (v0 = 0) and using v = v0 + at, t = (v - v0) / a = 4 / 8 = 0.5 s.',
        },
        {
          question: 'The JVN drivetrain calculator and the formulas in this lesson both predict that most FRC drivetrains are traction-limited rather than motor-limited. This means:',
          options: [
            'Adding more motors directly increases acceleration proportionally',
            'Reducing gear ratio always improves acceleration',
            'The wheels slip before the motors stall, capping useful drive force',
            'The drivetrain is underweight and should add ballast',
          ],
          correctIndex: 2,
          explanation: 'Most FRC drivetrains produce more motor force than friction can transmit. The traction limit (mu * N) caps effective acceleration regardless of how many motors are fitted or what gear ratio is used.',
        },
      ],
    },
  ],
};
