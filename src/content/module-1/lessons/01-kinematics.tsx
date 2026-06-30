import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'kinematics',
  title: 'Kinematics',
  subtitle: 'Predict where your robot will be — before it moves a wheel.',
  order: 1,
  estimatedMinutes: 25,
  tags: ['kinematics', 'velocity', 'acceleration', 'projectile'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Your autonomous routine fires. The robot needs to cross 8 feet, pick up a game piece,
            and return to the scoring zone — all in 15 seconds. Did you time it? Or did you guess?
          </p>
          <p>
            Kinematics is the branch of physics that describes <em>motion</em> without worrying about
            what causes it. Three equations connect position, velocity, acceleration, and time.
            Know any three of those four quantities and you can find the fourth instantly. That is
            exactly the calculation you run when writing an autonomous routine, sizing an elevator,
            or figuring out whether your shooter can hit the target from the launch zone.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Where you will use kinematics',
      content: (
        <p>
          Autonomous timing (how long to drive before turning), elevator travel time
          (does the carriage reach the top before the next step in auto?), and projectile
          trajectories (does the ball land in the speaker or on the floor?) — all kinematics.
          Teams that skip this end up tuning auto routines by trial and error in the pit.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The three kinematic equations</h3>
          <p>
            These equations assume <strong>constant acceleration</strong> — a good approximation
            for most FRC mechanisms over short distances. If acceleration varies (like a motor
            following a trapezoidal profile), you integrate — but for quick back-of-envelope
            calculations, constant-a is accurate enough to get your auto timing within 10%.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Kinematic Equation 1 — velocity from acceleration',
      latex: String.raw`v = v_0 + at`,
      variables: [
        { symbol: 'v',   meaning: 'Final velocity',   unit: 'm/s' },
        { symbol: 'v_0', meaning: 'Initial velocity',  unit: 'm/s' },
        { symbol: 'a',   meaning: 'Acceleration (constant)', unit: 'm/s²' },
        { symbol: 't',   meaning: 'Time elapsed',      unit: 's' },
      ],
      explanation: 'Use this when you know how long the robot has been accelerating and want its current speed.',
    },

    {
      type: 'formula',
      label: 'Kinematic Equation 2 — position from time',
      latex: String.raw`\Delta x = v_0 t + \tfrac{1}{2}at^2`,
      variables: [
        { symbol: '\\Delta x', meaning: 'Displacement',      unit: 'm' },
        { symbol: 'v_0',       meaning: 'Initial velocity',  unit: 'm/s' },
        { symbol: 'a',         meaning: 'Acceleration',      unit: 'm/s²' },
        { symbol: 't',         meaning: 'Time',              unit: 's' },
      ],
      explanation: 'Use this to find how far the robot travels in a given time — critical for auto path timing.',
    },

    {
      type: 'formula',
      label: 'Kinematic Equation 3 — velocity from distance',
      latex: String.raw`v^2 = v_0^2 + 2a\Delta x`,
      variables: [
        { symbol: 'v',         meaning: 'Final velocity',   unit: 'm/s' },
        { symbol: 'v_0',       meaning: 'Initial velocity', unit: 'm/s' },
        { symbol: 'a',         meaning: 'Acceleration',     unit: 'm/s²' },
        { symbol: '\\Delta x', meaning: 'Displacement',     unit: 'm' },
      ],
      explanation:
        'Time does not appear here — use this when you know the distance but not the time. Perfect for elevator travel: "does the carriage hit the top before braking?"',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Neglecting acceleration leads to auto timing bugs',
      content: (
        <p>
          A common mistake: assume the robot instantly reaches top speed. At 4 m/s top speed
          with 0.5g acceleration, it takes about 0.8 seconds and 1.6 m just to reach full speed.
          If your auto routine fires the next command too early, the robot has not gone nearly
          as far as you expected — and you miss the game piece by a foot.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Robot crossing the field in auto',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A 120 lb robot needs to cross <strong>26.3 ft (8.02 m)</strong> in autonomous.
            It starts from rest and accelerates at <strong>0.5g (4.905 m/s²)</strong>.
            Its top speed is <strong>4.57 m/s (15 ft/s)</strong>.
          </p>
          <p className="text-slate-500">How long does the crossing take?</p>
        </div>
      ),
      steps: [
        {
          label: 'Find the time to reach top speed',
          latex: String.raw`t_{accel} = \frac{v_{top} - v_0}{a} = \frac{4.57 - 0}{4.905} \approx 0.932 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use equation 1. Starting from rest (<M tex="v_0 = 0" />), it takes about 0.93 s to reach top speed.
            </p>
          ),
        },
        {
          label: 'Find the distance covered during acceleration',
          latex: String.raw`\Delta x_{accel} = v_0 t + \tfrac{1}{2}at^2 = 0 + \tfrac{1}{2}(4.905)(0.932)^2 \approx 2.13 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use equation 2. The robot covers 2.13 m just while spinning up to speed.
            </p>
          ),
        },
        {
          label: 'Remaining distance at top speed',
          latex: String.raw`\Delta x_{cruise} = 8.02 - 2.13 = 5.89 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The rest of the crossing is at constant top speed (ignoring deceleration at the end for simplicity).
            </p>
          ),
        },
        {
          label: 'Time for the cruise phase',
          latex: String.raw`t_{cruise} = \frac{\Delta x_{cruise}}{v_{top}} = \frac{5.89}{4.57} \approx 1.29 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Simple distance = rate × time, rearranged.
            </p>
          ),
        },
        {
          label: 'Total time',
          latex: String.raw`t_{total} = t_{accel} + t_{cruise} = 0.932 + 1.29 \approx 2.22 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              About 2.2 seconds. If your auto routine assumed 2 seconds flat, the robot is still
              0.3 m short — that is a missed game piece. This is why you calculate.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Crossing 26.3 ft at 0.5g acceleration and 15 ft/s top speed takes approximately{' '}
          <strong>2.2 seconds</strong>. Budget this time in your auto sequence, not a guessed flat value.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Projectile motion</h3>
          <p>
            A game piece launched from a shooter follows a curved path under gravity. The key
            insight: <strong>horizontal and vertical motion are independent</strong>. Horizontal
            velocity stays constant (no air resistance in our model). Vertical velocity starts at
            whatever upward component you give it, then falls under <M tex="g = 9.81 \text{ m/s}^2" />.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Projectile Position',
      latex: String.raw`x(t) = v_0 \cos\theta \cdot t \qquad y(t) = v_0 \sin\theta \cdot t - \tfrac{1}{2}g t^2`,
      variables: [
        { symbol: 'v_0',    meaning: 'Launch speed',           unit: 'm/s' },
        { symbol: '\\theta', meaning: 'Launch angle above horizontal', unit: 'deg/rad' },
        { symbol: 'g',      meaning: 'Gravitational acceleration', unit: '9.81 m/s²' },
        { symbol: 't',      meaning: 'Time since launch',      unit: 's' },
      ],
      explanation:
        'Set y(t) = target height and solve for t, then substitute into x(t) for the required horizontal distance. Or set x = target distance and solve for the required v₀.',
    },

    {
      type: 'worked-example',
      title: 'Calculating launcher exit velocity',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Your shooter launches a game piece at <strong>45°</strong> from a height of{' '}
            <strong>0.5 m</strong>. The target opening is <strong>2.0 m high</strong> and{' '}
            <strong>3.5 m away</strong> horizontally.
          </p>
          <p className="text-slate-500">What exit speed is required?</p>
        </div>
      ),
      steps: [
        {
          label: 'Set up the y-equation at the target',
          latex: String.raw`y_{target} = v_0 \sin\theta \cdot t - \tfrac{1}{2}g t^2`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The net vertical displacement is <M tex="2.0 - 0.5 = 1.5 \text{ m}" /> (target height minus launch height).
            </p>
          ),
        },
        {
          label: 'Express t from the x-equation',
          latex: String.raw`t = \frac{x}{v_0 \cos\theta} = \frac{3.5}{v_0 \cos 45°} = \frac{3.5\sqrt{2}}{v_0}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <M tex="\cos 45° = \sin 45° = 1/\sqrt{2}" />. This gives <M tex="t" /> as a function of <M tex="v_0" />.
            </p>
          ),
        },
        {
          label: 'Substitute into y-equation and solve for v₀',
          latex: String.raw`1.5 = v_0 \cdot \frac{1}{\sqrt{2}} \cdot \frac{3.5\sqrt{2}}{v_0} - \frac{1}{2}(9.81)\left(\frac{3.5\sqrt{2}}{v_0}\right)^2`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The first term simplifies to 3.5. Rearranging gives{' '}
              <M tex="v_0^2 = \frac{9.81 \times 3.5^2}{2(3.5 - 1.5)} = \frac{120.2}{4.0} = 30.06" />.
            </p>
          ),
        },
        {
          label: 'Solve',
          latex: String.raw`v_0 = \sqrt{30.06} \approx 5.48 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The exit speed needed is about 5.5 m/s. Now back-calculate the required wheel RPM and gear ratio — that is the next step in mechanism design.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          A <strong>5.48 m/s</strong> exit velocity at 45° will put the game piece through the 2 m target
          opening 3.5 m away (launching from 0.5 m height). Use this to size your shooter wheel speed.
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'elevator-response',
      title: 'Elevator Response Simulator',
      description: 'Adjust elevator mass and gear ratio to see how kinematics determines travel time and whether the carriage hits the hard stop.',
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Velocity from time',   latex: String.raw`v = v_0 + at`,              note: 'Use when you know t' },
        { label: 'Position from time',   latex: String.raw`\Delta x = v_0 t + \tfrac{1}{2}at^2`, note: 'Auto path timing' },
        { label: 'Velocity from dist',   latex: String.raw`v^2 = v_0^2 + 2a\Delta x`,  note: 'No t needed' },
        { label: 'Projectile x',         latex: String.raw`x = v_0 \cos\theta \cdot t` },
        { label: 'Projectile y',         latex: String.raw`y = v_0 \sin\theta \cdot t - \tfrac{1}{2}gt^2` },
        { label: 'Time to top speed',    latex: String.raw`t = v_{top}/a`,              note: 'From rest' },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'Which kinematic equation lets you find final velocity from distance traveled — without needing to know the time elapsed?',
          options: [
            'v = v0 + at',
            'delta_x = v0*t + 0.5*a*t^2',
            'v^2 = v0^2 + 2*a*delta_x',
            'x = v * t',
          ],
          correctIndex: 2,
          explanation: 'v^2 = v0^2 + 2a*delta_x is the time-independent kinematic equation. It directly relates final velocity to initial velocity, acceleration, and displacement.',
        },
        {
          question: 'A robot starts from rest and accelerates at 5 m/s^2. How long does it take to reach 4 m/s?',
          options: ['0.5 s', '0.8 s', '1.25 s', '20 s'],
          correctIndex: 1,
          explanation: 'Using v = v0 + at: 4 = 0 + 5*t, so t = 4/5 = 0.8 s.',
        },
        {
          question: 'In projectile motion, which component of velocity remains constant throughout the flight (ignoring air resistance)?',
          options: ['Vertical velocity', 'Horizontal velocity', 'Both components', 'Neither — both change'],
          correctIndex: 1,
          explanation: 'Horizontal velocity is constant because gravity only acts vertically. Vertical velocity decreases going up and increases going down at rate g = 9.81 m/s^2.',
        },
        {
          question: 'A robot traveling at 4 m/s needs to stop in 2 m. What constant deceleration is required?',
          options: ['-1 m/s^2', '-2 m/s^2', '-4 m/s^2', '-8 m/s^2'],
          correctIndex: 2,
          explanation: 'Using v^2 = v0^2 + 2a*delta_x: 0 = 16 + 2*a*2, so a = -16/4 = -4 m/s^2. The negative sign indicates deceleration.',
        },
      ],
    },
  ],
};
