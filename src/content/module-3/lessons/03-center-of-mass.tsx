import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'center-of-mass',
  title: 'Center of Mass',
  subtitle: 'A non-uniform arm has a different effective length — find it first.',
  order: 3,
  estimatedMinutes: 20,
  tags: ['center-of-mass', 'statics', 'arm', 'balance'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            The simple arm torque formula — <M tex="\tau = mgL/2 \cdot \cos\theta" /> — assumes
            the arm is a uniform rod with mass evenly distributed. Real FRC arms are rarely
            uniform: there's a heavy gearbox at the pivot, thin tube stock for the arm body,
            and often a game piece gripped at the tip. The CoM is not at <M tex="L/2" />.
          </p>
          <p>
            Finding the true center of mass takes a few minutes of calculation and avoids
            catastrophically undersizing your motor because you modeled the arm wrong.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Center of Mass of a System',
      latex: String.raw`x_{CoM} = \frac{\sum_i m_i \cdot x_i}{\sum_i m_i} = \frac{m_1 x_1 + m_2 x_2 + \cdots}{M_{total}}`,
      variables: [
        { symbol: 'x_{CoM}', meaning: 'CoM distance from pivot',         unit: 'm' },
        { symbol: 'm_i',      meaning: 'Mass of component i',             unit: 'kg' },
        { symbol: 'x_i',      meaning: 'Distance of component i from pivot', unit: 'm' },
        { symbol: 'M_{total}', meaning: 'Total arm mass',                 unit: 'kg' },
      ],
      explanation: 'Measure all distances from the pivot point. A component AT the pivot (x=0) contributes no torque even if it\'s heavy — like a gearbox mounted at the pivot center.',
    },
    {
      type: 'formula',
      label: 'Gravity Torque Using CoM',
      latex: String.raw`\tau_{gravity} = M_{total} \cdot g \cdot x_{CoM} \cdot \cos\theta`,
      explanation: 'Replace L/2 with x_CoM from the calculation above. Everything else stays the same.',
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Game pieces shift the CoM',
      content: (
        <p>
          In many FRC seasons, the arm picks up and carries a game piece at or near the tip. A
          0.3 kg game piece at the end of a 0.8 m arm contributes a significant CoM shift and can
          double the required holding torque. Always size your motor for the <em>loaded</em> arm —
          the unloaded case is easy, the match case might break you.
        </p>
      ),
    },
    {
      type: 'worked-example',
      title: 'CoM of a real arm with gearbox and game piece',
      problem: (
        <div className="space-y-1 text-sm">
          <p>An arm system has three components, all measured from the pivot:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Gearbox:</strong> 0.5 kg, center of mass at <strong>0 m</strong> (at pivot)
            </li>
            <li>
              <strong>Arm tube (rod):</strong> 1.0 kg, CoM at <strong>0.3 m</strong> (center of 0.6 m tube)
            </li>
            <li>
              <strong>Game piece:</strong> 0.3 kg at tip, <strong>0.6 m</strong> from pivot
            </li>
          </ul>
          <p className="text-slate-500 dark:text-slate-400">
            Find CoM distance from pivot. Then find maximum gravity torque.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Total mass',
          latex: String.raw`M = 0.5 + 1.0 + 0.3 = 1.8 \text{ kg}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">Sum all component masses.</p>
          ),
        },
        {
          label: 'Weighted sum of positions',
          latex: String.raw`\sum m_i x_i = (0.5)(0) + (1.0)(0.3) + (0.3)(0.6) = 0 + 0.30 + 0.18 = 0.48 \text{ kg·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The gearbox at the pivot contributes zero to the torque, even though it's the heaviest
              component.
            </p>
          ),
        },
        {
          label: 'CoM distance',
          latex: String.raw`x_{CoM} = \frac{0.48}{1.8} = 0.267 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The effective lever arm is 0.267 m, not 0.3 m (which would be the simple L/2 assumption
              without the game piece or gearbox).
            </p>
          ),
        },
        {
          label: 'Maximum gravity torque (horizontal)',
          latex: String.raw`\tau_{max} = M \cdot g \cdot x_{CoM} = 1.8 \times 9.81 \times 0.267 = 4.72 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If we'd used the naive L/2 = 0.3 m estimate with just the tube mass (1.0 kg), we'd
              have gotten τ = 1.0 × 9.81 × 0.3 = 2.94 N·m — 38% too low. That error propagates
              directly into undersized motor selection.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          CoM is <strong>0.267 m</strong> from pivot. Maximum gravity torque is{' '}
          <strong>4.72 N·m</strong>. The naive estimate without the game piece would have been
          38% too low.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'Counterbalance springs shift the effective CoM',
      content: (
        <p>
          A gas strut or constant-force spring pulling the arm toward vertical applies a torque
          that opposes gravity. This is equivalent to reducing the effective CoM distance in your
          calculation. Teams use springs when the required gear ratio would otherwise make the arm
          too slow. Calculate the spring torque at each angle and subtract it from the gravity
          torque — only the remainder needs to come from the motor.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'CoM position',
          latex: String.raw`x_{CoM} = \sum m_i x_i / M`,
        },
        {
          label: 'Gravity torque (real arm)',
          latex: String.raw`\tau = M g \cdot x_{CoM} \cdot \cos\theta`,
        },
        {
          label: 'Pivot components',
          latex: String.raw`x_i = 0 \Rightarrow \text{contributes no torque}`,
        },
        {
          label: 'Loaded CoM',
          latex: String.raw`x_{CoM} = \frac{m_{arm} x_{arm} + m_{piece} x_{tip}}{m_{arm}+m_{piece}}`,
          note: 'Add game piece at tip',
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A system has two masses: 3 kg at x = 0.2 m and 1 kg at x = 0.8 m from the pivot. Where is the center of mass?',
          options: ['0.35 m', '0.5 m', '0.6 m', '0.65 m'],
          correctIndex: 0,
          explanation: 'x_CoM = (m1*x1 + m2*x2) / (m1+m2) = (3*0.2 + 1*0.8) / (3+1) = (0.6 + 0.8) / 4 = 1.4 / 4 = 0.35 m.',
        },
        {
          question: 'An arm (1 kg, CoM at 0.3 m) picks up a 0.5 kg game piece at its tip (0.6 m from pivot). How does the system CoM change?',
          options: [
            'Moves closer to the pivot (toward 0.3 m)',
            'Stays at 0.3 m — game piece does not affect CoM if held at tip',
            'Moves farther from the pivot (past 0.3 m)',
            'Moves to exactly the midpoint (0.3 m)',
          ],
          correctIndex: 2,
          explanation: 'x_CoM = (1*0.3 + 0.5*0.6) / 1.5 = (0.3 + 0.3) / 1.5 = 0.6 / 1.5 = 0.4 m. The CoM moves from 0.3 m to 0.4 m — farther from the pivot, increasing gravity torque.',
        },
        {
          question: 'An arm component located exactly at the pivot point (x = 0) contributes to the gravity torque calculation by:',
          options: [
            'Adding the full weight torque at distance 0',
            'Contributing zero torque — its moment arm is zero',
            'Increasing the gear ratio requirement',
            'Shifting the CoM backward toward the pivot',
          ],
          correctIndex: 1,
          explanation: 'Torque = F * moment arm. Any mass at the pivot has a zero moment arm, so it contributes zero torque regardless of its mass. It does increase the total mass (and therefore required holding force), but not the torque.',
        },
        {
          question: 'Why is it important to size arm motors for the LOADED case (with a game piece)?',
          options: [
            'Game pieces reduce arm speed, requiring more motor torque to maintain velocity',
            'A game piece at the tip increases effective CoM distance and therefore gravity torque',
            'Game pieces shift weight to the rear of the robot, changing traction',
            'The loaded case only matters for elevator mechanisms, not arms',
          ],
          correctIndex: 1,
          explanation: 'A game piece at the arm tip increases the effective CoM distance from the pivot. Since tau = M_total * g * x_CoM * cos(theta), a larger x_CoM means more gravity torque — potentially exceeding what was sized for the unloaded arm.',
        },
      ],
    },
  ],
};
