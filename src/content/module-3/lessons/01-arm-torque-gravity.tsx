import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'arm-torque-gravity',
  title: 'Arm Torque from Gravity',
  subtitle: 'The angle changes; gravity does not. Know your worst case.',
  order: 1,
  estimatedMinutes: 25,
  tags: ['arm', 'torque', 'gravity', 'angle'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Every arm on an FRC robot fights gravity every moment it's deployed. The motor doesn't
            just need to move the arm — it needs to <em>hold</em> it in place at any angle a driver
            might stop at. Teams that undersize arm motors discover this during their first match,
            when the arm slowly drops to the floor under its own weight.
          </p>
          <p>
            The gravity torque on an arm isn't constant. It peaks when the arm is horizontal and
            drops to zero when perfectly vertical. This lesson derives that relationship and shows
            you how to find the worst-case torque your motor must produce.
          </p>
        </div>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Holding torque vs. moving torque',
      content: (
        <p>
          When sizing an arm motor, holding torque at the worst-case angle is usually the binding
          constraint — not the torque required to accelerate the arm. A motor that can hold 10 N·m
          at the output can definitely swing the arm, but a motor that can only swing it might drop
          it the moment the driver stops pressing the button.
        </p>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Deriving the gravity torque formula
          </h3>
          <p>
            Consider a uniform arm (rod) of mass <M tex="m" /> and length <M tex="L" /> pivoting
            at one end. The center of mass sits at <M tex="L/2" /> from the pivot. Gravity pulls
            the center of mass straight down with force <M tex="mg" />.
          </p>
          <p>
            Torque is force times the perpendicular distance from the pivot to the line of action.
            When the arm makes angle <M tex="\theta" /> with the horizontal, the horizontal
            distance from pivot to CoM is <M tex="\tfrac{L}{2} \cos\theta" />. That's the moment
            arm for gravity.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Gravity Torque on a Uniform Arm',
      latex: String.raw`\tau_{gravity} = m \cdot g \cdot \frac{L}{2} \cdot \cos\theta`,
      variables: [
        { symbol: '\\tau_{gravity}', meaning: 'Gravitational torque at pivot',      unit: 'N·m' },
        { symbol: 'm',               meaning: 'Arm mass',                           unit: 'kg' },
        { symbol: 'g',               meaning: 'Gravitational acceleration (9.81)',   unit: 'm/s²' },
        { symbol: 'L',               meaning: 'Arm length',                         unit: 'm' },
        { symbol: '\\theta',         meaning: 'Angle from horizontal (0° = level)', unit: 'rad or °' },
      ],
      explanation: 'For a non-uniform arm (mass concentrated at tip, heavy gearbox, game piece), replace L/2 with the actual CoM distance from pivot. See Lesson 3 for that calculation.',
    },
    {
      type: 'formula',
      label: 'Worst-Case (Horizontal)',
      latex: String.raw`\tau_{max} = m \cdot g \cdot \frac{L}{2} \qquad \text{(when } \theta = 0°\text{)}`,
      explanation: 'cos(0°) = 1, so horizontal is always the maximum gravity torque. Design your motor and gearbox around this.',
    },
    {
      type: 'formula',
      label: 'Required Motor Torque',
      latex: String.raw`\tau_{motor} = \frac{\tau_{gravity}}{GR \cdot \eta}`,
      variables: [
        { symbol: '\\tau_{motor}', meaning: 'Required motor output torque',  unit: 'N·m' },
        { symbol: 'GR',            meaning: 'Gearbox reduction ratio',       unit: '—' },
        { symbol: '\\eta',         meaning: 'Gearbox efficiency (~0.85)',    unit: '—' },
      ],
      explanation: 'The gearbox multiplies motor torque by GR and loses η to friction. Flip it: the motor needs to produce τ_gravity/(GR·η) to hold the arm.',
    },
    {
      type: 'simulation',
      componentKey: 'arm-torque',
      title: 'Arm Torque vs. Angle',
      description: 'Drag the angle slider and watch the gravity torque change. The color shows whether your selected motor and gear ratio can hold position.',
    },
    {
      type: 'worked-example',
      title: 'Can this NEO hold the arm at 30° below horizontal?',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Arm: <strong>2 kg, 0.7 m long</strong>. Gearbox: <strong>80:1</strong>, efficiency
            85%. Motor: single <strong>NEO</strong> (stall torque 3.28 N·m).
          </p>
          <p>
            θ = −30° from horizontal (arm pointing 30° below level).
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            What is the gravity torque? Can the NEO hold it?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Gravity torque at θ = −30°',
          latex: String.raw`\tau_{gravity} = 2 \times 9.81 \times \frac{0.7}{2} \times \cos(-30°) = 2 \times 9.81 \times 0.35 \times 0.866 = 5.95 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              cos(−30°) = cos(30°) = 0.866. Torque is the same magnitude whether the arm is above
              or below horizontal at the same angle magnitude.
            </p>
          ),
        },
        {
          label: 'Required motor torque',
          latex: String.raw`\tau_{motor} = \frac{5.95}{80 \times 0.85} = \frac{5.95}{68} = 0.0875 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The gearbox reduces the required motor torque by 80× (minus efficiency losses).
            </p>
          ),
        },
        {
          label: 'Compare to NEO stall torque',
          latex: String.raw`\tau_{required} = 0.0875 \text{ N·m} \ll \tau_{stall,NEO} = 3.28 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The required motor torque is less than 3% of the NEO's stall torque. This arm is
              very well-sized — the motor barely works to hold position.
            </p>
          ),
        },
        {
          label: 'Check worst case (horizontal)',
          latex: String.raw`\tau_{gravity,max} = 2 \times 9.81 \times 0.35 \times 1.0 = 6.87 \text{ N·m} \Rightarrow \tau_{motor,max} = \frac{6.87}{68} = 0.101 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Even at the worst case (horizontal), the required motor torque is only 0.101 N·m —
              well within the NEO's capability. Safety margin = 3.28 / 0.101 ≈ 32×.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Yes. Required motor torque at worst case is <strong>0.101 N·m</strong>, giving a{' '}
          <strong>32× safety margin</strong> over the NEO's 3.28 N·m stall torque. With 80:1
          gearing, this arm is solidly sized.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Use stall torque, not rated torque',
      content: (
        <p>
          When checking if a motor can hold an arm, always compare against stall torque — the
          maximum torque the motor can ever produce. Some motor data sheets list a "rated" or
          "continuous" torque much lower; that's for thermal considerations during continuous
          motion, not holding position. At a held angle, current draw is proportional to torque, so
          a safety margin of 2–3× over the holding torque is sufficient.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Stalling motors in matches',
      content: (
        <p>
          Teams that stall arm motors during matches have a sizing problem: the required holding
          torque exceeds what the motor can provide at a safe current. Fixes: increase gear ratio,
          add a second motor, or add a constant-force spring that counterbalances gravity. The
          spring approach is elegant — it shifts the effective CoM and reduces τ_gravity by a
          constant offset.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Gravity torque',
          latex: String.raw`\tau = mg \cdot \tfrac{L}{2} \cdot \cos\theta`,
          note: 'Uniform arm, pivot at end',
        },
        {
          label: 'Worst case',
          latex: String.raw`\tau_{max} = mg \cdot \tfrac{L}{2}`,
          note: 'θ = 0° (horizontal)',
        },
        {
          label: 'Motor torque needed',
          latex: String.raw`\tau_{motor} = \tau_{gravity} / (GR \cdot \eta)`,
        },
        {
          label: 'cos at common angles',
          latex: String.raw`\cos 0° = 1,\; \cos 30° \approx 0.87,\; \cos 45° \approx 0.71,\; \cos 60° = 0.5`,
        },
        {
          label: 'Vertical (no torque)',
          latex: String.raw`\theta = 90°:\; \tau = 0`,
          note: 'Arm hangs/stands straight',
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A uniform arm has mass 1.5 kg and length 0.8 m. At what position does gravity act for torque purposes?',
          options: [
            'At the tip (0.8 m from pivot)',
            'At the center of mass (0.4 m from pivot)',
            'At the pivot (0 m)',
            'At one-third of the length (0.267 m from pivot)',
          ],
          correctIndex: 1,
          explanation: 'For a uniform arm, the center of mass is at L/2 = 0.4 m from the pivot. Gravity torque is computed using this effective moment arm: tau = m * g * (L/2) * cos(theta).',
        },
        {
          question: 'An arm has gravity torque of 12 N·m at horizontal. A 60:1 gearbox is used. What motor torque must the motor provide to just hold the arm at horizontal?',
          options: ['0.2 N·m', '0.72 N·m', '2 N·m', '720 N·m'],
          correctIndex: 0,
          explanation: 'Motor torque required = tau_gravity / GR = 12 / 60 = 0.2 N·m. The gearbox multiplies output torque by 60, so the motor only needs to produce 0.2 N·m to hold 12 N·m at the arm.',
        },
        {
          question: 'At what arm angle from horizontal is gravity torque at its maximum?',
          options: ['0° (arm pointing straight out horizontally)', '45°', '90° (arm pointing straight up)', '180° (arm hanging straight down)'],
          correctIndex: 0,
          explanation: 'tau = m*g*L*cos(theta). cos(0°) = 1 is the maximum value, so torque is greatest at horizontal. At 90° (vertical), cos(90°) = 0 and gravity torque is zero.',
        },
        {
          question: 'Why must you size an arm motor for holding torque at horizontal, not just for moving torque?',
          options: [
            'Holding torque is always smaller than moving torque',
            'If the motor cannot hold position, the arm drops under gravity even when stopped',
            'Holding torque determines the top speed of the arm',
            'The gear ratio only applies during movement, not while holding',
          ],
          correctIndex: 1,
          explanation: 'An arm motor must continuously overcome gravity torque whenever the arm is not vertical. If the motor cannot produce enough torque to hold the arm at a given angle, it stalls and the arm falls. Holding is usually the hardest case — worst at horizontal.',
        },
      ],
    },
  ],
};
