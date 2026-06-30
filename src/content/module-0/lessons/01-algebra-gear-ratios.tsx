import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'algebra-gear-ratios',
  title: 'Algebra & Gear Ratios',
  subtitle: 'Every motor choice is an equation. Solve it before kickoff.',
  order: 1,
  estimatedMinutes: 25,
  tags: ['algebra', 'drivetrains', 'gear-ratio', 'unit-conversion', 'quick-ref'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Before your team touches a single piece of metal, someone has to answer: how fast will
            this robot go? That question is algebra. Gear ratio, wheel size, and motor speed are
            connected by a formula, and once you know any three of those you can find the fourth in
            seconds — no simulation, no trial and error.
          </p>
          <p>
            This lesson walks through that formula from first principles. By the end you will be
            able to size a drivetrain gear ratio, convert between units confidently, and — just as
            importantly — run the calculation backwards: <em>what ratio do I need to hit 15 ft/s?</em>
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Where you will use this',
      content: (
        <p>
          Drivetrain sizing, arm motor selection, elevator gear ratios, intake roller speeds — every
          mechanism on the robot involves gear ratio math. Teams that eyeball ratios waste time on
          rebuild cycles. Teams that calculate land on the right ratio in CAD, not on the practice
          field.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">What is a gear ratio?</h3>
          <p>
            A gear ratio describes how many times the input shaft (the motor) turns for every
            single turn of the output shaft (the wheel). A{' '}
            <span className="font-semibold">10:1 ratio</span> means the motor spins ten times for
            every one wheel rotation. That multiplies torque by 10 and divides speed by 10 — there
            is no free lunch in mechanics.
          </p>
          <p>
            In FRC, gear ratios come from sprocket/chain pairs, spur gear stages, or planetary
            gearboxes. Multiple stages multiply together: a 3:1 stage followed by a 4:1 stage
            gives a combined 12:1.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Gear Ratio',
      latex: String.raw`GR = \frac{N_{driven}}{N_{driver}} = \frac{\text{teeth on output}}{\text{teeth on input}}`,
      variables: [
        { symbol: 'GR',          meaning: 'Gear ratio (unitless)',            unit: '—' },
        { symbol: 'N_{driven}',  meaning: 'Teeth on the driven (output) gear', unit: 'teeth' },
        { symbol: 'N_{driver}',  meaning: 'Teeth on the driver (input) gear',  unit: 'teeth' },
      ],
      explanation:
        'For chain/belt, use sprocket tooth counts. For a gearbox with multiple stages, multiply the individual stage ratios together.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">From motor RPM to wheel speed</h3>
          <p>
            The motor spins at some RPM. The gearbox slows that down by the gear ratio. The wheel
            converts rotational speed (RPM) to linear speed (ft/s) based on its circumference.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Top Speed',
      latex: String.raw`v_{top} = \frac{\omega_{free}}{GR \cdot 60} \times \pi d`,
      variables: [
        { symbol: 'v_{top}',       meaning: 'Robot top speed',                unit: 'm/s' },
        { symbol: '\\omega_{free}', meaning: 'Motor free speed',               unit: 'RPM' },
        { symbol: 'GR',            meaning: 'Gear ratio',                      unit: '—' },
        { symbol: 'd',             meaning: 'Wheel diameter',                  unit: 'm' },
      ],
      explanation:
        'Dividing by 60 converts RPM → rotations/second. Multiplying by πd converts rotations/second → meters/second.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Unit conversions you will use constantly</h3>
          <p>
            FRC mixes imperial and metric constantly — wheel diameters are in inches, field
            dimensions are in feet, WPILib's odometry is in meters, and motor specs are in
            Newton-meters and RPM. Keeping units straight prevents a class of bugs that only shows
            up during a match.
          </p>
          <p>The two conversions you will reach for most often:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Inches → meters: multiply by <M tex="0.0254" />
            </li>
            <li>
              ft/s → m/s: multiply by <M tex="0.3048" />
            </li>
          </ul>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Unit Conversions',
      latex: String.raw`1\text{ in} = 0.0254\text{ m} \qquad 1\text{ ft/s} = 0.3048\text{ m/s} \qquad 1\text{ lb} = 0.4536\text{ kg}`,
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Solving for gear ratio',
      content: (
        <p>
          You can rearrange the top-speed formula to find the ratio you need:{' '}
          <M tex="GR = \frac{\omega_{free} \cdot \pi d}{v_{target} \cdot 60}" />. Plug in your
          target speed (convert to m/s first!), motor free speed, and wheel diameter — out comes the
          ratio. Then find the nearest real gearbox option.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Sizing a Kraken X60 drivetrain for 15 ft/s',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Your team wants the robot to hit <strong>15 ft/s</strong> (4.572 m/s). You are using
            six <strong>Kraken X60 (FOC)</strong> motors (6,000 RPM free speed) with{' '}
            <strong>4-inch (0.1016 m)</strong> diameter Colson wheels.
          </p>
          <p className="text-slate-500">
            Find the required gear ratio and the resulting top speed.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Convert target speed to m/s',
          latex: String.raw`v_{target} = 15 \text{ ft/s} \times 0.3048 = 4.572 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600">
              Always convert to SI units before plugging into physics formulas. This avoids a whole
              category of off-by-a-factor-of-3 bugs.
            </p>
          ),
        },
        {
          label: 'Rearrange top-speed formula for GR',
          latex: String.raw`GR = \frac{\omega_{free} \cdot \pi d}{v_{target} \cdot 60} = \frac{6000 \cdot \pi \cdot 0.1016}{4.572 \cdot 60}`,
          explanation: (
            <p className="text-sm text-slate-600">
              Multiply top speed by 60 to cancel the RPM → RPS conversion. The <M tex="\pi d" />{' '}
              in the numerator is the wheel circumference.
            </p>
          ),
        },
        {
          label: 'Evaluate',
          latex: String.raw`GR = \frac{6000 \times 3.1416 \times 0.1016}{274.3} = \frac{1913.0}{274.3} \approx 6.98`,
          explanation: (
            <p className="text-sm text-slate-600">
              The calculation gives 6.98:1. The closest standard ratio in many gearbox systems is{' '}
              <strong>6.75:1</strong> (common in Thrifty Bot and West Coast Products gearboxes) or{' '}
              <strong>7.09:1</strong>.
            </p>
          ),
        },
        {
          label: 'Verify with 6.75:1',
          latex: String.raw`v_{top} = \frac{6000}{6.75 \times 60} \times \pi \times 0.1016 = 14.83 \cdot \pi \times 0.1016 \approx 4.73 \text{ m/s} = 15.5 \text{ ft/s}`,
          explanation: (
            <p className="text-sm text-slate-600">
              6.75:1 gives 15.5 ft/s — slightly above target, which is fine. The motor will not
              actually reach free speed under load (the robot has mass to accelerate), so the
              real-world number will be a few percent lower anyway.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Use a <strong>6.75:1</strong> gear ratio. This gives a theoretical top speed of{' '}
          <strong>15.5 ft/s (4.73 m/s)</strong> with 4-inch wheels on Kraken X60 (FOC) motors.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Theoretical vs. real top speed',
      content: (
        <p>
          The formula gives top speed at <em>free speed</em> — zero load. On the field, the robot's
          mass means the motor operates below free speed, and electrical resistance reduces effective
          voltage. Real top speed is typically <strong>85–90%</strong> of the theoretical number.
          Size for your target, expect to land slightly under it.
        </p>
      ),
    },

    {
      type: 'simulation',
      componentKey: 'gear-ratio-explorer',
      title: 'Gear Ratio Explorer',
      description:
        'Drag the sliders and watch the robot change speed in real time. Observe the traction-limited warning — when motor force exceeds grip, more torque does not help.',
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Gear ratio',
          latex: String.raw`GR = N_{driven} / N_{driver}`,
          note: 'Multiply stage ratios for compound gearboxes',
        },
        {
          label: 'Top speed',
          latex: String.raw`v = \dfrac{\omega_{free}}{GR \cdot 60} \cdot \pi d`,
          note: 'v in m/s, ω in RPM, d in m',
        },
        {
          label: 'Solve for ratio',
          latex: String.raw`GR = \dfrac{\omega_{free} \cdot \pi d}{v_{target} \cdot 60}`,
          note: 'Target in m/s',
        },
        {
          label: 'Wheel RPM',
          latex: String.raw`\omega_{wheel} = \omega_{motor} / GR`,
          note: '',
        },
        {
          label: 'Inches to meters',
          latex: String.raw`1\text{ in} = 0.0254\text{ m}`,
        },
        {
          label: 'ft/s to m/s',
          latex: String.raw`1\text{ ft/s} = 0.3048\text{ m/s}`,
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A motor spins at 5000 RPM through a 10:1 gearbox. What is the output shaft speed?',
          options: ['50,000 RPM', '500 RPM', '50 RPM', '4990 RPM'],
          correctIndex: 1,
          explanation: 'Output speed = motor speed / gear ratio = 5000 / 10 = 500 RPM. A 10:1 ratio divides speed by 10, not multiplies.',
        },
        {
          question: 'Which of the following correctly defines gear ratio for a sprocket pair?',
          options: [
            'GR = teeth on driver / teeth on driven',
            'GR = teeth on driven / teeth on driver',
            'GR = (teeth on driver + teeth on driven) / 2',
            'GR = motor RPM / wheel RPM',
          ],
          correctIndex: 1,
          explanation: 'GR = N_driven / N_driver. The driven gear is the output (wheel side), the driver is the input (motor side). A larger driven gear means a higher ratio and more torque reduction.',
        },
        {
          question: 'A Kraken X60 (6000 RPM free speed) drives 4-inch (0.1016 m) wheels through a 6.75:1 gearbox. What is the theoretical top speed in m/s?',
          options: ['3.14 m/s', '4.73 m/s', '7.54 m/s', '31.8 m/s'],
          correctIndex: 1,
          explanation: 'v = (6000 / (6.75 × 60)) × π × 0.1016 = 14.81 × 0.3193 ≈ 4.73 m/s. Divide RPM by ratio and 60 to get rev/s, then multiply by wheel circumference.',
        },
        {
          question: 'You want a robot top speed of 4.0 m/s using 4-inch (0.1016 m) wheels and a motor with 5676 RPM free speed. What gear ratio do you need?',
          options: ['4.53:1', '7.57:1', '5.00:1', '11.4:1'],
          correctIndex: 1,
          explanation: 'GR = (ω_free × π × d) / (v_target × 60) = (5676 × π × 0.1016) / (4.0 × 60) = 1812 / 240 ≈ 7.55:1. Round to the nearest available gearbox ratio.',
        },
      ],
    },
  ],
};
