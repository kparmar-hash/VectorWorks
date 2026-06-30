import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'projectile-motion',
  title: 'Projectile Motion for Shooters',
  subtitle: 'Decompose velocity, predict the arc, hit the target.',
  order: 1,
  estimatedMinutes: 25,
  tags: ['projectile', 'trajectory', 'shooter', 'angle'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Every shooting game in FRC comes down to the same question: given the robot's position
            and the target's position, what exit velocity and angle will put the game piece through
            the opening? Projectile motion gives you the mathematical answer. Teams that know this
            math build interpolation tables grounded in physics and debug misses with numbers instead
            of guesswork.
          </p>
          <p>
            The key insight is that horizontal and vertical motion are independent. Horizontal: the
            ball moves at constant speed (no air resistance in the basic model). Vertical: the ball
            accelerates downward at <M tex="g = 9.81 \text{ m/s}^2" />. Combine them to get a
            parabolic arc.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Crescendo (2024) and Charged Up (2023)',
      content: (
        <p>
          In 2024, robots launched Notes into the Speaker from various field positions. The math in
          this lesson is exactly what top teams used to build their distance-to-RPM lookup tables.
          In 2023, game pieces were placed rather than launched — but the same kinematics applied
          to high-speed intaking and handoff trajectories.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Decomposing the initial velocity</h3>
          <p>
            At launch, the ball has some speed <M tex="v_0" /> at some angle <M tex="\theta" /> above
            horizontal. Decompose this into independent components:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Horizontal: <M tex="v_x = v_0 \cos\theta" /> — constant throughout flight</li>
            <li>Vertical: <M tex="v_y = v_0 \sin\theta" /> — decreasing at <M tex="9.81 \text{ m/s}^2" /></li>
          </ul>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Position Equations',
      latex: String.raw`x(t) = v_0 \cos\theta \cdot t \qquad y(t) = h_0 + v_0 \sin\theta \cdot t - \tfrac{1}{2}g t^2`,
      variables: [
        { symbol: 'x(t)', meaning: 'Horizontal distance at time t',    unit: 'm' },
        { symbol: 'y(t)', meaning: 'Height at time t',                  unit: 'm' },
        { symbol: 'v_0',  meaning: 'Exit speed',                        unit: 'm/s' },
        { symbol: '\\theta', meaning: 'Launch angle above horizontal',  unit: 'rad' },
        { symbol: 'h_0',  meaning: 'Launch height above ground',        unit: 'm' },
        { symbol: 'g',    meaning: 'Gravitational acceleration (9.81)', unit: 'm/s²' },
        { symbol: 't',    meaning: 'Time since launch',                 unit: 's' },
      ],
      explanation:
        'To find where the ball is at a given height: set y(t) = target_height, solve the quadratic for t (take the positive root), then evaluate x(t).',
    },

    {
      type: 'formula',
      label: 'Range Formula (flat ground)',
      latex: String.raw`R = \frac{v_0^2 \sin 2\theta}{g}`,
      variables: [
        { symbol: 'R',    meaning: 'Horizontal range (launch and landing at same height)', unit: 'm' },
        { symbol: 'v_0',  meaning: 'Exit speed',                                           unit: 'm/s' },
        { symbol: '\\theta', meaning: 'Launch angle',                                      unit: 'rad' },
        { symbol: 'g',    meaning: '9.81 m/s²',                                            unit: 'm/s²' },
      ],
      explanation:
        'Maximum range occurs at 45°. For targets above the launch point, the optimal angle is above 45°. Use the position equations (not this formula) for elevated targets.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Solving for the launch angle',
      content: (
        <p>
          To find the angle that hits a target at <M tex="(x_t, y_t)" /> with a given{' '}
          <M tex="v_0" />: substitute the quadratic from{' '}
          <M tex="y(t) = y_t" /> to find t, then check if{' '}
          <M tex="x(t) = x_t" />. In practice, iterate over angles in 0.1° steps numerically
          or use the closed-form solution. For competition code, pre-calculate a lookup table
          indexed by distance.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Find the launch angle for a speaker target',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Speaker opening: <strong>2.05 m high</strong>, <strong>2.0 m away</strong> horizontally.
            Launch height: <strong>0.5 m</strong>. Exit speed: <strong>8 m/s</strong>.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Find the launch angle (try <M tex="\theta = 30°" />) and check if the ball hits the
            target.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Decompose at 30°',
          latex: String.raw`v_x = 8 \cos 30° = 6.93 \text{ m/s}, \quad v_y = 8 \sin 30° = 4.0 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At 30°, the horizontal component is 6.93 m/s and the vertical component is 4 m/s.
            </p>
          ),
        },
        {
          label: 'Time to reach x = 2.0 m',
          latex: String.raw`t = \frac{x}{v_x} = \frac{2.0}{6.93} = 0.289 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Horizontal motion is constant speed, so time to travel 2 m is simply 2/v_x.
            </p>
          ),
        },
        {
          label: 'Height at t = 0.289 s',
          latex: String.raw`y = 0.5 + 4.0 \times 0.289 - \tfrac{1}{2}(9.81)(0.289)^2 = 0.5 + 1.156 - 0.410 = 1.246 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At 30°, the ball is only 1.25 m high at 2 m distance — it misses below the 2.05 m
              opening. Need a steeper angle.
            </p>
          ),
        },
        {
          label: 'Try 50° instead',
          latex: String.raw`v_x = 5.14,\; v_y = 6.13,\; t = 2.0/5.14 = 0.389\text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At 50°: y = 0.5 + 6.13×0.389 − 4.91×0.389² = 0.5 + 2.385 − 0.743 = 2.14 m.
              That's above 2.05 m — the ball clears the bottom of the opening. A 47°–50° range
              should hit the target.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          30° misses low (1.25 m vs 2.05 m needed). 50° gives 2.14 m — a hit. The correct angle
          is approximately <strong>47°–50°</strong> for these conditions.
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'projectile-shooter',
      title: 'Projectile Shooter Simulator',
      description: 'Adjust exit velocity and angle — watch the arc and see if it hits the target.',
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Horizontal velocity', latex: String.raw`v_x = v_0 \cos\theta` },
        { label: 'Vertical velocity',   latex: String.raw`v_y = v_0 \sin\theta` },
        { label: 'Horizontal position', latex: String.raw`x(t) = v_x \cdot t` },
        { label: 'Vertical position',   latex: String.raw`y(t) = h_0 + v_y t - \tfrac{1}{2}g t^2` },
        { label: 'Time at distance x',  latex: String.raw`t = x / v_x` },
        { label: 'Flat-ground range',   latex: String.raw`R = v_0^2 \sin 2\theta / g`, note: 'Max at 45°' },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A ball is launched at 10 m/s at 45°. What is the horizontal velocity component?',
          options: ['10 m/s', '7.07 m/s', '5.0 m/s', '8.66 m/s'],
          correctIndex: 1,
          explanation: 'v_x = v_0 × cos(45°) = 10 × 0.707 = 7.07 m/s.',
        },
        {
          question: 'Why does the range formula R = v₀² sin(2θ)/g NOT work for elevated FRC targets?',
          options: [
            'It only applies to objects heavier than 0.5 kg',
            'The formula assumes the landing height equals the launch height; FRC targets are above the robot',
            'It ignores the horizontal velocity component',
            'FRC balls have too much air resistance for the formula to apply',
          ],
          correctIndex: 1,
          explanation: 'The range formula is derived for a projectile that lands at the same height it was launched from. When the target is above the launch point, you must use the full position equations and solve for time.',
        },
        {
          question: 'A ball launched at v₀ = 6 m/s at 30° from h₀ = 0.3 m. How far has it traveled horizontally at t = 0.4 s?',
          options: ['1.04 m', '2.08 m', '2.4 m', '1.73 m'],
          correctIndex: 1,
          explanation: 'v_x = 6 × cos(30°) = 5.196 m/s. x = v_x × t = 5.196 × 0.4 = 2.08 m.',
        },
        {
          question: 'For a target that is above the robot, how does the optimal launch angle compare to 45°?',
          options: [
            'Lower than 45° — a flatter angle covers more horizontal distance',
            'Exactly 45° — that is always optimal',
            'Higher than 45° — more vertical component is needed to reach an elevated target',
            'It depends only on exit speed, not target height',
          ],
          correctIndex: 2,
          explanation: 'The 45° optimum is for maximum range on flat ground. For elevated targets, the optimal angle is steeper than 45° because you need more vertical velocity to gain height before gravity pulls the ball down.',
        },
      ],
    },
  ],
};
