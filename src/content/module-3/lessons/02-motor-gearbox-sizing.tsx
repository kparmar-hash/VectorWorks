import { type Lesson } from '../../../types/curriculum';

export const lesson02: Lesson = {
  id: 'motor-gearbox-sizing',
  title: 'Motor & Gearbox Sizing',
  subtitle: 'A five-step process from arm mass to final gear ratio.',
  order: 2,
  estimatedMinutes: 30,
  tags: ['motor', 'gearbox', 'sizing', 'arm', 'current'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Motor selection and gearbox ratio are the two biggest design decisions for any arm
            mechanism. Too little gear ratio and the arm drops or stalls. Too much and it moves so
            slowly the robot can't score in time. This lesson walks through a systematic five-step
            process that gives you a defensible answer — not a guess.
          </p>
        </div>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            The five-step sizing process
          </h3>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li><strong>Find maximum gravity torque</strong> at the pivot (worst case = horizontal)</li>
            <li><strong>Apply a safety factor</strong> of 1.5–2× to account for game pieces, dynamics, and modeling errors</li>
            <li><strong>Divide by motor stall torque</strong> to find minimum gear ratio</li>
            <li><strong>Check arm speed</strong> at that gear ratio — is it fast enough?</li>
            <li><strong>Verify current draw</strong> at the expected operating point — will it brownout the battery?</li>
          </ol>
          <p>
            If step 4 gives a speed that's too slow, increase the motor count (torque adds in
            parallel) or accept a higher gear ratio with a more powerful motor.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Minimum Gear Ratio',
      latex: String.raw`GR_{min} = \frac{\tau_{gravity,max} \cdot SF}{\tau_{stall} \cdot \eta}`,
      variables: [
        { symbol: 'GR_{min}',         meaning: 'Minimum gear ratio needed',      unit: '—' },
        { symbol: '\\tau_{gravity,max}', meaning: 'Max gravity torque (horizontal)', unit: 'N·m' },
        { symbol: 'SF',               meaning: 'Safety factor (1.5–2)',           unit: '—' },
        { symbol: '\\tau_{stall}',    meaning: 'Motor stall torque',              unit: 'N·m' },
        { symbol: '\\eta',            meaning: 'Gearbox efficiency',              unit: '—' },
      ],
      explanation: 'Round GR up to the next available gearbox stage combination. Common options: Versaplanetary, MAXPlanetary, WCP Gearboxes in discrete stages.',
    },
    {
      type: 'formula',
      label: 'Arm Angular Velocity',
      latex: String.raw`\omega_{arm} = \frac{\omega_{motor,free}}{GR} \qquad v_{tip} = \omega_{arm} \cdot L`,
      variables: [
        { symbol: '\\omega_{arm}',       meaning: 'Arm angular velocity',     unit: 'rad/s' },
        { symbol: '\\omega_{motor,free}', meaning: 'Motor free speed',        unit: 'rad/s' },
        { symbol: 'v_{tip}',             meaning: 'Tip linear speed',         unit: 'm/s' },
        { symbol: 'L',                   meaning: 'Arm length',               unit: 'm' },
      ],
      explanation: 'Convert motor free speed from RPM to rad/s: multiply by 2π/60. Arm speed at free speed gives the upper bound — actual speed under load is lower.',
    },
    {
      type: 'formula',
      label: 'Motor Current at Operating Point',
      latex: String.raw`I_{op} = I_{stall} \cdot \left(1 - \frac{\omega_{op}}{\omega_{free}}\right)`,
      variables: [
        { symbol: 'I_{op}',     meaning: 'Motor current at operating point',  unit: 'A' },
        { symbol: 'I_{stall}',  meaning: 'Motor stall current',               unit: 'A' },
        { symbol: '\\omega_{op}', meaning: 'Motor speed at operating point',  unit: 'rad/s or RPM' },
      ],
      explanation: 'At free speed, current = 0. At stall, current = I_stall. The linear relationship means running near stall burns the most current — enable current limiting in your motor controller.',
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'When in doubt, add gear ratio',
      content: (
        <p>
          A higher gear ratio means the arm moves slower but the motor operates further from stall,
          drawing less current and running cooler. It also means more holding torque margin. A slow
          arm that doesn't stall is more reliable in a match than a fast arm that browns out the
          battery every time it hits a hard stop. You can always tune speed in software with motion
          profiling.
        </p>
      ),
    },
    {
      type: 'worked-example',
      title: 'Size a NEO for a 1.5 kg arm targeting 1.5 rad/s',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Arm: <strong>1.5 kg, 0.8 m long</strong>. Motor: single <strong>NEO</strong> (stall
            torque 3.28 N·m, stall current 166 A, free speed 5676 RPM = 594.4 rad/s). Gearbox
            efficiency 85%. Safety factor 2. Target arm speed ≥ <strong>1.5 rad/s</strong>.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Max gravity torque',
          latex: String.raw`\tau_{max} = m g \cdot \frac{L}{2} = 1.5 \times 9.81 \times 0.4 = 5.89 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Uniform arm: CoM at L/2 = 0.4 m. Worst case is horizontal.
            </p>
          ),
        },
        {
          label: 'Required motor torque with SF',
          latex: String.raw`\tau_{motor,required} = \frac{5.89 \times 2}{3.28 \times 0.85} = \frac{11.78}{2.788} \approx 4.23 \text{ N·m per N·m of stall}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This means we need GR ≥ 4.23 to have a 2× safety factor. But let's compute it more
              cleanly in the next step.
            </p>
          ),
        },
        {
          label: 'Minimum gear ratio',
          latex: String.raw`GR_{min} = \frac{\tau_{max} \cdot SF}{\tau_{stall} \cdot \eta} = \frac{5.89 \times 2}{3.28 \times 0.85} = \frac{11.78}{2.788} \approx 4.23`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We need at least 4.23:1. The next common Versaplanetary stage option above this is
              typically 5:1 or a two-stage combination. Let's try 20:1 for speed margin.
            </p>
          ),
        },
        {
          label: 'Arm speed at 20:1',
          latex: String.raw`\omega_{arm} = \frac{\omega_{free}}{GR} = \frac{594.4}{20} = 29.7 \text{ rad/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              29.7 rad/s far exceeds the 1.5 rad/s target — we have a lot of speed overhead. Under
              load the arm will operate well below free speed; motion profiling caps it anyway. This
              ratio is fine.
            </p>
          ),
        },
        {
          label: 'Current at half free speed (typical operating point)',
          latex: String.raw`I_{op} = 166 \times \left(1 - \frac{0.5 \cdot 594.4}{594.4}\right) = 166 \times 0.5 = 83 \text{ A}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At half free speed (a typical working condition), the motor draws 83 A — within safe
              limits for a properly sized breaker. Set a current limit of 40–60 A in software for
              continuous operation.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          A single NEO with a <strong>20:1 gearbox</strong> works well: 2× safety margin on
          holding torque, arm speed of ~30 rad/s (easily motion-profiled down), and 83 A at
          mid-speed operating point (set a software limit of 40–60 A for protection).
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'ReCalc automates this process',
      content: (
        <p>
          The community tool ReCalc (reca.lc) by frc971 lets you enter arm mass, length, motor
          count, and gear ratio, then plots the arm's motion profile and flags stall conditions.
          It uses the same physics you just calculated. Understanding the math gives you the
          ability to interpret its outputs, catch bad assumptions, and override defaults for unusual
          mechanisms.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Min gear ratio',
          latex: String.raw`GR_{min} = \dfrac{\tau_{max} \cdot SF}{\tau_{stall} \cdot \eta}`,
        },
        {
          label: 'Arm free speed',
          latex: String.raw`\omega_{arm} = \omega_{motor} / GR`,
          note: 'Convert RPM × 2π/60 to rad/s',
        },
        {
          label: 'Tip speed',
          latex: String.raw`v_{tip} = \omega_{arm} \cdot L`,
        },
        {
          label: 'Current at op point',
          latex: String.raw`I = I_{stall}(1 - \omega_{op}/\omega_{free})`,
        },
        {
          label: 'Two motors parallel',
          latex: String.raw`\tau_{total} = 2 \cdot \tau_{stall}`,
          note: 'Speed unchanged',
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'An arm has a maximum gravity torque of 15 N·m. With a safety factor of 2, what minimum motor stall torque is needed for a single motor driving through a 40:1 gearbox (assume 100% efficiency)?',
          options: ['0.19 N·m', '0.375 N·m', '0.75 N·m', '1.5 N·m'],
          correctIndex: 2,
          explanation: 'Required motor torque = (tau_max * SF) / GR = (15 * 2) / 40 = 30 / 40 = 0.75 N·m. The motor must produce at least 0.75 N·m stall torque.',
        },
        {
          question: 'A NEO motor (free speed 5676 RPM) drives an arm through a 50:1 gearbox. What is the arm angular velocity at motor free speed?',
          options: ['0.024 rad/s', '0.24 rad/s', '11.9 rad/s', '594 rad/s'],
          correctIndex: 2,
          explanation: 'omega_motor_rad = 5676 * pi / 30 = 594 rad/s. omega_arm = omega_motor / GR = 594 / 50 = 11.9 rad/s. Note: the arm will operate well below free speed under load.',
        },
        {
          question: 'Using two motors in parallel on an arm mechanism (both driving the same shaft through the same gearbox) doubles:',
          options: [
            'The output angular speed',
            'The gear ratio',
            'The available stall torque (and thus the margin against gravity)',
            'Both torque and speed equally',
          ],
          correctIndex: 2,
          explanation: 'Motors in parallel on the same shaft sum their torques. Speed is set by the shared shaft — two motors spinning the same shaft at the same RPM does not change speed. Only torque doubles.',
        },
        {
          question: 'Why is a safety factor of 1.5 to 2x recommended when sizing arm motors?',
          options: [
            'To account for future software improvements',
            'To handle unmodeled loads like game piece mass, friction, and dynamic acceleration torque',
            'To ensure the motor runs at peak efficiency',
            'Safety factors only apply to structural components, not motors',
          ],
          correctIndex: 1,
          explanation: 'Calculations use simplified models (uniform arm, no friction, zero acceleration). Real arms have game pieces at the tip, joint friction, and dynamic accelerations that all add torque demand. A 1.5–2x safety factor ensures the motor is not at its limit under ideal conditions alone.',
        },
      ],
    },
  ],
};
