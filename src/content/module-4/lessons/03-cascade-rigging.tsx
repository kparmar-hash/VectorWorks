import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'cascade-rigging',
  title: 'Cascade Rigging Math',
  subtitle: 'How multi-stage elevators multiply travel and divide force.',
  order: 3,
  estimatedMinutes: 25,
  tags: ['cascade', 'rigging', 'pulley', 'mechanical-advantage'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            A cascade elevator is a telescoping mechanism where each stage rides on top of the
            previous one. When the bottom stage extends by some distance, the top stage extends by
            the same amount relative to the bottom stage — so the total extension is{' '}
            <em>multiplied</em>. A 3-stage cascade can extend 3× the travel of a single stage,
            all driven by a single motor.
          </p>
          <p>
            There is no free energy here. The extra travel comes at the cost of proportionally
            reduced force on the upper stages. This is the same mechanical advantage principle
            that makes pulleys useful: more speed and distance = less force available.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Cascade elevators in FRC',
      content: (
        <p>
          Virtually every tall FRC elevator uses cascade rigging — it lets a compact robot extend
          well above frame perimeter height. The 2023 Charged Up game required reaching the top
          peg at ~1.8 m; most robots used 2- or 3-stage cascades driven by one or two motors.
          The math here is exactly what teams used in their CAD to verify reach and sizing.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">How cascade rigging works</h3>
          <p>
            In a 2-stage cascade, a chain or cable runs from a fixed anchor at the top of the outer
            stage, over a sprocket on the inner stage, and back to a fixed point on the outer stage.
            When the inner stage moves down by <M tex="d" />, the cable on each side gets longer by{' '}
            <M tex="d" />, meaning the bottom of the cable descends by <M tex="2d" />. The payload
            carriage attached to that cable bottom moves <M tex="2d" /> for every <M tex="d" /> of
            stage travel.
          </p>
          <p>
            For an <M tex="N" />-stage cascade, the top carriage moves <M tex="N" /> times the
            distance driven by the bottom stage actuator, and the pulling force at each higher stage
            is reduced by the same factor.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Cascade Travel Multiplier',
      latex: String.raw`x_{total} = N_{stages} \times x_{stage}`,
      variables: [
        { symbol: 'x_{total}',   meaning: 'Total extension at top carriage', unit: 'm' },
        { symbol: 'N_{stages}',  meaning: 'Number of cascade stages',        unit: '—' },
        { symbol: 'x_{stage}',   meaning: 'Travel of the driven stage',      unit: 'm' },
      ],
      explanation:
        'A 3-stage cascade with 0.6 m of stage travel gives 1.8 m of total extension. Speed scales the same way.',
    },

    {
      type: 'formula',
      label: 'Force at Each Stage',
      latex: String.raw`F_{top} = \frac{F_{drive}}{N_{stages}}, \quad F_{stage\,k} = \frac{F_{drive}}{k}`,
      variables: [
        { symbol: 'F_{top}',    meaning: 'Force available at top carriage',   unit: 'N' },
        { symbol: 'F_{drive}',  meaning: 'Force from motor/gearbox at chain', unit: 'N' },
        { symbol: 'N_{stages}', meaning: 'Number of stages',                  unit: '—' },
        { symbol: 'k',          meaning: 'Stage number (1 = bottom, N = top)',unit: '—' },
      ],
      explanation:
        'The bottom chain carries the full load. Each higher stage carries a fraction. This is why the bottom chain must be the strongest.',
    },

    {
      type: 'formula',
      label: 'String Tension in Each Segment',
      latex: String.raw`T_k = (N_{stages} - k + 1) \times m_{carriage} \times g`,
      variables: [
        { symbol: 'T_k',          meaning: 'Tension in stage k string/chain', unit: 'N' },
        { symbol: 'k',            meaning: 'Stage number (1 = bottom)',        unit: '—' },
        { symbol: 'm_{carriage}', meaning: 'Mass of payload + carriage',       unit: 'kg' },
        { symbol: 'g',            meaning: 'Gravitational acceleration',        unit: 'm/s²' },
      ],
      explanation:
        'At static equilibrium. Bottom stage carries weight × N_stages. Top stage carries only the payload weight. This determines minimum string/chain strength rating per stage.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Slop multiplies too',
      content: (
        <p>
          Any slop (backlash) in a cascade stage is also multiplied at the top carriage. A 3-stage
          cascade with 2 mm of play per stage produces 6 mm of slop at the end effector. Keep
          stages tight, use good bearings, and tension cables/chains properly — precision at the
          base equals precision at the top.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: '3-stage cascade: force and tension analysis',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A <strong>3-stage cascade elevator</strong> must lift a <strong>5 kg</strong> game
            piece carriage at <strong>3 m/s</strong> total extension speed.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            What tension must each string stage handle? What drive force must the motor system
            supply?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Carriage weight',
          latex: String.raw`W = m \times g = 5 \times 9.81 = 49.1 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The payload we need to lift is 49.1 N. This is what the top stage string carries at
              static equilibrium.
            </p>
          ),
        },
        {
          label: 'Tension in each stage (static)',
          latex: String.raw`T_3 = 49.1 \text{ N}, \quad T_2 = 2 \times 49.1 = 98.2 \text{ N}, \quad T_1 = 3 \times 49.1 = 147.3 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Stage 3 (top): just the payload. Stage 2: 2× payload (it supports stage 3 + payload).
              Stage 1 (bottom): 3× payload. Each lower stage must be rated for higher tension.
            </p>
          ),
        },
        {
          label: 'Required drive force',
          latex: String.raw`F_{drive} = N_{stages} \times W = 3 \times 49.1 = 147.3 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The motor chain (stage 1) must supply 147.3 N to hold the carriage statically. Add a
              2× safety factor for acceleration and dynamic loads: target 294 N of drive force.
            </p>
          ),
        },
        {
          label: 'Stage speed from total speed',
          latex: String.raw`v_{stage} = \frac{v_{total}}{N_{stages}} = \frac{3}{3} = 1 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The motor chain needs to move at 1 m/s to produce 3 m/s at the top carriage. Use
              this in the gear ratio formula from the previous lesson.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Stage tensions: top = <strong>49.1 N</strong>, middle = <strong>98.2 N</strong>, bottom ={' '}
          <strong>147.3 N</strong>. Motor drive force needed: <strong>147 N static</strong> (use
          294 N with 2× SF). Stage speed: <strong>1 m/s</strong>.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Total travel',
          latex: String.raw`x_{total} = N_{stages} \times x_{stage}`,
        },
        {
          label: 'Top carriage speed',
          latex: String.raw`v_{top} = N_{stages} \times v_{stage}`,
        },
        {
          label: 'Drive force needed',
          latex: String.raw`F_{drive} = N_{stages} \times m_{carriage} \times g`,
          note: 'Static; multiply by SF ≥ 2',
        },
        {
          label: 'Stage k tension',
          latex: String.raw`T_k = (N - k + 1) \times W_{carriage}`,
          note: 'k=1 is bottom (highest tension)',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A 2-stage cascade driven stage moves at 1.5 m/s. What is the top carriage speed?',
          options: ['0.75 m/s', '1.5 m/s', '3.0 m/s', '4.5 m/s'],
          correctIndex: 2,
          explanation: 'In a 2-stage cascade, top carriage speed = 2 × stage speed = 2 × 1.5 = 3.0 m/s.',
        },
        {
          question: 'A 3-stage cascade must lift a 6 kg carriage. What force must the bottom stage chain carry (static, no safety factor)?',
          options: ['19.6 N', '58.9 N', '117.7 N', '176.6 N'],
          correctIndex: 3,
          explanation: 'Bottom stage carries N × W = 3 × (6 × 9.81) = 3 × 58.9 = 176.6 N.',
        },
        {
          question: 'In a cascade elevator, which string or chain stage must be the strongest?',
          options: [
            'The top stage — it carries the most carriage weight directly',
            'The middle stage — it balances the load across the elevator',
            'The bottom stage — it carries N times the payload weight',
            'All stages carry equal tension by mechanical equilibrium',
          ],
          correctIndex: 2,
          explanation: 'The bottom stage chain supports all stages above it. In an N-stage cascade it carries N × payload weight, making it the highest tension element.',
        },
        {
          question: 'A cascade elevator has 1 mm of slop per stage. With 3 stages, how much slop appears at the top carriage?',
          options: ['1 mm', '2 mm', '3 mm', '0.33 mm'],
          correctIndex: 2,
          explanation: 'Positional error multiplies through cascade stages just like travel does. 3 stages × 1 mm = 3 mm of slop at the top carriage.',
        },
      ],
    },
  ],
};
