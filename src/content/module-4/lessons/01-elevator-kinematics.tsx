import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'elevator-kinematics',
  title: 'Elevator Kinematics',
  subtitle: 'Travel time is match time. Calculate it before you build.',
  order: 1,
  estimatedMinutes: 20,
  tags: ['elevator', 'kinematics', 'travel-time', 'acceleration'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            An elevator is a 1D kinematics problem. The carriage moves straight up or down, so
            you only need to track one coordinate. That simplicity is a gift — it means you can
            calculate travel time, peak speed, and acceleration requirements with the same three
            equations you learned in physics class.
          </p>
          <p>
            The reason this matters in competition: <strong>cycle time</strong> is the single
            biggest driver of autonomous and teleop scoring. Every 0.2 seconds you shave off
            elevator travel is, roughly, one extra scoring cycle over the course of a match.
            Teams that calculate their elevator profile before building always outperform teams
            that tune it by feel during elims.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Cycle time math',
      content: (
        <p>
          A typical FRC teleop cycle: extend elevator (0.8 s) → intake game piece (0.5 s) →
          retract (0.8 s) → score (0.3 s) = 2.4 s per cycle. That's 25 cycles in 60 seconds.
          Cut elevator travel to 0.6 s each way and you get 27 cycles — two free scores with
          zero change to driving strategy.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Does the elevator reach top speed?</h3>
          <p>
            Before you can compute travel time, you need to know whether the carriage actually
            reaches its configured maximum speed or whether the travel distance is so short it
            spends the entire move accelerating and decelerating.
          </p>
          <p>
            Use <M tex="v^2 = 2a \Delta x" /> to find the speed the carriage would reach if it
            accelerated over the full travel distance. If that number exceeds your max speed
            setting, the carriage does reach top speed (trapezoidal profile). If not, the profile
            is triangular and you need a different time calculation.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Speed check (triangular vs trapezoidal)',
      latex: String.raw`v_{peak} = \sqrt{2 \, a \, \Delta x}`,
      variables: [
        { symbol: 'v_{peak}', meaning: 'Max speed reachable over full travel', unit: 'm/s' },
        { symbol: 'a', meaning: 'Acceleration (and deceleration)', unit: 'm/s²' },
        { symbol: '\\Delta x', meaning: 'Total travel distance', unit: 'm' },
      ],
      explanation:
        'If v_peak > v_max (your configured limit), the profile is trapezoidal. If v_peak ≤ v_max, the elevator never reaches top speed and the profile is triangular.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Trapezoidal profile travel time</h3>
          <p>
            A trapezoidal motion profile has three phases: accelerate to top speed, cruise at
            top speed, decelerate to a stop. The distances for each phase determine the time.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Accel phase distance: <M tex="d_{accel} = v_{max}^2 / (2a)" />
            </li>
            <li>
              Decel phase distance: same as accel (symmetric)
            </li>
            <li>
              Cruise distance: <M tex="d_{cruise} = \Delta x - 2 \, d_{accel}" />
            </li>
          </ul>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Trapezoidal travel time',
      latex: String.raw`t_{total} = \frac{2 v_{max}}{a} + \frac{\Delta x - v_{max}^2/a}{v_{max}}`,
      variables: [
        { symbol: 't_{total}', meaning: 'Total travel time', unit: 's' },
        { symbol: 'v_{max}', meaning: 'Configured maximum speed', unit: 'm/s' },
        { symbol: 'a', meaning: 'Acceleration/deceleration magnitude', unit: 'm/s²' },
        { symbol: '\\Delta x', meaning: 'Total travel distance', unit: 'm' },
      ],
      explanation:
        'The first term is time spent accelerating + decelerating. The second term is cruise time. Only valid when v_peak > v_max.',
    },

    {
      type: 'formula',
      label: 'Triangular profile travel time',
      latex: String.raw`t_{total} = 2\sqrt{\frac{\Delta x}{a}}`,
      variables: [
        { symbol: 't_{total}', meaning: 'Total travel time', unit: 's' },
        { symbol: '\\Delta x', meaning: 'Total travel distance', unit: 'm' },
        { symbol: 'a', meaning: 'Acceleration', unit: 'm/s²' },
      ],
      explanation:
        'Use this when the elevator cannot reach configured top speed over the available distance (v_peak ≤ v_max).',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'WPILib TrapezoidProfile',
      content: (
        <p>
          WPILib's <code>TrapezoidProfile</code> class does exactly this math at runtime, generating
          a setpoint stream for your PID controller. The inputs are <code>maxVelocity</code> and{' '}
          <code>maxAcceleration</code> — the same two numbers you plug into these formulas. Calculate
          the profile first so your WPILib constants are rooted in physics, not vibes.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Elevator travel time with trapezoidal profile',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            An elevator travels <strong>1.2 m</strong>. Max speed is <strong>2 m/s</strong>,
            acceleration is <strong>4 m/s²</strong>. Does the carriage reach top speed? What is
            the total travel time?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Check whether top speed is reachable',
          latex: String.raw`v_{peak} = \sqrt{2 \times 4 \times 1.2} = \sqrt{9.6} \approx 3.10 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              3.10 m/s {'>'} 2 m/s, so the carriage does reach the 2 m/s limit. The profile is
              trapezoidal.
            </p>
          ),
        },
        {
          label: 'Calculate accel/decel distance',
          latex: String.raw`d_{accel} = \frac{v_{max}^2}{2a} = \frac{4}{8} = 0.5 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The carriage needs 0.5 m to accelerate to 2 m/s and another 0.5 m to decelerate.
              That's 1.0 m total, leaving 0.2 m of cruise distance.
            </p>
          ),
        },
        {
          label: 'Time for accel + decel',
          latex: String.raw`t_{accel} = \frac{v_{max}}{a} = \frac{2}{4} = 0.5 \text{ s each} \Rightarrow 1.0 \text{ s total}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each phase (accel or decel) takes 0.5 s. Both together: 1.0 s.
            </p>
          ),
        },
        {
          label: 'Cruise time',
          latex: String.raw`t_{cruise} = \frac{d_{cruise}}{v_{max}} = \frac{0.2}{2} = 0.1 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The 0.2 m cruise phase at 2 m/s takes 0.1 s.
            </p>
          ),
        },
        {
          label: 'Total travel time',
          latex: String.raw`t_{total} = 1.0 + 0.1 = 1.1 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A 1.2 m elevator with 4 m/s² acceleration and 2 m/s top speed takes{' '}
              <strong>1.1 seconds</strong>. Round-trip (extend + retract): 2.2 s.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Yes, the carriage reaches top speed. Total travel time is <strong>1.1 s</strong>{' '}
          (0.5 s accel + 0.1 s cruise + 0.5 s decel).
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'elevator-response',
      title: 'Elevator Response Simulator',
      description: 'Adjust mass, gear ratio, and profile limits to see how they affect travel time.',
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Speed check',
          latex: String.raw`v_{peak} = \sqrt{2 a \Delta x}`,
          note: 'If v_peak > v_max → trapezoidal',
        },
        {
          label: 'Trap. travel time',
          latex: String.raw`t = \tfrac{2v_{max}}{a} + \tfrac{\Delta x - v_{max}^2/a}{v_{max}}`,
          note: 'Accel/decel + cruise',
        },
        {
          label: 'Triangular time',
          latex: String.raw`t = 2\sqrt{\Delta x / a}`,
          note: 'When elevator never hits v_max',
        },
        {
          label: 'Accel distance',
          latex: String.raw`d_{accel} = v_{max}^2 / (2a)`,
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'An elevator has max speed 3 m/s and acceleration 6 m/s². It needs to travel 0.6 m. Does it reach top speed?',
          options: [
            'Yes — v_peak = 2.68 m/s which is less than 3 m/s, so it is triangular',
            'No — v_peak = 2.68 m/s which is less than 3 m/s, so it never hits 3 m/s',
            'Yes — v_peak = 3.6 m/s which exceeds 3 m/s',
            'Cannot be determined without knowing motor power',
          ],
          correctIndex: 1,
          explanation: 'v_peak = sqrt(2 × 6 × 0.6) = sqrt(7.2) ≈ 2.68 m/s. Since 2.68 < 3, the carriage never reaches configured top speed and the profile is triangular.',
        },
        {
          question: 'An elevator travels 1.0 m with max speed 2 m/s and acceleration 4 m/s². What is the total travel time?',
          options: [
            '0.5 s',
            '1.0 s',
            '1.25 s',
            '1.5 s',
          ],
          correctIndex: 1,
          explanation: 'd_accel = 2²/(2×4) = 0.5 m each way. Cruise = 1.0 − 1.0 = 0 m. So the profile is exactly trapezoidal with zero cruise: t = 2×(2/4) + 0 = 1.0 s.',
        },
        {
          question: 'Which motion profile phase is eliminated when an elevator travels a very short distance?',
          options: [
            'Acceleration phase',
            'Deceleration phase',
            'Cruise (constant speed) phase',
            'None — all three phases always exist',
          ],
          correctIndex: 2,
          explanation: 'When the travel distance is short, the elevator never reaches max speed, so there is no constant-speed cruise phase. The profile becomes triangular: only acceleration and deceleration.',
        },
        {
          question: 'Shaving 0.2 s off each elevator extension and retraction affects cycle time by how much per cycle?',
          options: [
            '0.1 s per cycle',
            '0.2 s per cycle',
            '0.4 s per cycle',
            '0.6 s per cycle',
          ],
          correctIndex: 2,
          explanation: 'Each cycle has one extension and one retraction. Saving 0.2 s on each = 0.4 s saved per full cycle.',
        },
      ],
    },
  ],
};
