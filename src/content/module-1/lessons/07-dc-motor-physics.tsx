import { type Lesson } from '../../../types/curriculum';

export const lesson07: Lesson = {
  id: 'dc-motor-physics',
  title: 'DC Motor Physics',
  subtitle: 'Torque-speed curves, back-EMF, and what really limits your mechanisms.',
  order: 7,
  estimatedMinutes: 30,
  tags: ['motor', 'torque-speed', 'back-emf', 'stall', 'kraken', 'neo', 'falcon'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            You pick a motor. You build the mechanism. Then it doesn't work the way you
            expected — maybe it's too slow under load, or it stalls trying to hold position,
            or it trips the breaker. The answer is almost always on the <em>torque-speed curve</em>.
          </p>
          <p>
            Every brushless DC motor used in FRC has a characteristic linear relationship between
            torque and speed. That relationship, combined with your gear ratio and the mechanism's
            load, completely determines the operating point — and whether the mechanism behaves
            the way you designed it.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Every FRC motor has this curve',
      content: (
        <p>
          Kraken X60, NEO, Falcon 500, NEO Vortex — they all have published stall torque, stall
          current, free speed, and free current specs. From those four numbers you can reconstruct
          the entire torque-speed curve, predict current draw at any operating point, and verify
          that your gear ratio puts the motor where you want it.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The torque-speed curve</h3>
          <p>
            At <strong>zero speed (stall)</strong>, the motor produces maximum torque (stall torque)
            and draws maximum current (stall current). As the motor speeds up, a back-EMF voltage
            builds up opposing the supply voltage — this reduces the current and therefore the
            torque. At <strong>free speed</strong> (no load), back-EMF nearly equals the supply
            voltage, current drops to nearly zero, and torque approaches zero.
          </p>
          <p>
            The result is a straight line from (0, τ_stall) to (ω_free, 0) on a torque vs. speed
            graph. Current follows the same linear pattern. Power (= τ × ω) is a downward-opening
            parabola peaking at half stall torque and half free speed.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Torque-Speed Relationship',
      latex: String.raw`\tau(\omega) = \tau_{stall} \left(1 - \frac{\omega}{\omega_{free}}\right)`,
      variables: [
        { symbol: '\\tau(\\omega)',  meaning: 'Torque at angular velocity ω',  unit: 'N·m' },
        { symbol: '\\tau_{stall}',  meaning: 'Stall torque (at ω = 0)',        unit: 'N·m' },
        { symbol: '\\omega',        meaning: 'Operating angular velocity',      unit: 'rad/s' },
        { symbol: '\\omega_{free}', meaning: 'Free speed (at τ = 0)',           unit: 'rad/s' },
      ],
      explanation:
        'This is the fundamental motor equation. At ω = 0: τ = τ_stall (maximum). At ω = ω_free: τ = 0. The gear ratio scales this curve — a 10:1 gearbox multiplies torque by 10 and divides speed by 10.',
    },

    {
      type: 'formula',
      label: 'Current-Speed Relationship',
      latex: String.raw`I(\omega) = I_{stall} \left(1 - \frac{\omega}{\omega_{free}}\right) + I_{free}`,
      variables: [
        { symbol: 'I(\\omega)',   meaning: 'Current draw at angular velocity ω',    unit: 'A' },
        { symbol: 'I_{stall}',   meaning: 'Stall current',                          unit: 'A' },
        { symbol: 'I_{free}',    meaning: 'Free current (no-load current)',          unit: 'A' },
        { symbol: '\\omega',     meaning: 'Operating angular velocity',             unit: 'rad/s' },
        { symbol: '\\omega_{free}', meaning: 'Free speed',                          unit: 'rad/s' },
      ],
      explanation:
        'Current tracks torque: high torque = high current. The stall current is the most dangerous operating point — it is 10–20× the free current and can overheat a motor in seconds without current limiting.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Common FRC motors — key specs</h3>
          <p>
            These are approximate published specifications. Always verify on the manufacturer's
            website — specs can change between motor revisions.
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="text-left px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Motor</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Free Speed (RPM)</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Stall Torque (N·m)</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Stall Current (A)</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Peak Power (W)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Kraken X60 (FOC)', '6,000', '9.4', '483', '~1,407'],
                  ['NEO', '5,676', '3.28', '166', '~466'],
                  ['NEO Vortex', '6,784', '3.60', '211', '~611'],
                  ['Falcon 500 (FOC)', '6,380', '5.84', '257', '~931'],
                ].map(([name, rpm, torque, current, power]) => (
                  <tr key={name} className="even:bg-slate-50 dark:even:bg-slate-900">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{name}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{rpm}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{torque}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{current}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{power}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Peak power = τ_stall × ω_free / 4. FOC (Field-Oriented Control) specs — brushless commutation mode used via Talon FX / Phoenix 6.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'FOC vs. traditional commutation',
      content: (
        <p>
          Field-Oriented Control (FOC) is an advanced commutation strategy that maximizes
          torque per amp by keeping the magnetic field precisely aligned with the rotor.
          The Kraken X60 and Falcon 500 achieve their highest specs in FOC mode (via Phoenix 6
          firmware). In traditional commutation mode, specs drop by ~10–15%. This matters for
          mechanism sizing: always check which mode your motor controller runs and use the
          matching datasheet specs.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gear ratios shift the operating point</h3>
          <p>
            A gear ratio transforms the motor's torque-speed curve at the output shaft. A 10:1
            gearbox multiplies torque by 10 and divides speed by 10. So the output shaft's
            effective curve runs from (0, 10τ_stall) to (ω_free/10, 0).
          </p>
          <p>
            The operating point is where the mechanism's load line intersects the motor's curve.
            Choose the gear ratio to put that intersection near the peak power region (half stall
            torque, half free speed) for maximum efficiency.
          </p>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'NEO arm at 50% free speed — torque and current',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A <strong>NEO motor</strong> (stall torque 3.28 N·m, stall current 166 A,
            free speed 5,676 RPM, free current 1.3 A) drives an arm through a{' '}
            <strong>10:1 gearbox</strong>.
          </p>
          <p className="text-slate-500">
            At 50% of motor free speed, what is the arm torque and motor current draw?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Calculate motor torque at 50% free speed',
          latex: String.raw`\tau_{motor} = \tau_{stall}\left(1 - \frac{\omega}{{\omega_{free}}}\right) = 3.28 \times \left(1 - 0.5\right) = 3.28 \times 0.5 = 1.64 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At 50% free speed, the motor produces 50% of stall torque — this is the peak power point.
            </p>
          ),
        },
        {
          label: 'Calculate arm output torque through gearbox',
          latex: String.raw`\tau_{arm} = \tau_{motor} \times GR = 1.64 \times 10 = 16.4 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The 10:1 gearbox multiplies motor torque by 10. (Ignoring efficiency — apply
              η ≈ 0.90 for a more accurate result: 16.4 × 0.90 = 14.8 N·m.)
            </p>
          ),
        },
        {
          label: 'Calculate arm shaft speed',
          latex: String.raw`\omega_{arm} = \frac{\omega_{motor}}{GR} = \frac{0.5 \times 5676}{10} = \frac{2838}{10} = 283.8 \text{ RPM}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The gearbox divides speed by 10. The arm shaft turns at ~284 RPM — likely geared further
              down with another stage for an actual arm pivot.
            </p>
          ),
        },
        {
          label: 'Calculate motor current draw',
          latex: String.raw`I = I_{stall}(1 - 0.5) + I_{free} = 166 \times 0.5 + 1.3 = 83 + 1.3 \approx 84 \text{ A}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At peak power, the motor draws about 84 A. This is within the typical 40 A breaker rating
              if current limited in software, but briefly exceeds it at startup. Set a current limit
              of 60–80 A to protect the motor while still allowing full power operation.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          At 50% free speed (peak power), the NEO provides <strong>1.64 N·m</strong> at the motor shaft,
          amplified to <strong>16.4 N·m</strong> through the 10:1 gearbox. Current draw is approximately{' '}
          <strong>84 A</strong>. Set a current limit of 60–80 A in Phoenix/REV firmware to protect the motor.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Stall kills motors — always use current limits',
      content: (
        <p>
          At stall, a NEO draws 166 A and dissipates roughly 2,000 W as heat in the windings.
          Without a current limit, a stalled motor reaches dangerous temperatures in under 10
          seconds. Every motor controller in FRC (Talon FX, SPARK MAX, SPARK Flex) supports
          software current limiting — set it. 40 A continuous / 80 A peak is a common starting
          point. Adjust based on your mechanism's duty cycle and thermal testing.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Current limiting protects motors and the battery',
      content: (
        <p>
          Software current limits in Phoenix 6 (Talon FX) or REV Hardware Client (SPARK MAX/Flex)
          cap the motor controller's output before the motor reaches dangerous thermal conditions.
          They also reduce peak battery current draw — six motors stalling simultaneously at
          300+ A each would immediately brownout any robot. With 60 A limits, peak is ~360 A —
          still high, but manageable with proper sequencing.
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'motor-torque-speed',
      title: 'Motor Torque-Speed Curve',
      description: 'Select a motor, adjust the gear ratio and load, and watch the operating point move along the curve. See power and current change in real time.',
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Torque at speed',   latex: String.raw`\tau = \tau_{stall}(1 - \omega/\omega_{free})` },
        { label: 'Current at speed',  latex: String.raw`I = I_{stall}(1 - \omega/\omega_{free}) + I_{free}` },
        { label: 'Power',             latex: String.raw`P = \tau \cdot \omega`,               note: 'ω in rad/s' },
        { label: 'Peak power',        latex: String.raw`P_{peak} = \tau_{stall}\omega_{free}/4` },
        { label: 'Output torque',     latex: String.raw`\tau_{out} = \tau_{motor} \times GR \times \eta` },
        { label: 'Output speed',      latex: String.raw`\omega_{out} = \omega_{motor} / GR` },
        { label: 'RPM → rad/s',       latex: String.raw`\omega = \text{RPM} \times \pi/30` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'On a DC motor torque-speed curve, what is the torque output when the motor runs at free speed (no load)?',
          options: ['Stall torque', 'Half stall torque', 'Zero', 'Depends on voltage'],
          correctIndex: 2,
          explanation: 'At free speed, the motor spins with zero load torque. The torque-speed curve is linear: tau(omega) = tau_stall * (1 - omega/omega_free), which equals zero at omega = omega_free.',
        },
        {
          question: 'A NEO motor has stall torque 3.28 N·m and free speed 5676 RPM. Running through a 10:1 gearbox at 50% of free motor speed, what is the output shaft torque (assume 100% efficiency)?',
          options: ['1.64 N·m', '16.4 N·m', '32.8 N·m', '328 N·m'],
          correctIndex: 1,
          explanation: 'At 50% free speed, motor torque = tau_stall * (1 - 0.5) = 3.28 * 0.5 = 1.64 N·m. Through 10:1 gearbox: 1.64 * 10 = 16.4 N·m at the output shaft.',
        },
        {
          question: 'Adding a higher gear ratio shifts the motor operating point along the torque-speed curve. A steeper gear ratio (e.g. 20:1 vs 10:1) causes the motor to run:',
          options: [
            'Faster (closer to free speed) under the same mechanical load',
            'Slower (closer to stall) because the reflected load increases',
            'At the same speed — gear ratio does not affect motor RPM',
            'Faster, but with less torque at the wheel',
          ],
          correctIndex: 0,
          explanation: 'A higher gear ratio reduces the load torque seen by the motor (load reflected through GR^2 for inertia, GR for static torque). With less motor torque required, the motor runs closer to free speed — a healthier operating point.',
        },
        {
          question: 'Why is current limiting important for FRC motors in software?',
          options: [
            'To prevent the motor from spinning too fast',
            'To cap heat generation and protect the battery from brownout during near-stall operation',
            'To increase the gear ratio automatically',
            'It is not important — the PDP breakers handle all protection',
          ],
          correctIndex: 1,
          explanation: 'Near stall, motors draw near-stall current continuously, generating extreme heat and pulling the battery voltage down. Software current limits cap this before damage occurs. PDP breakers are thermal and take seconds to trip — too slow for motor protection.',
        },
      ],
    },
  ],
};
