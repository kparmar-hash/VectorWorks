import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'pid-control',
  title: 'PID Control',
  subtitle: 'Proportional, integral, derivative — the feedback loop every FRC mechanism uses.',
  order: 1,
  estimatedMinutes: 30,
  tags: ['PID', 'control', 'error', 'tuning', 'feedback'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Every mechanism in your robot that moves to a target position or velocity uses a
            feedback controller. The most common one in FRC is PID — Proportional, Integral,
            Derivative. WPILib's <code>PIDController</code> does the loop for you, but choosing
            Kp, Ki, and Kd without understanding what they do is guessing. This lesson explains
            what each term computes, why each one matters, and a systematic process for tuning.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'PID is everywhere in your robot',
      content: (
        <p>
          Drivetrain heading hold, arm position control, elevator position control, flywheel
          velocity control, turret tracking — all of these use PID or a variant of it. The
          parameters have different names in different APIs (Kp, P, proportional gain) but the
          math underneath is always the same.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The error signal</h3>
          <p>
            Every PID controller starts with a single number: the <strong>error</strong> — how far
            the mechanism is from where you want it to be.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Error',
      latex: String.raw`e(t) = \text{setpoint} - \text{measurement}`,
      variables: [
        { symbol: 'e(t)',          meaning: 'Error at time t',             unit: 'same as setpoint units' },
        { symbol: '\\text{setpoint}',   meaning: 'Target value',           unit: 'position (m, rad) or velocity (m/s, RPM)' },
        { symbol: '\\text{measurement}', meaning: 'Current sensor reading', unit: 'same as setpoint' },
      ],
      explanation:
        'Positive error means the mechanism is below the target; the controller should apply positive output. Negative error means above target; apply negative output. The sign convention must be consistent throughout the control loop.',
    },

    {
      type: 'formula',
      label: 'Full PID Output',
      latex: String.raw`u(t) = K_p \cdot e(t) + K_i \int_0^t e(\tau)\,d\tau + K_d \frac{de}{dt}`,
      variables: [
        { symbol: 'u(t)',  meaning: 'Controller output (motor voltage or duty cycle)', unit: 'V or —' },
        { symbol: 'K_p',   meaning: 'Proportional gain',                                unit: '—' },
        { symbol: 'K_i',   meaning: 'Integral gain',                                    unit: '—' },
        { symbol: 'K_d',   meaning: 'Derivative gain',                                  unit: '—' },
        { symbol: 'e(t)',  meaning: 'Error at current time',                             unit: 'same as setpoint' },
      ],
      explanation:
        'In practice (discrete time): u[k] = Kp·e[k] + Ki·(sum of e × dt) + Kd·(e[k] − e[k−1])/dt. WPILib PIDController handles the timing at 50 Hz (20 ms loop) by default.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What each term does</h3>
          <p>
            <strong>P (Proportional):</strong> Output is proportional to how far away you are.
            Big error = big correction. The bigger Kp, the faster the response — but too large and
            the mechanism overshoots and oscillates. Most FRC mechanisms start here.
          </p>
          <p>
            <strong>I (Integral):</strong> Output accumulates over time if error persists. This
            eliminates steady-state error (e.g., an arm that hangs 2° below target due to gravity
            with P only). Too much Ki causes slow, sustained oscillation. Always clamp the
            integral sum to prevent <em>wind-up</em>.
          </p>
          <p>
            <strong>D (Derivative):</strong> Output is proportional to how fast the error is
            changing. It damps overshoot — the more quickly the mechanism approaches the setpoint,
            the more the D term pushes back. However, D amplifies sensor noise; always pair it with
            a low-pass filter or use a small value.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Integral wind-up can cause dangerous overshoot',
      content: (
        <p>
          If your mechanism is physically blocked (e.g., arm held by a game piece, elevator
          against a hard stop), the error signal stays nonzero and the integral keeps accumulating.
          When the block is removed, the enormous integral term drives a violent overshoot. Always
          clamp the integral to a reasonable range in your motor controller or software PID.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Tuning order: P → D → I',
      content: (
        <p>
          Start with Kp alone. Increase until the mechanism responds well but begins to oscillate.
          Back off Kp by 30%. Add Kd to dampen oscillation — increase until overshoot disappears.
          Only add Ki if there is a persistent steady-state error that P+D can't eliminate (common
          with gravity loads on arms not using feedforward).
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'pid-tuning',
      title: 'PID Tuning Playground',
      description: 'Adjust Kp, Ki, Kd and watch a mechanism settle, oscillate, or go unstable in real time.',
    },

    {
      type: 'worked-example',
      title: 'Computing one PID step for an arm',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            An arm should reach <strong>90°</strong>. Currently at <strong>20°</strong> at t=0.
            After one 20 ms loop: arm has moved to <strong>25°</strong>.
          </p>
          <p>
            Gains: <M tex="K_p = 0.05" />, <M tex="K_i = 0" />, <M tex="K_d = 0.002" />,{' '}
            <M tex="dt = 0.02 \text{ s}" />.
          </p>
          <p className="text-slate-500">Find the P output, D output, and total controller output at t=1 (after the arm moved to 25°).</p>
        </div>
      ),
      steps: [
        {
          label: 'Compute error at t=0 (initial)',
          latex: String.raw`e_0 = 90° - 20° = 70°`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This was the error at the previous timestep — needed for the derivative calculation.
            </p>
          ),
        },
        {
          label: 'Compute error at t=1 (current)',
          latex: String.raw`e_1 = 90° - 25° = 65°`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The arm moved 5° toward the target, so error decreased from 70° to 65°.
            </p>
          ),
        },
        {
          label: 'P term',
          latex: String.raw`u_P = K_p \times e_1 = 0.05 \times 65 = 3.25`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The proportional term outputs 3.25 units of motor output. This scales with however
              large the error remains.
            </p>
          ),
        },
        {
          label: 'D term',
          latex: String.raw`u_D = K_d \times \frac{e_1 - e_0}{dt} = 0.002 \times \frac{65 - 70}{0.02} = 0.002 \times (-250) = -0.5`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The derivative is negative because error is decreasing (arm approaching target). The
              D term pushes back against the motion, damping it. This prevents overshoot.
            </p>
          ),
        },
        {
          label: 'Total output',
          latex: String.raw`u = u_P + u_D = 3.25 + (-0.5) = 2.75`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The integral term is zero here (Ki=0). The net output is 2.75 in motor output units
              (what that means in volts depends on your motor controller's scale factor).
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          P term: <strong>+3.25</strong> (drives arm toward target). D term: <strong>−0.50</strong>{' '}
          (brakes the motion). Total output: <strong>2.75</strong>. The D term is already working
          — it reduces output when the arm is approaching quickly, which prevents overshoot.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Error',
          latex: String.raw`e = \text{setpoint} - \text{measurement}`,
          note: 'Keep sign convention consistent',
        },
        {
          label: 'P term',
          latex: String.raw`u_P = K_p \cdot e`,
          note: 'Bigger Kp → faster but may oscillate',
        },
        {
          label: 'I term (discrete)',
          latex: String.raw`u_I = K_i \cdot \sum e \cdot dt`,
          note: 'Clamp sum to prevent wind-up',
        },
        {
          label: 'D term (discrete)',
          latex: String.raw`u_D = K_d \cdot \frac{e_k - e_{k-1}}{dt}`,
          note: 'Damps overshoot; filter first',
        },
        {
          label: 'Total output',
          latex: String.raw`u = u_P + u_I + u_D`,
          note: 'Clamp to [-1, 1] or [-12, 12]V',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'An arm setpoint is 45° and the current measurement is 60°. What is the error?',
          options: ['−15°', '+15°', '+105°', '+45°'],
          correctIndex: 0,
          explanation: 'Error = setpoint − measurement = 45 − 60 = −15°. Negative error means the mechanism is above (or past) the target — the controller should push it back down.',
        },
        {
          question: 'Which PID term is most responsible for eliminating steady-state error when a mechanism consistently stops a few degrees short of its target?',
          options: ['Kp — increase proportional gain', 'Ki — the integral accumulates and drives out the remaining offset', 'Kd — the derivative corrects for the position lag', 'None — this is a hardware problem'],
          correctIndex: 1,
          explanation: 'Steady-state error occurs when the P term alone cannot overcome friction or gravity. The integral term accumulates the persistent error over time and adds it to the output until the error reaches zero.',
        },
        {
          question: 'The derivative term (Kd) in a PID loop outputs a large negative value even though the mechanism hasn\'t reached its setpoint yet. What does this likely mean?',
          options: [
            'The setpoint was set incorrectly',
            'The mechanism is approaching the setpoint quickly and the D term is braking it to prevent overshoot',
            'The integral is winding up',
            'The sensor is reading backward',
          ],
          correctIndex: 1,
          explanation: 'D = Kd × (Δe/Δt). If error is decreasing rapidly (mechanism closing in on target), Δe/Δt is large and negative, producing a large negative D output. This is correct behavior — it damps the approach and prevents overshoot.',
        },
        {
          question: 'What is integral wind-up and why is it dangerous?',
          options: [
            'When Ki is too large and the mechanism oscillates slowly',
            'When the integral term accumulates while the mechanism is blocked, then drives violent overshoot when unblocked',
            'When the motor wraps the cable around the mechanism',
            'When the setpoint changes too quickly for the I term to track',
          ],
          correctIndex: 1,
          explanation: 'If the mechanism is physically blocked (e.g., against a hard stop), error persists and the integral keeps growing. When the block is released, the large accumulated integral output causes a violent overshoot. Clamping the integral sum prevents this.',
        },
      ],
    },
  ],
};
