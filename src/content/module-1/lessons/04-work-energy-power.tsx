import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson04: Lesson = {
  id: 'work-energy-power',
  title: 'Work, Energy & Power',
  subtitle: "Power is the real FRC constraint — not force, not speed.",
  order: 4,
  estimatedMinutes: 25,
  tags: ['work', 'energy', 'power', 'motor', 'efficiency'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            FRC teams often debate gear ratios in terms of speed versus torque. But the real
            currency is <strong>power</strong> — the rate at which a motor delivers energy.
            Every motor has a fixed peak power. Changing the gear ratio just shifts where on the
            torque-speed curve you operate; it does not change how much power the motor can give
            the mechanism.
          </p>
          <p>
            Understanding power explains one of the most counter-intuitive FRC results: you can
            make a mechanism faster <em>and</em> more forceful by optimizing the gear ratio to
            hit peak motor power — up to the limits set by traction and structural strength.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Power as the design constraint',
      content: (
        <p>
          The robot's battery delivers roughly 12 V × 200 A peak = 2,400 W. A Kraken X60 at
          peak efficiency puts out about 483 W. Six of them are 2,900 W — already over the
          battery's peak delivery capability. Power, not gear ratio, is what limits how fast
          your robot accelerates across the field.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Work</h3>
          <p>
            Work is energy transferred by a force moving an object through a distance.
            Pushing a 60 kg robot 8 meters requires work — the amount depends on the force
            and the distance. Work has units of joules (J = N·m).
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Work',
      latex: String.raw`W = F \cdot d \cdot \cos\theta`,
      variables: [
        { symbol: 'W',       meaning: 'Work done',               unit: 'J (joules)' },
        { symbol: 'F',       meaning: 'Applied force',           unit: 'N' },
        { symbol: 'd',       meaning: 'Distance moved',          unit: 'm' },
        { symbol: '\\theta', meaning: 'Angle between F and motion', unit: 'deg' },
      ],
      explanation:
        'When force and motion are in the same direction (θ = 0°), W = Fd. For a robot driving across the field, the motor force pushes forward and the robot moves forward — θ = 0, so W = Fd.',
    },

    {
      type: 'formula',
      label: 'Kinetic Energy',
      latex: String.raw`KE = \tfrac{1}{2}mv^2`,
      variables: [
        { symbol: 'KE', meaning: 'Kinetic energy', unit: 'J' },
        { symbol: 'm',  meaning: 'Mass',           unit: 'kg' },
        { symbol: 'v',  meaning: 'Speed',          unit: 'm/s' },
      ],
      explanation:
        'This is the energy stored in a moving robot. To accelerate from rest to 4.5 m/s, a 56 kg robot needs KE = ½ × 56 × 4.5² = 567 J of energy input from the motors.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Power — the rate of doing work</h3>
          <p>
            Power is how fast work gets done. A high-power mechanism lifts heavy loads quickly;
            a low-power mechanism lifts them slowly. For robots, power has two equivalent
            expressions depending on whether you're thinking linearly or rotationally:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Power — Linear and Rotational',
      latex: String.raw`P = \frac{W}{t} = F \cdot v = \tau \cdot \omega`,
      variables: [
        { symbol: 'P',      meaning: 'Power',                         unit: 'W (watts)' },
        { symbol: 'F',      meaning: 'Force',                         unit: 'N' },
        { symbol: 'v',      meaning: 'Linear speed',                  unit: 'm/s' },
        { symbol: '\\tau',  meaning: 'Torque',                        unit: 'N·m' },
        { symbol: '\\omega',meaning: 'Angular velocity',              unit: 'rad/s' },
      ],
      explanation:
        'P = τω is the key equation for motors. Multiply motor torque (N·m) by angular velocity (rad/s) to get power in watts. 1 RPM = π/30 rad/s ≈ 0.1047 rad/s.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Peak power on a motor torque-speed curve</h3>
          <p>
            A DC motor's torque-speed curve is linear: maximum torque (stall torque) at zero
            speed, zero torque at maximum speed (free speed). Power = τ × ω peaks exactly
            at <strong>half the stall torque and half the free speed</strong>. This is the
            operating point you want to design toward for maximum performance.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Peak Motor Power',
      latex: String.raw`P_{peak} = \frac{\tau_{stall} \cdot \omega_{free}}{4}`,
      variables: [
        { symbol: 'P_{peak}',      meaning: 'Peak mechanical power output', unit: 'W' },
        { symbol: '\\tau_{stall}', meaning: 'Stall torque',                  unit: 'N·m' },
        { symbol: '\\omega_{free}',meaning: 'Free speed',                    unit: 'rad/s' },
      ],
      explanation:
        'This is a direct consequence of the linear torque-speed curve. At half-stall torque and half-free-speed, P = (τ_stall/2) × (ω_free/2) = τ_stall × ω_free / 4.',
    },

    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'Motor efficiency curves',
      content: (
        <p>
          The power equation <M tex="P = \tau\omega" /> gives <em>mechanical</em> power output.
          Electrical power input is <M tex="P_{in} = IV" />. The difference is heat —
          resistive losses in the motor windings. Motor efficiency <M tex="\eta = P_{out}/P_{in}" />{' '}
          typically peaks between 70–90% at a different operating point than peak power.
          For FRC design, we usually optimize for peak mechanical power, but knowing efficiency
          helps estimate battery drain and heat management.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Kraken X60 peak power calculation',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A <strong>Kraken X60</strong> has a free speed of <strong>6,000 RPM</strong> and
            a stall torque of <strong>8.0 N·m</strong>.
          </p>
          <p className="text-slate-500">
            Find the peak mechanical power and the RPM at which it occurs.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Convert free speed to rad/s',
          latex: String.raw`\omega_{free} = 6000 \text{ RPM} \times \frac{\pi}{30} = 6000 \times 0.10472 = 628.3 \text{ rad/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The formula requires angular velocity in rad/s. Multiply RPM by <M tex="\pi/30" />.
            </p>
          ),
        },
        {
          label: 'Apply peak power formula',
          latex: String.raw`P_{peak} = \frac{\tau_{stall} \cdot \omega_{free}}{4} = \frac{8.0 \times 628.3}{4} = \frac{5026}{4} = 1257 \text{ W}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              About 1,257 W — roughly 1.7 horsepower. This is the mechanical output; electrical
              input is higher due to motor winding resistance losses.
            </p>
          ),
        },
        {
          label: 'Find the RPM at peak power',
          latex: String.raw`\omega_{peak} = \frac{\omega_{free}}{2} = \frac{6000}{2} = 3000 \text{ RPM}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Peak power always occurs at half the free speed. The corresponding torque is also
              half the stall torque: <M tex="4.0 \text{ N·m}" />.
            </p>
          ),
        },
        {
          label: 'Verify: P = τ × ω',
          latex: String.raw`P = 4.0 \text{ N·m} \times \frac{3000 \times \pi}{30} = 4.0 \times 314.2 = 1257 \text{ W} \checkmark`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Matches the formula result. When sizing a drivetrain, choose a gear ratio that puts
              the motor operating point near 3,000 RPM under typical load for maximum acceleration.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Kraken X60 peak mechanical power: <strong>~1,257 W (≈1.7 hp)</strong>, occurring at{' '}
          <strong>3,000 RPM</strong> (half free speed) with <strong>4.0 N·m</strong> output torque.
          Six of these on a drivetrain deliver up to 7.5 kW mechanical — battery limited in practice.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Peak power at half stall torque — the sizing sweet spot',
      content: (
        <p>
          Design your gear ratio so the motor runs near its peak power point under typical
          operating conditions. For a drivetrain, this means the motor should be around half
          free speed while the robot is cruising at top speed. Use the JVN calculator or
          ReCalc to iterate gear ratio until the "operating speed" lands near 50% free speed.
          Mechanisms running outside this zone waste potential performance.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Work',           latex: String.raw`W = Fd\cos\theta`,             note: 'θ between force and motion' },
        { label: 'Kinetic energy', latex: String.raw`KE = \tfrac{1}{2}mv^2`,        note: 'v in m/s' },
        { label: 'Power (linear)', latex: String.raw`P = Fv`,                        note: 'P in W' },
        { label: 'Power (rotational)', latex: String.raw`P = \tau\omega`,            note: 'ω in rad/s' },
        { label: 'Peak motor power', latex: String.raw`P_{peak} = \frac{\tau_{stall}\omega_{free}}{4}` },
        { label: 'RPM → rad/s',    latex: String.raw`\omega = \text{RPM} \times \pi/30` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A Kraken X60 has a stall torque of 9.37 N·m and a free speed of 6000 RPM (628 rad/s). What is its peak mechanical power output?',
          options: ['586 W', '1,472 W', '2,944 W', '5,888 W'],
          correctIndex: 1,
          explanation: 'Peak power = (stall_torque * free_speed) / 4 = (9.37 * 628) / 4 = 5884 / 4 = 1471 W ≈ 1472 W. Peak power always occurs at half stall torque and half free speed.',
        },
        {
          question: 'A robot pushes a game piece with 50 N of force across 3 m. How much work is done?',
          options: ['16.7 J', '50 J', '150 J', '450 J'],
          correctIndex: 2,
          explanation: 'W = F * d * cos(theta) = 50 N * 3 m * cos(0°) = 150 J. The force is parallel to motion so cos(0°) = 1.',
        },
        {
          question: 'At what motor speed does peak power output occur for a DC motor?',
          options: [
            'At free speed (no load)',
            'At stall (zero speed)',
            'At half of free speed',
            'At one-quarter of free speed',
          ],
          correctIndex: 2,
          explanation: 'DC motor power P = tau * omega. Since torque decreases linearly from stall to zero at free speed, power peaks at exactly half free speed — the product of the linear torque and speed curves is maximized at the midpoint.',
        },
        {
          question: 'A 56 kg robot moving at 4 m/s has how much kinetic energy?',
          options: ['112 J', '224 J', '448 J', '896 J'],
          correctIndex: 2,
          explanation: 'KE = 0.5 * m * v^2 = 0.5 * 56 * 16 = 448 J. Note that speed is squared — doubling speed quadruples kinetic energy.',
        },
      ],
    },
  ],
};
