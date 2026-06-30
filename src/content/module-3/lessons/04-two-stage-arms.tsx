import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson04: Lesson = {
  id: 'two-stage-arms',
  title: 'Two-Stage & Telescoping Arms',
  subtitle: 'Forward kinematics tells you where your end effector is. Build the math before you build the metal.',
  order: 4,
  estimatedMinutes: 30,
  tags: ['two-stage', 'telescope', 'arm', 'linkage', 'geometry'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            FRC seasons regularly demand arms that can reach multiple scoring heights — low intakes
            and high goals that a single-pivot arm can't span without either being too long or
            violating height limits. The solution is usually a two-stage (shoulder + elbow) arm or
            a telescoping extension. Both introduce a geometry problem: given the joint angles,
            where is the end effector?
          </p>
          <p>
            This is the forward kinematics problem. Solving it in spreadsheet or code lets you
            verify the arm reaches its targets before cutting a single piece of tube stock.
          </p>
        </div>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: '2023 Charged Up — two-stage arms everywhere',
      content: (
        <p>
          In the 2023 game (Charged Up), the top goal required reaching approximately 1.2 m high
          while the intake sat on the floor. Nearly every elite team ran a two-stage arm or a
          telescoping extension. The math in this lesson is what those teams used to design their
          reach envelopes in CAD before the first piece of aluminum was cut.
        </p>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Two-stage arm: coordinate system
          </h3>
          <p>
            Define the shoulder pivot as the origin. The first arm segment (upper arm) has length{' '}
            <M tex="L_1" /> and makes angle <M tex="\theta_1" /> with the horizontal. The second
            segment (forearm) has length <M tex="L_2" /> and makes angle{' '}
            <M tex="\theta_1 + \theta_2" /> with the horizontal, where <M tex="\theta_2" /> is
            the elbow angle <em>relative to the upper arm</em>.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Forward Kinematics — End Effector Position',
      latex: String.raw`\begin{aligned} x_{tip} &= L_1 \cos\theta_1 + L_2 \cos(\theta_1 + \theta_2) \\ y_{tip} &= L_1 \sin\theta_1 + L_2 \sin(\theta_1 + \theta_2) \end{aligned}`,
      variables: [
        { symbol: 'x_{tip}, y_{tip}', meaning: 'End effector position (from shoulder pivot)', unit: 'm' },
        { symbol: 'L_1',              meaning: 'Upper arm length',                            unit: 'm' },
        { symbol: 'L_2',              meaning: 'Forearm length',                              unit: 'm' },
        { symbol: '\\theta_1',        meaning: 'Shoulder angle from horizontal',              unit: 'rad or °' },
        { symbol: '\\theta_2',        meaning: 'Elbow angle relative to upper arm',           unit: 'rad or °' },
      ],
      explanation: 'Positive angles are counter-clockwise. θ₂ = 0 means the forearm extends straight along the upper arm. θ₂ = 90° means the forearm is perpendicular to the upper arm.',
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Inverse kinematics: from target to joint angles
          </h3>
          <p>
            Given a desired end-effector position <M tex="(x, y)" />, we want to find{' '}
            <M tex="\theta_1" /> and <M tex="\theta_2" />. This is the inverse kinematics (IK)
            problem. For a two-link arm there's a closed-form solution using the law of cosines.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Inverse Kinematics (law of cosines)',
      latex: String.raw`\cos\theta_2 = \frac{x^2 + y^2 - L_1^2 - L_2^2}{2 L_1 L_2}`,
      explanation: 'This gives the elbow angle θ₂. Then θ₁ follows from atan2(y, x) minus a correction. Two solutions exist (elbow up/elbow down) — pick based on your arm geometry constraints.',
    },
    {
      type: 'formula',
      label: 'Shoulder Angle from IK',
      latex: String.raw`\theta_1 = \text{atan2}(y, x) - \text{atan2}\!\left(L_2 \sin\theta_2,\; L_1 + L_2 \cos\theta_2\right)`,
      explanation: 'Use the two-argument atan2 function (available in Java Math.atan2, C++ std::atan2, Python math.atan2). This gives the elbow-up solution; negate θ₂ for elbow-down.',
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Telescoping arms: variable L₂
          </h3>
          <p>
            A telescoping extension changes <M tex="L_2" /> instead of <M tex="\theta_2" />.
            Forward kinematics still works — just substitute the current extension length. The
            torque implication is important: as the arm extends, the CoM moves outward and gravity
            torque increases. The shoulder motor must handle the maximum extended case.
          </p>
        </div>
      ),
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'Sweep your reach envelope before building',
      content: (
        <p>
          In a spreadsheet or quick script, step through <M tex="\theta_1" /> and{' '}
          <M tex="\theta_2" /> in 5° increments and compute <M tex="(x_{tip}, y_{tip})" /> for
          each combination. Plot the results — this is your reach envelope. Overlay the scoring
          positions and the robot frame boundary. Any scoring position outside the envelope or
          inside the frame means you need to change your arm geometry. This takes an hour and can
          save a full rebuild.
        </p>
      ),
    },
    {
      type: 'worked-example',
      title: 'Two-stage arm: where does the tip land?',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Upper arm: <strong>L₁ = 0.5 m</strong>, shoulder angle <strong>θ₁ = 60°</strong> from
            horizontal.
          </p>
          <p>
            Forearm: <strong>L₂ = 0.4 m</strong>, elbow angle <strong>θ₂ = 30°</strong> relative
            to upper arm (same direction — arm bends further up).
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Find end effector position relative to shoulder pivot.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Combined angle at elbow',
          latex: String.raw`\theta_1 + \theta_2 = 60° + 30° = 90°`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The forearm makes 90° with the horizontal — pointing straight up.
            </p>
          ),
        },
        {
          label: 'x-component',
          latex: String.raw`x = L_1 \cos 60° + L_2 \cos 90° = 0.5 \times 0.5 + 0.4 \times 0 = 0.25 + 0 = 0.25 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The forearm is vertical, so it contributes nothing to horizontal reach.
            </p>
          ),
        },
        {
          label: 'y-component',
          latex: String.raw`y = L_1 \sin 60° + L_2 \sin 90° = 0.5 \times 0.866 + 0.4 \times 1.0 = 0.433 + 0.400 = 0.833 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Adding both height contributions gives the end effector height above the pivot.
            </p>
          ),
        },
        {
          label: 'Verify with reach limit',
          latex: String.raw`\text{Max reach} = L_1 + L_2 = 0.9 \text{ m} \qquad \text{Actual reach} = \sqrt{0.25^2 + 0.833^2} = \sqrt{0.756} = 0.869 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The tip is 0.869 m from the pivot (straight-line distance), within the 0.9 m
              maximum reach — makes sense since the arm isn't fully extended.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          End effector is at <strong>(0.25 m, 0.833 m)</strong> from the shoulder pivot —
          25 cm forward and 83 cm above.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'WPILib ArmFeedforward and IK in code',
      content: (
        <p>
          WPILib's <code>ArmFeedforward</code> class computes the motor voltage needed to hold a
          single-joint arm at a given angle. For two-stage arms, you run two separate feedforward
          calculations — one for the shoulder (treating the entire second stage as a load) and one
          for the elbow. The gravity torques from this lesson feed directly into those feedforward
          gains.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Forward kinematics x',
          latex: String.raw`x = L_1 \cos\theta_1 + L_2 \cos(\theta_1+\theta_2)`,
        },
        {
          label: 'Forward kinematics y',
          latex: String.raw`y = L_1 \sin\theta_1 + L_2 \sin(\theta_1+\theta_2)`,
        },
        {
          label: 'IK: elbow angle',
          latex: String.raw`\cos\theta_2 = \dfrac{x^2+y^2-L_1^2-L_2^2}{2L_1 L_2}`,
        },
        {
          label: 'IK: shoulder angle',
          latex: String.raw`\theta_1 = \text{atan2}(y,x) - \text{atan2}(L_2 s_2,\, L_1+L_2 c_2)`,
        },
        {
          label: 'Max reach',
          latex: String.raw`r_{max} = L_1 + L_2`,
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A two-stage arm has L1 = 0.6 m, theta1 = 0° (horizontal). L2 = 0.4 m, theta2 = 90° relative to L1 (so elbow bends up). What is the x-coordinate of the end effector?',
          options: ['0.6 m', '1.0 m', '0.4 m', '0 m'],
          correctIndex: 0,
          explanation: 'x = L1*cos(theta1) + L2*cos(theta1 + theta2) = 0.6*cos(0°) + 0.4*cos(0°+90°) = 0.6*1 + 0.4*0 = 0.6 m. The second link points straight up so it contributes zero x-displacement.',
        },
        {
          question: 'The maximum reach of a two-stage arm with L1 = 0.5 m and L2 = 0.4 m is:',
          options: ['0.4 m', '0.5 m', '0.9 m', '0.64 m (Pythagorean hypotenuse)'],
          correctIndex: 2,
          explanation: 'Maximum reach = L1 + L2 = 0.5 + 0.4 = 0.9 m, achieved when both links are fully extended in the same direction. The Pythagorean answer would only apply if the links were always perpendicular.',
        },
        {
          question: 'Inverse kinematics for a two-stage arm uses the law of cosines to find:',
          options: [
            'The top speed of the shoulder motor',
            'The elbow joint angle (theta2) given the desired end effector position (x, y)',
            'The center of mass of the arm system',
            'The gear ratio needed for each joint',
          ],
          correctIndex: 1,
          explanation: 'cos(theta2) = (x^2 + y^2 - L1^2 - L2^2) / (2*L1*L2). The law of cosines relates the triangle formed by the two links and the straight-line distance to the target. Once theta2 is known, theta1 follows from atan2.',
        },
        {
          question: 'A team is designing a two-stage arm for FRC 2023 (Charged Up). They need to score on the high peg at 1.1 m tall and 0.9 m out from the robot perimeter. Why must they plan the reach envelope carefully?',
          options: [
            'FRC rules require arms to be symmetrical',
            'Exceeding the extension limit or hitting frame perimeter with the arm violates game rules',
            'Longer arms always have lower moments of inertia',
            'Two-stage arms must always be fully extended',
          ],
          correctIndex: 1,
          explanation: "FRC rules enforce extension limits (e.g., 48 inches beyond the frame perimeter in some games) and height restrictions. Planning the arm's reach envelope at 5–10° increments lets teams verify they never violate these limits before cutting metal.",
        },
      ],
    },
  ],
};
