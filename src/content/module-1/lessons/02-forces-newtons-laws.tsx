import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson02: Lesson = {
  id: 'forces-newtons-laws',
  title: "Forces & Newton's Laws",
  subtitle: 'Why your drivetrain stalls, tips, and wins pushing matches — all physics.',
  order: 2,
  estimatedMinutes: 25,
  tags: ['forces', 'newton', 'fbd', 'friction', 'traction'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Every mechanism on your robot either pushes something, holds something, or moves
            something. In all three cases, forces are at play. Newton's laws let you predict
            whether the robot will accelerate, tip, or stall — before you cut a single piece
            of aluminum.
          </p>
          <p>
            The most practically important concept for FRC drivetrains is the{' '}
            <strong>traction limit</strong>: there is a maximum force your wheels can push
            the floor with, and no amount of motor power exceeds it. Understanding this tells
            you exactly when adding more motors or a higher gear ratio stops helping.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Forces everywhere on the robot',
      content: (
        <p>
          Pushing matches (traction limits), arm gravity loading (torque from weight), elevator
          cable tension (static equilibrium), intake roller grip (normal force + friction) —
          every subsystem involves force analysis. Free-body diagrams are the universal tool.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Newton's Three Laws</h3>
          <p>
            <strong>First Law (Inertia):</strong> A robot at rest stays at rest; a robot in motion
            stays in motion — unless a net external force acts on it. This is why a robot coasting
            on a slick field keeps moving after you cut power.
          </p>
          <p>
            <strong>Second Law:</strong> Net force equals mass times acceleration:{' '}
            <M tex="\Sigma F = ma" />. This is the workhorse equation. Want to know
            how fast a robot accelerates? Sum all horizontal forces (motor thrust minus friction),
            divide by the robot's mass.
          </p>
          <p>
            <strong>Third Law:</strong> Every force has an equal and opposite reaction force. When
            your robot pushes the floor backward, the floor pushes the robot forward. When you
            push an opponent robot, the opponent robot pushes back — which is why traction matters
            in a shoving match.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: "Newton's Second Law",
      latex: String.raw`\Sigma F = ma`,
      variables: [
        { symbol: '\\Sigma F', meaning: 'Net force (sum of all forces)',  unit: 'N' },
        { symbol: 'm',         meaning: 'Mass',                           unit: 'kg' },
        { symbol: 'a',         meaning: 'Acceleration',                   unit: 'm/s²' },
      ],
      explanation:
        'Rearrange as needed: a = ΣF/m (find acceleration), F = ma (find required force), m = F/a (find required mass capacity). 1 lb of force = 4.448 N; 1 lb mass = 0.4536 kg.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Traction limit — the ceiling on drivetrain force</h3>
          <p>
            Your wheels grip the carpet through friction. The maximum friction force (traction
            limit) depends on two things: how hard the wheel is pressed into the floor
            (normal force <M tex="N" />) and the coefficient of static friction between rubber
            and carpet (<M tex="\mu" />).
          </p>
          <p>
            For FRC carpet with pneumatic or rubber-compound wheels, <M tex="\mu \approx 0.8\text{–}1.0" />.
            With plastic wheels or wheels on slick surfaces, it drops to 0.3–0.5. Knowing your
            traction limit tells you the <em>maximum</em> force your drivetrain can ever exert —
            beyond that, wheels spin.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Traction Limit',
      latex: String.raw`F_{traction} = \mu \cdot N`,
      variables: [
        { symbol: 'F_{traction}', meaning: 'Maximum friction (traction) force', unit: 'N' },
        { symbol: '\\mu',         meaning: 'Coefficient of static friction',     unit: '—' },
        { symbol: 'N',            meaning: 'Normal force (weight of robot on wheels)', unit: 'N' },
      ],
      explanation:
        'On flat carpet, N = mg (robot weight in Newtons). Weight in Newtons = mass in kg × 9.81. For a 125 lb robot: N = 56.7 kg × 9.81 = 556 N.',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Weight shifts during acceleration',
      content: (
        <p>
          When a robot accelerates forward, weight shifts toward the rear wheels. This reduces
          the normal force on front wheels (reducing front traction) and increases it on rear
          wheels. For a rear-wheel-drive or 6-wheel kitbot, this actually helps. For a
          front-heavy robot, aggressive acceleration can cause front wheels to lose grip and
          skid, even before the traction limit is reached.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Free-body diagrams</h3>
          <p>
            A free-body diagram (FBD) is a sketch of one object with all forces drawn as arrows —
            nothing else. It is the clearest way to apply Newton's second law. Rules:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Draw the object as a simple box or dot.</li>
            <li>Draw every force acting <em>on</em> the object (not forces the object exerts on others).</li>
            <li>Label each arrow with its symbol and, if known, its magnitude.</li>
            <li>Choose a coordinate system — then <M tex="\Sigma F_x = ma_x" /> and <M tex="\Sigma F_y = ma_y" />.</li>
          </ul>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'Can your robot win a pushing match?',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Your robot weighs <strong>125 lb (56.7 kg)</strong>. The opponent also weighs 125 lb.
            Your drivetrain can push with up to <strong>400 N</strong> of motor force.
            Rubber-on-carpet coefficient of friction: <strong>μ = 0.85</strong>.
          </p>
          <p className="text-slate-500">
            What is your traction limit? Can you push the opponent, assuming they brake with their own traction?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Calculate your robot weight in Newtons',
          latex: String.raw`W = mg = 56.7 \times 9.81 = 556 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All of that weight bears on the carpet (on flat ground), so the normal force is 556 N.
            </p>
          ),
        },
        {
          label: 'Calculate your traction limit',
          latex: String.raw`F_{traction} = \mu N = 0.85 \times 556 = 473 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your maximum push force is 473 N — no matter how powerful your motors are,
              you cannot push harder than this without spinning wheels.
            </p>
          ),
        },
        {
          label: "Calculate the opponent's braking traction",
          latex: String.raw`F_{opp} = \mu N_{opp} = 0.85 \times 556 = 473 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The opponent has the same weight, so their maximum braking force equals yours. The
              match is exactly even — robot mass and CoF determine the outcome, not raw motor power.
            </p>
          ),
        },
        {
          label: 'Compare motor force to traction limit',
          latex: String.raw`F_{motor} = 400 \text{ N} < F_{traction} = 473 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your motor force (400 N) is below your traction limit, so wheels will not spin — good.
              But it is also below the opponent's traction (473 N), so you cannot push them either.
              You need either more weight, a higher friction wheel, or to catch them at an angle.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Your traction limit is <strong>473 N</strong>. Your motor force (400 N) is below it,
          so wheels stay planted — but it is also below the opponent's braking traction.{' '}
          <strong>The pushing match is roughly even.</strong> Adding more motors beyond the traction
          limit gains nothing; lowering the gear ratio and increasing torque also does nothing beyond traction.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Beyond traction — how teams win pushing matches',
      content: (
        <p>
          Since traction limit is determined by <M tex="\mu \cdot mg" />, the two levers are
          weight and friction coefficient. Heavier robots push harder — at max weight (125 lb),
          every pound counts. High-grip wheels (pneumatic tires, Colson, rubber-compound)
          outperform smooth plastic on carpet. Angled pushing also helps — catching the
          opponent from the side or at an angle reduces their effective braking force.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: "Newton's 2nd",    latex: String.raw`\Sigma F = ma`,           note: 'Net force = mass × accel' },
        { label: 'Weight',          latex: String.raw`W = mg`,                   note: 'g = 9.81 m/s², 1 lb = 4.448 N' },
        { label: 'Traction limit',  latex: String.raw`F_{max} = \mu N`,          note: 'μ ≈ 0.8–1.0 rubber on carpet' },
        { label: 'Accel from force',latex: String.raw`a = F_{net}/m`,            note: 'Subtract friction from motor force' },
        { label: 'lbs to kg',       latex: String.raw`m_{kg} = m_{lb} \times 0.4536` },
        { label: 'lbs-force to N',  latex: String.raw`F_N = F_{lb} \times 4.448` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A 56 kg robot (about 125 lb) accelerates at 3 m/s^2. What net force is required?',
          options: ['18.7 N', '53 N', '168 N', '549 N'],
          correctIndex: 2,
          explanation: 'F = m*a = 56 kg * 3 m/s^2 = 168 N. This is the net force after overcoming rolling resistance.',
        },
        {
          question: 'The traction limit for a 56 kg robot with rubber wheels (mu = 0.9) on carpet is approximately:',
          options: ['50 N', '168 N', '495 N', '980 N'],
          correctIndex: 2,
          explanation: 'F_max = mu * m * g = 0.9 * 56 * 9.81 = 494 N ≈ 495 N. No matter how powerful the motors are, the wheels cannot push harder than this.',
        },
        {
          question: 'Your drivetrain motors can produce 800 N of thrust force at stall. The traction limit is 490 N. Which limits your acceleration?',
          options: [
            'Motor force, because it is larger',
            'Traction limit, because wheels slip before motors stall',
            'Both equally, because the robot is in equilibrium',
            'Neither — the robot will not accelerate',
          ],
          correctIndex: 1,
          explanation: 'When motor force exceeds the traction limit, wheels slip. The effective force is capped at F_max = mu*N = 490 N. Adding more motors or a lower gear ratio does not help once traction-limited.',
        },
        {
          question: "Newton's 3rd Law says that when your robot pushes on another robot with 300 N, the other robot pushes back with:",
          options: ['150 N (half, since it is the reaction)', '300 N in the opposite direction', '600 N (double, because it is resisting)', 'Depends on which robot is heavier'],
          correctIndex: 1,
          explanation: "Newton's 3rd Law: every action has an equal and opposite reaction. The reaction force is always 300 N in the opposite direction, regardless of mass. Mass determines acceleration, not force magnitude.",
        },
      ],
    },
  ],
};
