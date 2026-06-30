import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'four-bar-linkage',
  title: 'Four-Bar Linkage Geometry',
  subtitle: 'Grashof condition, law of cosines, and why parallel four-bars keep game pieces level.',
  order: 3,
  estimatedMinutes: 30,
  tags: ['four-bar', 'linkage', 'geometry', 'kinematics', 'coupler'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            The four-bar linkage is the most common mechanical linkage in FRC. You'll find it in
            over-the-bumper intakes, note-handling manipulators, claw mechanisms, and ground intake
            funnels. It solves a problem that's hard to solve with a simple pivot arm: how to
            move an end effector through a large arc while keeping it pointed in a constant
            direction — like keeping an intake roller always facing the ground.
          </p>
          <p>
            Understanding the geometry lets you design the linkage analytically instead of
            iterating in CAD until something looks right.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'The over-the-bumper intake is a four-bar',
      content: (
        <p>
          Virtually every over-the-bumper intake from 2022–2024 uses a parallel four-bar to keep
          the intake roller facing the floor through its entire deploy arc. Without the four-bar
          geometry, a simple pivot arm would rotate the roller upward as it deploys, dropping the
          game piece.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The four links</h3>
          <p>
            A four-bar linkage has exactly four rigid links connected in a loop by four revolute
            (pin) joints:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Ground link</strong> — fixed to the robot frame</li>
            <li><strong>Input crank</strong> — driven by your motor; pivots on the ground link</li>
            <li><strong>Coupler</strong> — connects crank to rocker; carries the end effector</li>
            <li><strong>Output rocker (follower)</strong> — the fourth link, pivots on the other ground pin</li>
          </ul>
          <p>
            Link lengths determine the motion type. The <em>Grashof condition</em> tells you
            whether a full rotation is possible at all.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Grashof Condition',
      latex: String.raw`s + l \leq p + q`,
      variables: [
        { symbol: 's', meaning: 'Length of the shortest link', unit: 'm' },
        { symbol: 'l', meaning: 'Length of the longest link',  unit: 'm' },
        { symbol: 'p', meaning: 'Length of one remaining link', unit: 'm' },
        { symbol: 'q', meaning: 'Length of the other remaining link', unit: 'm' },
      ],
      explanation:
        'If the Grashof condition holds (s + l ≤ p + q), at least one link can fully rotate. For a crank-rocker (most FRC intakes), the shortest link must be the crank or the ground. If the condition fails, no link can make a full rotation — the mechanism only oscillates.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Finding the rocker angle — law of cosines</h3>
          <p>
            Given a crank angle <M tex="\theta" /> (measured from the ground link), you can find
            the output rocker angle using the law of cosines in two steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              Compute the diagonal <M tex="d" /> (distance between the two non-ground pivots) using
              the crank length <M tex="a" />, ground length <M tex="b" />, and crank angle{' '}
              <M tex="\theta" />.
            </li>
            <li>
              Use <M tex="d" />, the coupler length, and the rocker length to find the rocker angle
              at the opposite ground pivot.
            </li>
          </ol>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Diagonal (Step 1 of 2)',
      latex: String.raw`d^2 = a^2 + b^2 - 2ab\cos\theta`,
      variables: [
        { symbol: 'd',       meaning: 'Diagonal between moving pivots',    unit: 'm' },
        { symbol: 'a',       meaning: 'Crank length',                       unit: 'm' },
        { symbol: 'b',       meaning: 'Ground link length',                 unit: 'm' },
        { symbol: '\\theta', meaning: 'Crank angle from ground link',       unit: 'rad' },
      ],
      explanation:
        'This is the standard law of cosines. The triangle is formed by the ground link, the crank, and the diagonal connecting the two non-ground pin joints.',
    },

    {
      type: 'formula',
      label: 'Rocker Angle (Step 2 of 2)',
      latex: String.raw`\cos\phi = \frac{d^2 + c_{rocker}^2 - c_{coupler}^2}{2 \cdot d \cdot c_{rocker}}`,
      variables: [
        { symbol: '\\phi',         meaning: 'Rocker angle at the output ground pivot', unit: 'rad' },
        { symbol: 'c_{rocker}',    meaning: 'Rocker (follower) link length',            unit: 'm' },
        { symbol: 'c_{coupler}',   meaning: 'Coupler link length',                      unit: 'm' },
        { symbol: 'd',             meaning: 'Diagonal from Step 1',                     unit: 'm' },
      ],
      explanation:
        'Solve for φ using arccos. There are two solutions (elbow-up / elbow-down configurations) — the one your mechanism uses depends on assembly. Most FRC deployments use the "open" configuration.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Parallel four-bar — the special case</h3>
          <p>
            When the crank and rocker are equal length AND the coupler and ground link are equal
            length, the mechanism is a <em>parallel four-bar</em>. In this configuration, the
            coupler always remains parallel to the ground link regardless of the crank angle. This
            means any object mounted to the coupler maintains a constant orientation throughout the
            full range of motion.
          </p>
          <p>
            This is the mathematical reason why an over-the-bumper intake with a parallel four-bar
            keeps the roller always facing the ground — the coupler doesn't rotate relative to the
            field.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'Simulate in GeoGebra before building',
      content: (
        <p>
          GeoGebra's geometry tools can model a four-bar linkage interactively. Set your link
          lengths as parameters, attach a crank angle slider, and watch the coupler trace its path.
          Design the motion envelope there, then verify Grashof and the key angles analytically
          with the formulas above. This catches interference issues before metal is cut.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Grashof check and diagonal calculation',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A four-bar linkage has link lengths: <strong>ground = 0.40 m</strong>,{' '}
            <strong>crank = 0.15 m</strong>, <strong>coupler = 0.35 m</strong>,{' '}
            <strong>rocker = 0.20 m</strong>.
          </p>
          <p className="text-slate-500">
            (1) Does it satisfy the Grashof condition? (2) At crank angle θ = 45°, find the
            diagonal length d.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Identify shortest and longest links',
          latex: String.raw`s = 0.15 \text{ m (crank)}, \quad l = 0.40 \text{ m (ground)}, \quad p = 0.35 \text{ m}, \quad q = 0.20 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sort the four link lengths: shortest s = 0.15, longest l = 0.40. The other two are
              p = 0.35 and q = 0.20.
            </p>
          ),
        },
        {
          label: 'Grashof condition check',
          latex: String.raw`s + l = 0.15 + 0.40 = 0.55 \qquad p + q = 0.35 + 0.20 = 0.55`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              0.55 ≤ 0.55 — the Grashof condition is met (equality). This is a <em>change-point</em>
              mechanism, a special Grashof case. The crank can fully rotate. In practice, add a
              small mechanical stop to avoid the dead-point positions at 0° and 180°.
            </p>
          ),
        },
        {
          label: 'Compute diagonal at θ = 45°',
          latex: String.raw`d^2 = a^2 + b^2 - 2ab\cos\theta = (0.15)^2 + (0.40)^2 - 2(0.15)(0.40)\cos 45°`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Substituting: 0.0225 + 0.16 − 0.12 × 0.7071 = 0.1825 − 0.08485 = 0.09765.
            </p>
          ),
        },
        {
          label: 'Solve for d',
          latex: String.raw`d = \sqrt{0.09765} \approx 0.3125 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              With d = 0.3125 m, the rocker angle φ can be found by applying the law of cosines
              again in the triangle formed by d, the rocker (0.20 m), and the coupler (0.35 m).
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          The linkage <strong>satisfies the Grashof condition</strong> (s + l = p + q — a change-point
          mechanism). At θ = 45°, the diagonal between the two moving pivots is{' '}
          <strong>d ≈ 0.313 m</strong>. From here, apply the rocker angle formula to find the output
          rocker position.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Grashof condition',
          latex: String.raw`s + l \leq p + q`,
          note: 's = shortest, l = longest link',
        },
        {
          label: 'Diagonal (law of cosines)',
          latex: String.raw`d^2 = a^2 + b^2 - 2ab\cos\theta`,
          note: 'a = crank, b = ground, θ = crank angle',
        },
        {
          label: 'Rocker angle',
          latex: String.raw`\cos\phi = \frac{d^2 + c_r^2 - c_c^2}{2dc_r}`,
          note: 'c_r = rocker, c_c = coupler',
        },
        {
          label: 'Parallel four-bar condition',
          latex: String.raw`a = c_r \text{ AND } b = c_c`,
          note: 'Coupler stays parallel to ground',
        },
      ],
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transmission angle — how efficiently force gets through</h3>
          <p>
            Satisfying the Grashof condition only tells you the linkage can move. It doesn't tell
            you <em>how well</em> force transfers through it. The <strong>transmission angle γ</strong>{' '}
            is the angle between the coupler and the output rocker at any point in the motion. It
            determines how much of the coupler force actually becomes useful torque on the rocker.
          </p>
          <p>
            When <M tex="\gamma = 90°" />, the coupler pushes perfectly perpendicular to the rocker —
            maximum torque, maximum efficiency. As <M tex="\gamma" /> approaches <M tex="0°" /> or{' '}
            <M tex="180°" />, the force becomes nearly collinear with the rocker, producing almost
            no rotation. At exactly <M tex="0°" /> or <M tex="180°" /> the linkage hits a{' '}
            <em>toggle (dead-center) position</em> — it either locks or flips unpredictably.
          </p>
          <p>
            The practical design target is <M tex="45° < \gamma < 135°" /> throughout the entire
            working arc. If your linkage has a poor transmission angle for part of the deploy sweep,
            the motor will strain or stall right there — even if the motor is sized correctly for the
            average load.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Transmission Angle',
      latex: String.raw`\cos\gamma = \frac{b^2 + c^2 - d^2}{2bc}`,
      variables: [
        { symbol: '\\gamma',  meaning: 'Transmission angle between coupler and output rocker', unit: 'rad (target: 45°–135°)' },
        { symbol: 'b',        meaning: 'Coupler link length',                                   unit: 'm' },
        { symbol: 'c',        meaning: 'Output rocker length',                                  unit: 'm' },
        { symbol: 'd',        meaning: 'Diagonal from Step 1 (crank-pin to rocker-pin distance)', unit: 'm' },
      ],
      explanation:
        'Apply law of cosines in the triangle formed by the coupler, rocker, and diagonal d. The diagonal d changes with every crank angle, so γ is not constant. Evaluate at both extremes of the working arc (crank at start angle and end angle) and confirm γ stays between 45° and 135° at both limits.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Velocity ratio — the output isn't constant speed</h3>
          <p>
            Unlike a gear pair, the velocity ratio between the input crank and the output rocker in
            a four-bar linkage is <strong>not constant</strong>. The rocker moves faster in the
            middle of its arc and slows near the extremes. This happens because the effective lever
            arm and transmission angle both change with crank position.
          </p>
          <p>
            This is actually a <em>feature</em> for most intake deployments. The rocker decelerates
            naturally near the stowed and deployed positions — where the intake is most likely to
            contact the bumper or carpet. You get a built-in cushioning effect at both ends of
            travel without adding springs or bumpers. Teams that replace a four-bar with a simple
            pivot arm often add rubber bumpers to solve a problem the four-bar geometry solved for
            free.
          </p>
          <p>
            This property is called <strong>mechanical advantage variation</strong>. Near dead-center
            angles the rocker moves slowly but the motor can develop very high torque at the output
            — useful at the extremes of motion where the mechanism is most loaded. The math follows
            from differentiating the position equations, but in practice it's most useful as a
            qualitative design insight: put your most loaded positions near (but not at) dead center.
          </p>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'Sizing a parallel four-bar OTB intake',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Design a <strong>parallel four-bar</strong> OTB intake. Requirements: roller must travel
            approximately <strong>10 inches vertically</strong> from stowed to deployed. The two
            ground pivot points (fixed to the robot frame) are <strong>6 inches apart</strong>. The
            crank must complete a <strong>90° sweep</strong> from stowed to deployed.
          </p>
          <p className="text-slate-500">
            Find crank and rocker lengths that satisfy Grashof and achieve the required travel.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Set ground link and coupler from pivot spacing',
          latex: String.raw`b_{ground} = c_{coupler} = 6 \text{ in} \quad (\text{parallel four-bar condition: ground} = \text{coupler})`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              In a parallel four-bar, the coupler must equal the ground link so the coupler stays
              parallel throughout motion. We're placing the two frame pivots 6 in apart.
            </p>
          ),
        },
        {
          label: 'Relate crank length to vertical travel',
          latex: String.raw`\Delta y = L_{crank} \times (\sin\theta_{final} - \sin\theta_{initial})`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              In a parallel four-bar the coupler pivot tracks the same arc as the crank tip. The
              vertical displacement over the deploy sweep equals the crank length times the
              difference in sines. For a 90° sweep from straight-down (270° → sin = −1) to
              horizontal (0° → sin = 0): Δy = L × (0 − (−1)) = L.
            </p>
          ),
        },
        {
          label: 'Choose crank length for 10 in of travel',
          latex: String.raw`\Delta y = L_{crank} \times 1 \Rightarrow L_{crank} = 10 \text{ in}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A 10-inch crank with a 90° deploy arc gives exactly 10 inches of vertical travel —
              no iteration needed once you fix the sweep angle. Crank = rocker = 10 in for a
              parallel four-bar.
            </p>
          ),
        },
        {
          label: 'Grashof check',
          latex: String.raw`s + l \leq p + q \;\Rightarrow\; 6 + 10 \leq 10 + 6 \;\Rightarrow\; 16 \leq 16 \checkmark`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All parallel four-bars satisfy Grashof at equality — they are change-point mechanisms.
              The crank can rotate fully. In practice, add mechanical hard stops at the stow and
              deploy positions to avoid the toggle dead points at 0° and 180°.
            </p>
          ),
        },
        {
          label: 'Check transmission angle at the mid-arc (θ = 45°)',
          latex: String.raw`d^2 = 10^2 + 6^2 - 2(10)(6)\cos 45° \approx 100+36-84.9 = 51.1 \Rightarrow d \approx 7.15 \text{ in}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Now use the transmission angle formula with b = coupler = 6 in, c = rocker = 10 in,
              d = 7.15 in: cos γ = (36 + 100 − 51.1)/(2 × 6 × 10) = 84.9/120 ≈ 0.708 → γ ≈ 45°.
              This is right at the acceptable lower bound — consider widening the crank or adjusting
              mount positions.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          A parallel four-bar with <strong>crank = rocker = 10 in</strong> and{' '}
          <strong>coupler = ground = 6 in</strong> delivers 10 in of vertical roller travel over a
          90° crank sweep. It passes Grashof (change-point). Transmission angle at mid-arc is ~45° —
          acceptable but tight. Adding 1–2 in to the crank or spreading the ground pivots widens the
          transmission angle for better force transfer.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'CAD it, then verify the math',
      content: (
        <p>
          Onshape's motion simulation (or any CAD package with assembly mates and a sweep animation)
          can drive your crank through its full deploy arc and display the transmission angle,
          coupler path, and clearances in real time. The math in this lesson tells you what link
          lengths to try; CAD confirms that nothing collides and the transmission angle stays healthy
          throughout. <strong>Never cut metal on a new four-bar design without animating the full
          range of motion first.</strong>
        </p>
      ),
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A four-bar has links: ground = 0.5 m, crank = 0.2 m, coupler = 0.4 m, rocker = 0.3 m. Does it satisfy the Grashof condition?',
          options: [
            'Yes — s + l = 0.7, p + q = 0.7, so 0.7 ≤ 0.7',
            'No — s + l = 0.7 > p + q = 0.6',
            'Yes — s + l = 0.5 < p + q = 0.9',
            'Cannot be determined without more information',
          ],
          correctIndex: 0,
          explanation: 'Shortest s = 0.2, longest l = 0.5, others p = 0.4, q = 0.3. s + l = 0.7, p + q = 0.7. The condition s + l ≤ p + q is met (equality), so this is a Grashof change-point mechanism.',
        },
        {
          question: 'In a four-bar linkage, what does the "coupler" link connect?',
          options: [
            'The two fixed ground pivots',
            'The input crank to the output rocker',
            'The motor shaft to the gearbox',
            'The ground link to the frame',
          ],
          correctIndex: 1,
          explanation: 'The coupler is the floating link that connects the free end of the input crank to the free end of the output rocker. It is the link that carries the end effector in most FRC applications.',
        },
        {
          question: 'Why does a parallel four-bar (crank length = rocker length, coupler length = ground length) keep the end effector at a constant angle?',
          options: [
            'Because the coupler is rigid and does not flex',
            'Because opposite links being equal forces the coupler to remain parallel to the ground link throughout motion',
            'Because the Grashof condition is always satisfied',
            'Because the crank angle is held constant by the motor',
          ],
          correctIndex: 1,
          explanation: 'When crank = rocker and coupler = ground, the four-bar forms a parallelogram. The coupler is always constrained to be parallel to the ground link, so anything attached to the coupler maintains a constant orientation relative to the field.',
        },
        {
          question: 'A crank of length 0.10 m connects to a ground link of 0.30 m at angle θ = 90°. What is the diagonal d between the two non-ground pivots? (cos 90° = 0)',
          options: ['0.40 m', '0.316 m', '0.20 m', '0.10 m'],
          correctIndex: 1,
          explanation: 'd² = a² + b² − 2ab·cos(90°) = 0.01 + 0.09 − 0 = 0.10. d = √0.10 ≈ 0.316 m. At 90° the cos term vanishes, making this a straightforward application of the Pythagorean theorem.',
        },
      ],
    },
  ],
};
