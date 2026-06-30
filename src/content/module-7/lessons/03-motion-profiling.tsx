import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'motion-profiling',
  title: 'Motion Profiling & Trajectory Following',
  subtitle: 'Smooth, repeatable mechanism motion through constrained velocity and acceleration profiles.',
  order: 3,
  estimatedMinutes: 30,
  tags: ['motion-profile', 'trapezoidal', 'trajectory', 'ProfiledPIDController', 'PathPlanner'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            When you set a raw position setpoint on a PID controller, you are telling the mechanism
            to jump instantly to the target. The controller sees a huge error on the first loop cycle
            and commands full motor output — the result is violent, unpredictable motion that stresses
            gears, belts, and game pieces, and often causes the mechanism to overshoot. A{' '}
            <strong>motion profile</strong> solves this by constraining how fast the setpoint itself
            moves, so velocity and acceleration never exceed the mechanism's limits.
          </p>
          <p>
            Instead of "go to 1.5 m now," a profiled controller says "ramp velocity up at 4 m/s²,
            cruise at 2 m/s, then decelerate at 4 m/s² — arrive at 1.5 m in 1.25 seconds." The PID
            loop tracks this moving setpoint, and because the setpoint never demands physically
            impossible accelerations, the motor current stays predictable and the motion is smooth
            and repeatable every match.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'ProfiledPIDController in WPILib handles this automatically',
      content: (
        <p>
          WPILib's <code>ProfiledPIDController</code> and <code>TrapezoidProfile</code> classes
          implement trapezoidal profiling directly. You supply <code>TrapezoidProfile.Constraints</code>{' '}
          with a max velocity and max acceleration, and the controller generates the profile
          internally on every <code>calculate()</code> call. Understanding the math here lets you set
          constraints correctly and diagnose when profiles take longer than expected — usually because
          the physical mechanism can't achieve the constraints you entered.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Trapezoidal profile — three phases
          </h3>
          <p>
            The trapezoidal profile gets its name from the shape of the velocity-vs-time graph: a
            trapezoid with a flat cruise section between two ramps. There are three phases:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Phase 1 — Acceleration:</strong> Velocity ramps from 0 to{' '}
              <M tex="v_{max}" /> at rate <M tex="a_{max}" />. Time:{' '}
              <M tex="t_{accel} = v_{max}/a_{max}" />. Distance covered:{' '}
              <M tex="d_{accel} = v_{max}^2/(2a_{max})" />.
            </li>
            <li>
              <strong>Phase 2 — Cruise:</strong> Velocity held at <M tex="v_{max}" />. Time:{' '}
              <M tex="t_{cruise} = (d_{total} - 2\,d_{accel})/v_{max}" />. Only exists if the
              total distance is large enough that the mechanism can reach <M tex="v_{max}" /> and
              still have room to decelerate.
            </li>
            <li>
              <strong>Phase 3 — Deceleration:</strong> Mirror of Phase 1 — velocity ramps back
              to zero at rate <M tex="a_{max}" />. Symmetric with the acceleration phase.
            </li>
          </ul>
          <p>
            Total time: <M tex="t_{total} = 2\,t_{accel} + t_{cruise}" />. If you know the
            mechanism's physical limits (from a SysId characterization or a measured timer), you
            can predict exactly how long every move will take before you build it.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Trapezoidal Profile Timing',
      latex: String.raw`t_{accel} = \frac{v_{max}}{a_{max}}, \quad d_{accel} = \frac{v_{max}^2}{2\,a_{max}}, \quad t_{total} = 2\,t_{accel} + \frac{d_{total} - 2\,d_{accel}}{v_{max}}`,
      variables: [
        { symbol: 't_{accel}',   meaning: 'Time to ramp from 0 to v_max',          unit: 's' },
        { symbol: 'd_{accel}',   meaning: 'Distance covered during one ramp phase', unit: 'm' },
        { symbol: 'v_{max}',     meaning: 'Maximum (cruise) velocity constraint',   unit: 'm/s' },
        { symbol: 'a_{max}',     meaning: 'Maximum acceleration constraint',        unit: 'm/s²' },
        { symbol: 'd_{total}',   meaning: 'Total distance to travel',               unit: 'm' },
        { symbol: 't_{total}',   meaning: 'Total profile duration',                 unit: 's' },
      ],
      explanation:
        'The cruise-phase term (d_total − 2·d_accel)/v_max is only used when d_total > 2·d_accel. If the mechanism cannot reach cruise speed before it must decelerate, the profile degenerates to a triangle (see below).',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Triangle profile — short moves
          </h3>
          <p>
            When the total travel distance is less than <M tex="2\,d_{accel}" />, the mechanism
            cannot reach <M tex="v_{max}" /> before it must begin decelerating. The velocity-time
            graph becomes a triangle rather than a trapezoid. The profile peaks at a lower speed{' '}
            <M tex="v_{peak}" /> determined by the available distance:
          </p>
          <p>
            <M tex="v_{peak} = \sqrt{a_{max} \cdot d_{total}}" />. The total time is{' '}
            <M tex="t_{total} = 2\sqrt{d_{total}/a_{max}}" />.
          </p>
          <p>
            Triangle profiles matter most for small setpoint corrections — if your arm needs to
            move only 5° and your <M tex="v_{max}" /> would require 30° to reach, the profile is
            always a triangle for that move. Your feedforward is still correct because the profile
            generates the actual velocity and acceleration at each timestep, not the constraint
            values.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Triangle Profile (Short Move)',
      latex: String.raw`v_{peak} = \sqrt{a_{max} \cdot d_{total}}, \qquad t_{total} = 2\sqrt{\frac{d_{total}}{a_{max}}}`,
      variables: [
        { symbol: 'v_{peak}',  meaning: 'Actual peak velocity (less than v_max)',   unit: 'm/s' },
        { symbol: 'a_{max}',   meaning: 'Maximum acceleration constraint',          unit: 'm/s²' },
        { symbol: 'd_{total}', meaning: 'Total distance to travel',                 unit: 'm' },
        { symbol: 't_{total}', meaning: 'Total profile duration',                   unit: 's' },
      ],
      explanation:
        'Used automatically when d_total < 2·d_accel. The profile peaks at v_peak < v_max and deceleration begins immediately after. ProfiledPIDController detects this and switches profile shapes transparently.',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Constraints must reflect what the mechanism can actually achieve',
      content: (
        <p>
          Setting <code>v_max = 5 m/s</code> when your elevator can only reach 2.5 m/s at full
          voltage doesn't make it faster — it makes the profile inaccurate. The controller thinks
          the mechanism is cruising at 5 m/s and sets feedforward accordingly, but the actual
          mechanism is somewhere around 2.5 m/s. The resulting tracking error drives the feedback
          terms hard, causing oscillation and motor current spikes. Use SysId or a stopwatch test
          to measure the true free speed and maximum acceleration, then set constraints at 80–90%
          of those values.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            2D trajectory following
          </h3>
          <p>
            For drivetrain autonomous paths, the same principle extends to two dimensions. A{' '}
            <strong>trajectory</strong> is a time-stamped sequence of robot <strong>poses</strong>{' '}
            — each pose is a tuple <M tex="(x, y, \theta)" /> describing the robot's field position
            and heading at a specific time. Tools like PathPlanner and Choreo let you draw a path in
            a GUI and export a trajectory file; WPILib reads it and provides the reference pose at
            each time step during autonomous.
          </p>
          <p>
            The key insight for feedforward accuracy: the trajectory also provides a{' '}
            <strong>reference velocity</strong> and <strong>reference acceleration</strong> at every
            time step. Those values go directly into the drivetrain feedforward (
            <M tex="k_S \cdot \text{sign}(v) + k_V \cdot v + k_A \cdot a" />) on every loop cycle,
            producing the correct motor output before any feedback correction. The path-following
            controller (Ramsete for differential drive, holonomic PID for swerve, LTV for
            state-space) handles only the residual pose error.
          </p>
          <p>
            The result is that trajectory following on a well-characterized robot is mostly
            feedforward with small feedback corrections — the same architecture as a tuned
            ProfiledPIDController on a single axis, just extended to two dimensions and a heading.
          </p>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'Elevator motion profile calculation',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            An elevator must travel <strong>1.5 m</strong> from the ground stage to the high goal.
          </p>
          <p>
            Constraints: <strong>v_max = 2.0 m/s</strong>, <strong>a_max = 4.0 m/s²</strong>.
          </p>
          <p className="text-slate-500">
            Determine the profile shape and total move time.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Acceleration phase time',
          latex: String.raw`t_{accel} = \frac{v_{max}}{a_{max}} = \frac{2.0}{4.0} = 0.5 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The elevator takes 0.5 seconds to ramp from rest to cruise speed.
            </p>
          ),
        },
        {
          label: 'Distance covered during acceleration',
          latex: String.raw`d_{accel} = \frac{v_{max}^2}{2\,a_{max}} = \frac{(2.0)^2}{2 \times 4.0} = \frac{4.0}{8.0} = 0.5 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each ramp phase covers 0.5 m. Two ramp phases = 1.0 m total.
            </p>
          ),
        },
        {
          label: 'Check for cruise phase',
          latex: String.raw`2\,d_{accel} = 2 \times 0.5 = 1.0 \text{ m} < 1.5 \text{ m} = d_{total} \implies \text{trapezoidal ✓}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Since 1.0 m &lt; 1.5 m, the elevator has room to cruise at v_max. The profile is
              trapezoidal (not a triangle).
            </p>
          ),
        },
        {
          label: 'Cruise phase',
          latex: String.raw`d_{cruise} = 1.5 - 2(0.5) = 0.5 \text{ m}, \quad t_{cruise} = \frac{0.5}{2.0} = 0.25 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The elevator cruises at 2.0 m/s for 0.5 m, which takes 0.25 seconds.
            </p>
          ),
        },
        {
          label: 'Total profile time',
          latex: String.raw`t_{total} = 2\,t_{accel} + t_{cruise} = 2(0.5) + 0.25 = 1.25 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The full 1.5 m move completes in exactly 1.25 seconds with these constraints —
              predictable before any hardware is built.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Profile shape: <strong>trapezoidal</strong>. Phases: 0.5 s accel → 0.25 s cruise → 0.5 s
          decel. Total time: <strong>1.25 s</strong>. If the elevator consistently takes longer on
          the robot, the actual a_max is lower than 4.0 m/s² and constraints should be reduced.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Accel time',
          latex: String.raw`t_{accel} = v_{max} / a_{max}`,
          note: 'Time from 0 to cruise speed',
        },
        {
          label: 'Accel distance',
          latex: String.raw`d_{accel} = v_{max}^2 / (2\,a_{max})`,
          note: 'Distance per ramp phase',
        },
        {
          label: 'Cruise time',
          latex: String.raw`t_{cruise} = (d_{total} - 2\,d_{accel}) / v_{max}`,
          note: 'Only when d_total > 2·d_accel',
        },
        {
          label: 'Total time (trapezoidal)',
          latex: String.raw`t_{total} = 2\,t_{accel} + t_{cruise}`,
          note: 'Full move duration',
        },
        {
          label: 'Triangle (short move)',
          latex: String.raw`v_{peak} = \sqrt{a_{max}\,d_{total}}, \quad t = 2\sqrt{d/a_{max}}`,
          note: 'When d_total < 2·d_accel',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'An elevator has v_max = 3 m/s and a_max = 6 m/s². How long does it take to ramp from rest to cruise speed?',
          options: ['0.5 s', '1.0 s', '2.0 s', '3.0 s'],
          correctIndex: 0,
          explanation: 't_accel = v_max / a_max = 3.0 / 6.0 = 0.5 s. Ramp time depends only on the ratio of max velocity to max acceleration — a faster acceleration limit reduces ramp time regardless of total distance.',
        },
        {
          question: 'A mechanism must travel 0.2 m. At the constraint v_max, the accel phase alone covers d_accel = 0.45 m. What profile shape results?',
          options: [
            'Trapezoidal — the mechanism reaches v_max',
            'Triangle — the mechanism never reaches v_max',
            'Sinusoidal',
            'S-curve',
          ],
          correctIndex: 1,
          explanation: 'Since d_total (0.2 m) < 2·d_accel (0.9 m), the mechanism cannot reach v_max before it must begin decelerating. The profile becomes a triangle with a lower peak velocity determined by v_peak = sqrt(a_max × d_total).',
        },
        {
          question: 'What is the main advantage of using a motion-profiled setpoint versus a raw position setpoint in a PID loop?',
          options: [
            'The PID gains Kp, Ki, Kd become unnecessary',
            'Velocity and acceleration are constrained so the mechanism moves smoothly without overshoot or mechanical stress',
            'The motor runs at constant current throughout the move',
            'The trajectory length is minimized',
          ],
          correctIndex: 1,
          explanation: 'A raw setpoint jump causes a massive initial error, commanding full motor output and producing violent motion. A profiled setpoint moves gradually within physical limits, so the PID error stays small throughout, the motion is smooth, and peak current is controlled.',
        },
        {
          question: 'In 2D trajectory following, what does the trajectory provide at each time step that makes feedforward control accurate?',
          options: [
            'Only the target heading angle θ',
            'A target pose (x, y, θ) AND the reference velocity and acceleration at that point in time',
            'The motor voltage command directly',
            'A sensor fusion pose estimate',
          ],
          correctIndex: 1,
          explanation: 'The trajectory stores time-stamped poses plus the reference velocity and acceleration at each point. The reference velocity and acceleration go directly into the drivetrain feedforward (kS·sign(v) + kV·v + kA·a), making follower output accurate without relying solely on feedback to drive the robot.',
        },
      ],
    },
  ],
};
