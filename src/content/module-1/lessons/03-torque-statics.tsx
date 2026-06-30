import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'torque-statics',
  title: 'Torque & Statics',
  subtitle: 'The arm that holds position and the motor that makes it possible.',
  order: 3,
  estimatedMinutes: 30,
  tags: ['torque', 'statics', 'lever', 'mechanical-advantage', 'arm'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Your arm is fully extended. The motor controller outputs zero. Does the arm hold
            position, or does it crash to the floor? The answer is torque.
          </p>
          <p>
            Torque is the rotational equivalent of force — it is what causes things to spin or
            what keeps them from spinning. For FRC mechanisms, torque analysis tells you whether
            your motor/gearbox can actually hold the arm against gravity at its worst-case angle,
            and how much angular acceleration you can achieve when scoring.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Torque shows up everywhere',
      content: (
        <p>
          Arm and pivot mechanisms (gravity loading changes with angle), elevator cables
          (tension = force, torque on the spool), intake rollers (grip force vs. motor torque),
          and drivetrains (wheel torque from motor torque through gearbox) — all require torque
          analysis. The formula is always the same.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What is torque?</h3>
          <p>
            Torque (<M tex="\tau" />, pronounced "tau") is the product of a force and the
            perpendicular distance from the pivot to the line of action of that force. That
            distance is called the <em>moment arm</em> or <em>lever arm</em>.
          </p>
          <p>
            Think of opening a door: pushing near the hinge takes enormous effort; pushing at
            the far edge (long lever arm) is easy. Same force × longer arm = more torque.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Torque',
      latex: String.raw`\tau = r \cdot F \cdot \sin\theta`,
      variables: [
        { symbol: '\\tau',    meaning: 'Torque',                        unit: 'N·m' },
        { symbol: 'r',        meaning: 'Lever arm (distance from pivot to force)', unit: 'm' },
        { symbol: 'F',        meaning: 'Applied force',                 unit: 'N' },
        { symbol: '\\theta',  meaning: 'Angle between r and F vectors', unit: 'deg/rad' },
      ],
      explanation:
        'When the force is perpendicular to the lever arm (θ = 90°), sin θ = 1 and τ = rF — maximum torque. For a horizontal arm with gravity pulling straight down, the perpendicular component of gravity changes with the arm angle.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gravity torque on an arm</h3>
          <p>
            An arm pivoting at its base has gravity acting on its center of mass (typically
            the midpoint for a uniform arm). The torque that gravity applies depends on the
            arm angle from vertical:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Gravity Torque on Arm',
      latex: String.raw`\tau_{grav} = m \cdot g \cdot L_{cm} \cdot \cos\phi`,
      variables: [
        { symbol: '\\tau_{grav}', meaning: 'Gravity torque about the pivot', unit: 'N·m' },
        { symbol: 'm',            meaning: 'Arm + game piece mass',           unit: 'kg' },
        { symbol: 'g',            meaning: 'Gravitational acceleration',      unit: '9.81 m/s²' },
        { symbol: 'L_{cm}',       meaning: 'Distance from pivot to center of mass', unit: 'm' },
        { symbol: '\\phi',        meaning: 'Angle from horizontal (0° = horizontal, 90° = vertical up)', unit: 'deg' },
      ],
      explanation:
        'Maximum gravity torque occurs at φ = 0° (arm horizontal) — cos(0) = 1. At vertical (φ = 90°), cos = 0 and gravity applies no torque. Always check holding torque at the worst-case angle (usually horizontal or slightly below).',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Always check holding torque at full extension',
      content: (
        <p>
          The motor must supply at least as much torque as gravity applies at the worst-case
          angle, just to <em>hold position</em>. Add margin for dynamic loading (accelerating
          the arm, game piece impacts). A factor of safety of 1.5–2× is common. If the motor
          stall torque through your gearbox barely equals the gravity torque, the arm will
          slowly droop — especially as the battery voltage sags during a match.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Static equilibrium</h3>
          <p>
            A mechanism is in <em>static equilibrium</em> when it is not accelerating — both the
            net force and the net torque on it are zero. This is the condition for holding an arm
            at a fixed angle:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><M tex="\Sigma F = 0" /> — forces balance</li>
            <li><M tex="\Sigma \tau = 0" /> — torques balance about any pivot</li>
          </ul>
          <p>
            To hold the arm horizontal, the motor torque (through the gearbox) must exactly
            oppose the gravity torque. Any net torque means the arm accelerates.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Static Equilibrium',
      latex: String.raw`\Sigma \tau = 0 \quad \Rightarrow \quad \tau_{motor} = \tau_{gravity}`,
      explanation:
        'The required motor output torque equals the gravity torque at the angle you want to hold. Remember: motor torque is multiplied by the gear ratio before reaching the arm shaft. τ_arm = τ_motor × GR × η (η = drivetrain efficiency, typically 0.85–0.95).',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mechanical advantage</h3>
          <p>
            A lever trades force for distance: apply a small force at a long lever arm, get a
            large force at a short lever arm. Mechanical advantage is the ratio of output force
            to input force — or equivalently, the ratio of input arm to output arm.
          </p>
          <p>
            In robotics, gearboxes implement this for rotational motion: a high gear ratio
            multiplies torque (at the cost of speed). This is why you never connect a motor
            directly to an arm without gearing — at full extension, the gravity torque would
            be many times the motor's stall torque.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Mechanical Advantage',
      latex: String.raw`MA = \frac{F_{out}}{F_{in}} = \frac{r_{in}}{r_{out}} = GR`,
      variables: [
        { symbol: 'MA',     meaning: 'Mechanical advantage (unitless)', unit: '—' },
        { symbol: 'F_{out}',meaning: 'Output force',                    unit: 'N' },
        { symbol: 'F_{in}', meaning: 'Input force',                     unit: 'N' },
        { symbol: 'r_{in}', meaning: 'Input lever arm',                 unit: 'm' },
        { symbol: 'r_{out}',meaning: 'Output lever arm',                unit: 'm' },
      ],
      explanation:
        'For a gearbox, MA = GR. A 100:1 gearbox multiplies motor torque by 100 (ignoring efficiency). The arm moves 100× slower than the motor, but with 100× the torque.',
    },

    {
      type: 'worked-example',
      title: 'Sizing a gearbox for a 2 kg arm',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Your arm is <strong>0.6 m long</strong>, uniform, with a{' '}
            <strong>total moving mass of 2 kg</strong> (arm + game piece at tip). The pivot is at
            one end. You want a maximum angular acceleration of{' '}
            <strong>15 rad/s²</strong>. You will use a <strong>NEO motor</strong> (stall torque
            3.28 N·m, efficiency 0.90 through gearbox).
          </p>
          <p className="text-slate-500">What gear ratio do you need?</p>
        </div>
      ),
      steps: [
        {
          label: 'Calculate moment of inertia of the arm',
          latex: String.raw`I = \tfrac{1}{3}mL^2 = \tfrac{1}{3}(2)(0.6)^2 = \tfrac{1}{3}(2)(0.36) = 0.24 \text{ kg·m}^2`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A uniform rod pivoting at one end has <M tex="I = \tfrac{1}{3}mL^2" />.
              This is the resistance to angular acceleration.
            </p>
          ),
        },
        {
          label: 'Calculate torque required for the target angular acceleration',
          latex: String.raw`\tau_{accel} = I \cdot \alpha = 0.24 \times 15 = 3.6 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rotational equivalent of <M tex="F = ma" />: torque equals moment of inertia times angular acceleration.
            </p>
          ),
        },
        {
          label: 'Calculate gravity holding torque at horizontal',
          latex: String.raw`\tau_{grav} = mgL_{cm}\cos(0°) = 2 \times 9.81 \times 0.3 \times 1 = 5.89 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Center of mass is at the midpoint (<M tex="L_{cm} = 0.3 \text{ m}" />). Horizontal is the
              worst case (maximum gravity torque).
            </p>
          ),
        },
        {
          label: 'Total required output torque (worst case)',
          latex: String.raw`\tau_{total} = \tau_{accel} + \tau_{grav} = 3.6 + 5.89 = 9.49 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You need to both fight gravity AND accelerate the arm at the same time in the worst
              case (starting from horizontal with full angular acceleration demand).
            </p>
          ),
        },
        {
          label: 'Solve for minimum gear ratio',
          latex: String.raw`GR_{min} = \frac{\tau_{total}}{\tau_{motor} \cdot \eta} = \frac{9.49}{3.28 \times 0.90} = \frac{9.49}{2.95} \approx 3.22`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This is the <em>minimum</em> ratio that lets the motor produce enough torque at stall.
              In practice, apply a 1.5–2× safety factor and choose the next available ratio.
              A <strong>5:1 or 6:1</strong> gearbox would be appropriate.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          A minimum gear ratio of approximately <strong>3.2:1</strong> is needed, but with a
          safety factor, use <strong>5:1 or 6:1</strong>. This gives comfortable margin for
          battery sag, friction losses, and holding position with varying game piece mass.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Arms stall motors with too-low gear ratios',
      content: (
        <p>
          If your gear ratio is too small, gravity torque exceeds the motor's available output
          torque and the motor stalls trying to hold position. A stalled motor draws maximum
          current, overheats quickly, and can trip a breaker or permanently damage the motor
          without current limiting. Always size the gearbox first, then add current limits in
          software as a second line of defense.
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'arm-torque',
      title: 'Arm Torque vs. Angle',
      description: 'Drag the arm angle and watch gravity torque change. Set a gear ratio and see whether the motor can hold position.',
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Torque',              latex: String.raw`\tau = rF\sin\theta`,           note: 'θ between r and F' },
        { label: 'Arm gravity torque',  latex: String.raw`\tau_g = mgL_{cm}\cos\phi`,     note: 'φ from horizontal' },
        { label: 'Rotational Newton 2', latex: String.raw`\tau = I\alpha`,                note: 'τ in N·m, I in kg·m², α in rad/s²' },
        { label: 'Arm inertia',         latex: String.raw`I_{arm} = \tfrac{1}{3}mL^2`,   note: 'Pivot at end' },
        { label: 'Equilibrium',         latex: String.raw`\Sigma\tau = 0`,                note: 'Holding position' },
        { label: 'Mech. advantage',     latex: String.raw`MA = GR = \tau_{out}/\tau_{in}` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'An arm is 0.8 m long. A motor applies 2 N of force perpendicular to the arm. What is the torque about the pivot?',
          options: ['0.4 N·m', '1.6 N·m', '2.4 N·m', '4.0 N·m'],
          correctIndex: 1,
          explanation: 'Torque = r * F * sin(90°) = 0.8 m * 2 N * 1 = 1.6 N·m. Since the force is perpendicular to the arm, sin(theta) = 1.',
        },
        {
          question: 'An arm holding a 2 kg game piece at 0.5 m from the pivot is horizontal. What gravity torque must the motor overcome?',
          options: ['1.0 N·m', '4.9 N·m', '9.8 N·m', '19.6 N·m'],
          correctIndex: 2,
          explanation: 'tau_gravity = m * g * L * cos(0°) = 2 kg * 9.81 m/s^2 * 0.5 m * 1 = 9.81 N·m ≈ 9.8 N·m. Horizontal is the worst-case angle because cos(0°) = 1.',
        },
        {
          question: 'For a mechanism in static equilibrium, the sum of all torques about any pivot point equals:',
          options: ['The weight of the mechanism in N·m', 'The motor stall torque', 'Zero', 'The gear ratio'],
          correctIndex: 2,
          explanation: 'Static equilibrium requires that the sum of all torques equals zero (no net angular acceleration). This is the condition you apply when checking whether a motor can hold an arm at rest.',
        },
        {
          question: 'A gear ratio of 50:1 means the motor output torque is multiplied by what factor at the arm?',
          options: ['1/50 (divided)', '25 (half)', '50 (multiplied)', '2500 (squared)'],
          correctIndex: 2,
          explanation: 'Mechanical advantage equals the gear ratio. A 50:1 gearbox multiplies motor torque by 50 at the output shaft, while dividing angular speed by 50.',
        },
      ],
    },
  ],
};
