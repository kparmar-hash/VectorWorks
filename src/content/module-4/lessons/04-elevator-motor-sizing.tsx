import { type Lesson } from '../../../types/curriculum';

export const lesson04: Lesson = {
  id: 'elevator-motor-sizing',
  title: 'Elevator Motor Sizing',
  subtitle: 'Calculate lift force, verify hold current, and avoid the brownout.',
  order: 4,
  estimatedMinutes: 25,
  tags: ['motor', 'sizing', 'elevator', 'power', 'current'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Elevator motor sizing has two distinct requirements: the motor must be able to{' '}
            <strong>move</strong> the carriage at the target speed and acceleration, and it must
            also be able to <strong>hold</strong> the carriage stationary against gravity without
            drawing so much current that it browns out the robot.
          </p>
          <p>
            Most teams get the "move" part right. They get burned by the "hold" part. At any
            position where the elevator is stationary, the motor is fighting gravity at stall or
            near-stall current. That current adds up fast on a 12 V FRC battery.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Elevators are the #1 brownout source',
      content: (
        <p>
          An elevator holding a heavy game piece at full extension while the drivetrain also
          accelerates can draw 300+ amps from the battery. FRC batteries brownout around 6.3 V,
          which happens fast under that load. Always calculate hold current, and always set a
          current limit in your motor controller config.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Step 1 — Required lift force</h3>
          <p>
            The motor must supply enough force at the drive chain to overcome gravity on the
            carriage. For a single-stage elevator, the chain force equals the carriage weight.
            For a cascade, multiply by the number of stages.
          </p>
          <p>
            Then add a <strong>safety factor of 2×</strong> to account for acceleration forces and
            real-world inefficiencies (chain friction, bearing drag, electrical losses).
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Required Drive Force',
      latex: String.raw`F_{required} = \frac{m_{carriage} \times g \times N_{stages} \times SF}{GR \times r_{spr}}`,
      variables: [
        { symbol: 'F_{required}',  meaning: 'Required motor shaft torque equivalent', unit: 'N' },
        { symbol: 'm_{carriage}',  meaning: 'Carriage + payload mass',                unit: 'kg' },
        { symbol: 'g',             meaning: 'Gravitational acceleration',              unit: 'm/s²' },
        { symbol: 'N_{stages}',    meaning: 'Number of cascade stages',               unit: '—' },
        { symbol: 'SF',            meaning: 'Safety factor (use 2)',                  unit: '—' },
        { symbol: 'GR',            meaning: 'Gear ratio',                             unit: '—' },
        { symbol: 'r_{spr}',       meaning: 'Sprocket pitch radius',                  unit: 'm' },
      ],
      explanation:
        'This gives the torque needed at the motor shaft. Compare it to the motor stall torque to check feasibility. Remember: the motor operates near stall when holding position.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Step 2 — Hold current</h3>
          <p>
            When stationary, the motor current is proportional to the gravity torque vs. the stall
            torque. If the elevator needs 40% of stall torque to hold position, it draws 40% of
            stall current. That's a continuous draw — it doesn't go away while the elevator is
            raised.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Hold Current',
      latex: String.raw`I_{hold} = I_{stall} \times \frac{\tau_{gravity}}{\tau_{stall} \times GR}`,
      variables: [
        { symbol: 'I_{hold}',      meaning: 'Continuous hold current',               unit: 'A' },
        { symbol: 'I_{stall}',     meaning: 'Motor stall current',                   unit: 'A' },
        { symbol: '\\tau_{gravity}', meaning: 'Gravity load reflected to motor shaft', unit: 'N·m' },
        { symbol: '\\tau_{stall}', meaning: 'Motor stall torque',                    unit: 'N·m' },
        { symbol: 'GR',            meaning: 'Gear ratio',                            unit: '—' },
      ],
      explanation:
        'τ_gravity = m×g×r_spr×N_stages / GR (force at motor shaft × arm). Keep I_hold well below 40 A per motor to avoid brownout during long hold periods.',
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Current limit is not optional',
      content: (
        <p>
          Set a stall current limit in your motor controller (Phoenix 6 / REV Spark) equal to
          roughly 40 A per motor on an elevator. This keeps hold current manageable and protects
          windings from heat damage. The cost is a small reduction in peak lift force — worth every
          match you don't brownout.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'NEO single-motor elevator — force, speed, and hold current',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Size a <strong>single NEO</strong> (stall torque 3.28 N·m, stall current 166 A, free
            speed 5,676 RPM) for a <strong>4 kg</strong> single-stage elevator carriage. Target
            speed: <strong>2 m/s</strong>. Sprocket radius: <strong>0.022 m</strong>. SF = 2.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Find the required gear ratio, verify hold current.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Required force at sprocket',
          latex: String.raw`F_{sprocket} = m \times g \times SF = 4 \times 9.81 \times 2 = 78.5 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Single stage, so no cascade multiplier. With 2× safety factor we need 78.5 N of chain
              pull.
            </p>
          ),
        },
        {
          label: 'Required GR from force',
          latex: String.raw`GR_{force} = \frac{F_{sprocket} \times r_{spr}}{\tau_{stall}} = \frac{78.5 \times 0.022}{3.28} = \frac{1.727}{3.28} \approx 0.53`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A GR of 0.53 means the force requirement is trivially met by the NEO even without a
              gearbox — the motor has far more torque than needed for force alone.
            </p>
          ),
        },
        {
          label: 'Required GR from speed',
          latex: String.raw`GR_{speed} = \frac{\omega_{free} \times \pi d_{spr}}{v_{target} \times 60} = \frac{5676 \times \pi \times 0.044}{2.0 \times 60} = \frac{784.7}{120} \approx 6.5`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Speed requires a 6.5:1 ratio. Since 6.5 {'>'} 0.53, the speed constraint governs.
              Use GR ≈ <strong>6.5:1</strong> (or the nearest real gearbox option, e.g. 7:1 MAXPlanetary stage).
            </p>
          ),
        },
        {
          label: 'Hold current at 6.5:1',
          latex: String.raw`\tau_{gravity} = \frac{4 \times 9.81 \times 0.022}{6.5} = \frac{0.863}{6.5} = 0.133 \text{ N·m at motor}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The gravity torque reflected to the motor shaft is tiny (0.133 N·m vs. 3.28 N·m stall
              torque).
            </p>
          ),
        },
        {
          label: 'Hold current calculation',
          latex: String.raw`I_{hold} = 166 \times \frac{0.133}{3.28} \approx 166 \times 0.041 \approx 6.7 \text{ A}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              6.7 A is very safe — well under the 40 A soft limit. The 4 kg elevator is easy for a
              single NEO. Two motors would be needed for heavier loads or cascade multipliers.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Use a <strong>6.5:1 gearbox</strong> (speed governs). Hold current is only{' '}
          <strong>6.7 A</strong> — safe for continuous operation. The NEO is well-sized for this
          elevator.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Two motors = half the hold current each',
      content: (
        <p>
          Running two motors in parallel on an elevator doubles available force and halves the hold
          current per motor (they share the load). For heavy game pieces or fast elevators, two
          NEOs or one Kraken X60 is a common choice. Just make sure both motor controllers are
          configured as leader/follower and share the same current limit.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Force required',
          latex: String.raw`F = m g \cdot N_{stages} \cdot SF`,
          note: 'At sprocket; SF = 2',
        },
        {
          label: 'GR from speed',
          latex: String.raw`GR = \dfrac{\omega_{free} \cdot \pi d_{spr}}{v_{target} \times 60}`,
        },
        {
          label: 'Hold current',
          latex: String.raw`I_{hold} = I_{stall} \times \dfrac{\tau_{gravity}}{\tau_{stall}}`,
          note: 'τ_gravity at motor shaft',
        },
        {
          label: 'Two motors',
          latex: String.raw`I_{hold,\,each} = I_{hold,\,total} / 2`,
          note: 'Parallel motors share load',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'An elevator must hold a 10 kg carriage. The NEO has stall torque 3.28 N·m and the gravity torque at the motor shaft is 0.65 N·m. What is the hold current? (NEO stall current = 166 A)',
          options: ['33 A', '52 A', '83 A', '166 A'],
          correctIndex: 0,
          explanation: 'I_hold = 166 × (0.65 / 3.28) = 166 × 0.198 ≈ 33 A. The motor only needs 19.8% of stall torque to hold this load.',
        },
        {
          question: 'For elevator sizing, which constraint usually sets the gear ratio — required force or required speed?',
          options: [
            'Required force — elevators always need high torque',
            'Required speed — motors have plenty of torque but speed must be tamed',
            'It depends on the payload weight and target speed',
            'Neither — elevator GR is always chosen as 20:1',
          ],
          correctIndex: 2,
          explanation: 'Both constraints must be checked. Heavy, fast elevators are force-limited. Light, very fast elevators may be speed-limited. Always calculate both and use the larger GR.',
        },
        {
          question: 'Why does an elevator draw current even when it is not moving?',
          options: [
            'The motor controller wastes power as heat at all times',
            'The motor must produce torque to hold the carriage against gravity, which requires current',
            'Back-EMF causes current even at zero speed',
            'Elevators only draw current when moving; stationary draw is negligible',
          ],
          correctIndex: 1,
          explanation: 'Torque and current are proportional. Holding position against gravity requires continuous torque output, which means continuous current draw — even at zero velocity.',
        },
        {
          question: 'You run two identical motors in parallel on an elevator. How does this change the hold current per motor?',
          options: [
            'Each motor draws the same as one motor would alone',
            'Each motor draws double the current of one motor alone',
            'Each motor draws half the current of one motor alone',
            'Hold current is independent of motor count',
          ],
          correctIndex: 2,
          explanation: 'Two parallel motors share the load equally. Each provides half the torque, drawing half the current. Total system current is the same, but each motor runs cooler.',
        },
      ],
    },
  ],
};
