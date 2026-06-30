import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson02: Lesson = {
  id: 'elevator-gear-ratio',
  title: 'Elevator Gear Ratio & Speed',
  subtitle: 'How the gearbox ratio determines how fast your carriage moves.',
  order: 2,
  estimatedMinutes: 25,
  tags: ['elevator', 'gear-ratio', 'speed', 'sprocket'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            The gear ratio in an elevator does the same thing it does in a drivetrain: it trades
            motor speed for torque. But the math for converting motor RPM to carriage speed is
            different from the drivetrain case because the carriage moves linearly, not rotationally.
            A sprocket (or pulley) converts the rotational output of the gearbox into the linear
            motion of the carriage via a chain or cable.
          </p>
          <p>
            Getting this calculation right is non-negotiable. Too slow and your cycle time kills
            your match score. Too fast and your motor can't supply the torque to lift the weight
            without browning out.
          </p>
        </div>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">From motor RPM to carriage speed</h3>
          <p>
            The gearbox output shaft turns a sprocket. Each revolution of that sprocket advances
            the chain by one sprocket circumference (<M tex="\pi \times d_{spr}" />). The chain
            moves the carriage at the same linear speed as the chain link passing over the sprocket.
          </p>
          <p>
            So: convert motor RPM to sprocket RPS (divide by GR × 60), then multiply by sprocket
            circumference to get carriage speed in m/s.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Carriage Speed',
      latex: String.raw`v_{carriage} = \frac{\omega_{motor}}{GR \times 60} \times \pi \, d_{spr}`,
      variables: [
        { symbol: 'v_{carriage}',  meaning: 'Carriage linear speed',           unit: 'm/s' },
        { symbol: '\\omega_{motor}', meaning: 'Motor free speed',               unit: 'RPM' },
        { symbol: 'GR',            meaning: 'Gear ratio',                       unit: '—' },
        { symbol: 'd_{spr}',       meaning: 'Sprocket pitch diameter',          unit: 'm' },
      ],
      explanation:
        'Dividing by 60 converts RPM → RPS. Multiplying by π·d gives meters per second. Use pitch diameter (center of chain pin to center), not outer diameter.',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Cascade rigging multiplies this speed',
      content: (
        <p>
          The formula above gives carriage speed for a <em>single-stage</em> elevator where the
          carriage is directly attached to the chain. In a cascade (telescoping) rigging, each
          stage multiplies the carriage travel distance and speed relative to the stage below it.
          A 2-stage cascade running the above formula gives 2× the calculated speed at the top
          carriage — but also 2× less force per chain stage. The next lesson covers cascade math
          in detail.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Solving for gear ratio</h3>
          <p>
            More useful in practice: you know your target carriage speed and need to find the
            gear ratio. Rearrange the formula:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Solve for Gear Ratio',
      latex: String.raw`GR = \frac{\omega_{motor} \times \pi \, d_{spr}}{v_{target} \times 60}`,
      variables: [
        { symbol: 'GR',             meaning: 'Required gear ratio',    unit: '—' },
        { symbol: '\\omega_{motor}', meaning: 'Motor free speed',      unit: 'RPM' },
        { symbol: 'd_{spr}',        meaning: 'Sprocket pitch diameter', unit: 'm' },
        { symbol: 'v_{target}',     meaning: 'Target carriage speed',  unit: 'm/s' },
      ],
      explanation:
        'Pick the nearest available gearbox ratio, then verify the actual speed and force. Motor specs are at free speed — under load, the effective speed will be lower.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Practical sprocket sizes',
      content: (
        <p>
          Most FRC elevator sprockets are #25 chain with 16–22 teeth, giving pitch diameters of
          roughly 0.032–0.044 m. The WCP Greyt Universal Elevator Kit uses 0.022 m radius (0.044 m
          diameter) sprockets — a very common reference point.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'NEO elevator carriage speed and cascade effect',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A NEO motor (5,676 RPM free speed) drives an elevator through a <strong>15:1</strong>{' '}
            gearbox. The output sprocket has a <strong>0.022 m radius</strong> (0.044 m diameter).
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            What is the carriage speed? If this is a 2-stage cascade, what is the top carriage speed?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Sprocket circumference',
          latex: String.raw`C = \pi \times d_{spr} = \pi \times 0.044 = 0.1382 \text{ m/rev}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each revolution of the output sprocket advances the chain (and carriage) by 0.138 m.
            </p>
          ),
        },
        {
          label: 'Sprocket speed (RPS)',
          latex: String.raw`n_{spr} = \frac{5676}{15 \times 60} = \frac{5676}{900} = 6.31 \text{ RPS}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The 15:1 gearbox divides motor RPM by 15; dividing by 60 converts to revolutions per
              second.
            </p>
          ),
        },
        {
          label: 'Single-stage carriage speed',
          latex: String.raw`v_{carriage} = 6.31 \times 0.1382 \approx 0.87 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              0.87 m/s is the carriage speed for a direct single-stage elevator. That's on the slow
              side for competition — most teams target 1.5–3 m/s.
            </p>
          ),
        },
        {
          label: '2-stage cascade speed',
          latex: String.raw`v_{top} = 2 \times v_{carriage} = 2 \times 0.87 = 1.74 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              In a 2-stage cascade, the top carriage moves at 2× the stage speed. 1.74 m/s is much
              more competitive — a 1.2 m travel takes about 0.9 s.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Single-stage speed: <strong>0.87 m/s</strong>. 2-stage cascade top speed:{' '}
          <strong>1.74 m/s</strong>. The cascade doubles travel speed but halves the force each
          chain stage sees.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Carriage speed',
          latex: String.raw`v = \dfrac{\omega_{motor} \cdot \pi d_{spr}}{GR \times 60}`,
          note: 'v in m/s, ω in RPM, d in m',
        },
        {
          label: 'Solve for GR',
          latex: String.raw`GR = \dfrac{\omega_{motor} \cdot \pi d_{spr}}{v_{target} \times 60}`,
        },
        {
          label: 'Cascade speed',
          latex: String.raw`v_{top} = N_{stages} \times v_{stage}`,
          note: 'Force divides by same factor',
        },
        {
          label: 'Sprocket circumference',
          latex: String.raw`C = \pi \times d_{spr}`,
          note: 'Use pitch diameter',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A motor runs at 6000 RPM through a 20:1 gearbox with a 0.04 m diameter sprocket. What is the carriage speed?',
          options: [
            '0.63 m/s',
            '1.26 m/s',
            '6.28 m/s',
            '0.31 m/s',
          ],
          correctIndex: 0,
          explanation: 'v = (6000 / (20 × 60)) × π × 0.04 = 5 × 0.1257 ≈ 0.63 m/s. Dividing by GR first, then by 60 to get RPS, then multiply by circumference.',
        },
        {
          question: 'You want a carriage speed of 2.0 m/s using a 5676 RPM motor and a 0.044 m sprocket. What gear ratio do you need?',
          options: [
            '5.3:1',
            '6.6:1',
            '13.2:1',
            '26.4:1',
          ],
          correctIndex: 1,
          explanation: 'GR = (5676 × π × 0.044) / (2.0 × 60) = (5676 × 0.1382) / 120 ≈ 784.7 / 120 ≈ 6.5:1. The closest is 6.6:1.',
        },
        {
          question: 'A 2-stage cascade elevator has a stage carriage speed of 1.2 m/s. What is the top carriage speed?',
          options: [
            '0.6 m/s',
            '1.2 m/s',
            '2.4 m/s',
            '3.6 m/s',
          ],
          correctIndex: 2,
          explanation: 'Each stage in a cascade multiplies travel speed. 2 stages × 1.2 m/s = 2.4 m/s at the top carriage.',
        },
        {
          question: 'When computing carriage speed, why do you use sprocket pitch diameter rather than outer diameter?',
          options: [
            'Outer diameter includes the sprocket teeth which do not contact the chain',
            'The pitch diameter is where the chain pin centers ride, giving the actual chain travel per revolution',
            'Pitch diameter is always larger, giving a conservative estimate',
            'Outer diameter is for pulleys; pitch diameter is only for gears',
          ],
          correctIndex: 1,
          explanation: 'Chain travel per revolution equals the circumference at the pitch circle — where the chain pin centers are located. Using outer diameter overestimates the speed.',
        },
      ],
    },
  ],
};
