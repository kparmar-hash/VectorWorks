import { type Lesson } from '../../../types/curriculum';

export const lesson02: Lesson = {
  id: 'feedforward',
  title: 'Feedforward Control',
  subtitle: 'Predict what the motor needs before the error happens — kS, kV, kA, and gravity compensation.',
  order: 2,
  estimatedMinutes: 25,
  tags: ['feedforward', 'kS', 'kV', 'kA', 'gravity-ff'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            A feedback controller (PID) reacts to error — it waits for the mechanism to be wrong,
            then corrects. A feedforward controller <em>predicts</em> what output is needed before
            any error occurs. The best control systems use both: feedforward to get most of the
            way there, PID to correct the remaining small error.
          </p>
          <p>
            For most FRC mechanisms, feedforward alone gets you to within a few percent of the
            setpoint. Adding a small Kp on top of that handles the rest. Teams that use only PID
            without feedforward fight constant oscillation and lag that feedforward would eliminate
            entirely.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'WPILib SysId characterizes your mechanism automatically',
      content: (
        <p>
          WPILib's System Identification tool (SysId) runs your mechanism through a series of
          voltage ramps and measures the response. It outputs kS, kV, and kA directly. Understanding
          the math here tells you what SysId is measuring and why the numbers it gives you are the
          right ones to use.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The three feedforward terms</h3>
          <p>
            <strong>kS (static friction):</strong> The minimum voltage needed to overcome static
            friction and start moving. Applied in the direction of commanded motion (sign of
            velocity command). Without kS, the motor stalls at low commanded outputs because static
            friction consumes the voltage before any motion occurs.
          </p>
          <p>
            <strong>kV (velocity feedforward):</strong> Voltage proportional to the target velocity.
            Derived from the motor's back-EMF model — at a given speed, the motor needs a
            predictable voltage to sustain it. kV = 1 / (free speed in rad/s per volt at the
            mechanism output).
          </p>
          <p>
            <strong>kA (acceleration feedforward):</strong> Voltage proportional to target
            acceleration. Required to overcome inertia during speed changes. Often small enough
            to omit for slow mechanisms, but critical for high-acceleration drivetrains.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Drivetrain Feedforward',
      latex: String.raw`u_{ff} = k_S \cdot \text{sign}(v) + k_V \cdot v + k_A \cdot a`,
      variables: [
        { symbol: 'u_{ff}',          meaning: 'Feedforward voltage output',       unit: 'V' },
        { symbol: 'k_S',             meaning: 'Static friction voltage',           unit: 'V' },
        { symbol: '\\text{sign}(v)', meaning: '+1 if moving forward, −1 if backward', unit: '—' },
        { symbol: 'k_V',             meaning: 'Velocity gain',                     unit: 'V·s/m' },
        { symbol: 'v',               meaning: 'Target velocity',                   unit: 'm/s' },
        { symbol: 'k_A',             meaning: 'Acceleration gain',                 unit: 'V·s²/m' },
        { symbol: 'a',               meaning: 'Target acceleration',               unit: 'm/s²' },
      ],
      explanation:
        'This is the standard SimpleMotorFeedforward model used in WPILib. For arms, add a gravity compensation term. For pure velocity control (flywheel), kA can often be ignored.',
    },

    {
      type: 'formula',
      label: 'Arm Gravity Feedforward',
      latex: String.raw`u_{ff,arm} = k_G \cdot \cos\theta`,
      variables: [
        { symbol: 'k_G',      meaning: 'Gravity compensation voltage (voltage to hold horizontal)', unit: 'V' },
        { symbol: '\\theta',  meaning: 'Arm angle from horizontal',                                  unit: 'rad' },
      ],
      explanation:
        'kG is the voltage required to hold the arm stationary at horizontal (worst case gravity torque). As the arm moves toward vertical, cos(θ) → 0 and less voltage is needed. This term replaces the "I" term for gravity compensation — it\'s more predictable and faster.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'FF + small P beats pure PID for most mechanisms',
      content: (
        <p>
          Set up feedforward first. Then add a small Kp (and sometimes Kd) to eliminate the small
          residual error. This architecture is more stable, more predictable, and easier to tune
          than fighting large oscillations with pure PID gains. WPILib's{' '}
          <code>ArmFeedforward</code> and <code>SimpleMotorFeedforward</code> classes implement
          these models directly.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Drivetrain FF + P velocity control',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Drivetrain characterized: <strong>kS = 0.15 V</strong>,{' '}
            <strong>kV = 2.1 V·s/m</strong>, <strong>kA = 0.30 V·s²/m</strong>.
          </p>
          <p>
            Command: <strong>v = 3.0 m/s</strong>, <strong>a = 1.0 m/s²</strong>.
          </p>
          <p>
            Velocity error at this instant: <strong>+0.1 m/s</strong> (robot is 0.1 m/s too slow).{' '}
            <strong>Kp = 2.0 V·s/m</strong>.
          </p>
          <p className="text-slate-500">Find feedforward voltage, P correction, and total output.</p>
        </div>
      ),
      steps: [
        {
          label: 'kS term (commanding forward motion)',
          latex: String.raw`u_{kS} = k_S \cdot \text{sign}(v) = 0.15 \times (+1) = +0.15 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Since the robot is commanded forward, sign(v) = +1. Static friction always opposes
              the direction of motion.
            </p>
          ),
        },
        {
          label: 'kV term',
          latex: String.raw`u_{kV} = k_V \cdot v = 2.1 \times 3.0 = 6.30 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This is the voltage needed to sustain 3 m/s against back-EMF. It's the dominant term
              at cruise speed.
            </p>
          ),
        },
        {
          label: 'kA term',
          latex: String.raw`u_{kA} = k_A \cdot a = 0.30 \times 1.0 = 0.30 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This provides the extra voltage needed to accelerate the robot's mass. At constant
              speed (a=0), this term disappears.
            </p>
          ),
        },
        {
          label: 'Total feedforward',
          latex: String.raw`u_{ff} = 0.15 + 6.30 + 0.30 = 6.75 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The feedforward alone puts 6.75 V on the motor, which should get velocity close to
              the target without any sensor feedback.
            </p>
          ),
        },
        {
          label: 'P feedback correction',
          latex: String.raw`u_P = K_p \cdot e_v = 2.0 \times 0.1 = 0.20 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The robot is 0.1 m/s too slow. The P term adds a small corrective voltage to close
              that gap. Notice how small Kp can be when feedforward does most of the work.
            </p>
          ),
        },
        {
          label: 'Total output',
          latex: String.raw`u_{total} = u_{ff} + u_P = 6.75 + 0.20 = 6.95 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total is within the 12 V battery range. The feedforward provides 97% of the
              necessary output; feedback corrects the remaining 3%.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Feedforward: <strong>6.75 V</strong>. P feedback: <strong>+0.20 V</strong>. Total output:{' '}
          <strong>6.95 V</strong>. The feedforward handles nearly all of the required output,
          leaving the P term to make small corrections only.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Drivetrain FF',
          latex: String.raw`u = k_S\cdot\text{sgn}(v) + k_V\cdot v + k_A\cdot a`,
          note: 'kS in V, kV in V·s/m, kA in V·s²/m',
        },
        {
          label: 'Arm gravity FF',
          latex: String.raw`u_{gravity} = k_G \cos\theta`,
          note: 'kG = voltage to hold arm horizontal',
        },
        {
          label: 'kV interpretation',
          latex: String.raw`k_V \approx \frac{V_{supply}}{\omega_{free,output}}`,
          note: 'Inverse of free speed per volt',
        },
        {
          label: 'Total output',
          latex: String.raw`u = u_{ff} + K_p \cdot e`,
          note: 'FF does most; P corrects residual',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'What does the kS (static friction) feedforward term do?',
          options: [
            'Adds voltage proportional to target velocity',
            'Accounts for the minimum voltage needed to overcome static friction before motion starts',
            'Compensates for gravity on an arm mechanism',
            'Reduces integral wind-up in the PID controller',
          ],
          correctIndex: 1,
          explanation: 'kS is the minimum voltage required to break static friction. Without it, low velocity commands produce no motion because static friction consumes the voltage entirely. It is always applied in the direction of commanded motion.',
        },
        {
          question: 'A drivetrain has kS=0.12V, kV=2.0 V·s/m, kA=0. What is the feedforward output when commanding 4 m/s forward at constant speed?',
          options: ['8.0 V', '8.12 V', '7.88 V', '2.12 V'],
          correctIndex: 1,
          explanation: 'u_ff = kS×sign(v) + kV×v + kA×a = 0.12×1 + 2.0×4 + 0 = 0.12 + 8.0 = 8.12 V. At constant speed, kA×a = 0.',
        },
        {
          question: 'Why is the arm gravity feedforward term proportional to cos(θ) rather than a constant?',
          options: [
            'Because the motor speed varies with angle',
            'Because gravity torque on the arm varies as mgL·cos(θ), reaching maximum at horizontal and zero at vertical',
            'Because cos(θ) represents the gear efficiency at each angle',
            'Because the derivative of sin is cos',
          ],
          correctIndex: 1,
          explanation: 'Gravity torque on an arm is τ = mgL·cos(θ), where θ is measured from horizontal. At θ=0° (horizontal) the torque is maximum; at θ=90° (vertical) it is zero. The feedforward voltage must track this variation to correctly counteract gravity at all positions.',
        },
        {
          question: 'When is feedforward control better than using a large Kp alone?',
          options: [
            'When the mechanism moves very slowly and Kp has time to react',
            'When the physical system is well-modeled and predictable, allowing accurate output prediction before error builds up',
            'When sensor noise is high and the derivative term is unreliable',
            'When integral wind-up is a concern',
          ],
          correctIndex: 1,
          explanation: 'Feedforward is better when the system behavior is predictable (known friction, motor model, gravity load). It eliminates lag by computing the required output before any error develops, reducing the work the feedback controller has to do.',
        },
      ],
    },
  ],
};
