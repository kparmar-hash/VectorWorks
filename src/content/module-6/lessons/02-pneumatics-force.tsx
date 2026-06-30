import { type Lesson } from '../../../types/curriculum';

export const lesson02: Lesson = {
  id: 'pneumatics-force',
  title: 'Pneumatics Force & Sizing',
  subtitle: 'Cylinder bore, pressure, tank capacity — know your air budget before you build.',
  order: 2,
  estimatedMinutes: 25,
  tags: ['pneumatics', 'cylinder', 'pressure', 'force', 'solenoid'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Pneumatics give you something motors can't: instant, repeatable, bang-bang actuation
            with no encoder feedback needed. But teams that don't calculate their air budget
            discover mid-match that their intake won't deploy because the tank is empty. This lesson
            gives you the math to size cylinders and predict how many full cycles you can complete
            in a 2 minute 30 second match.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Air runs out faster than you think',
      content: (
        <p>
          A 1.5-inch bore cylinder with a 4-inch stroke consumes roughly 7 in³ of air per full
          cycle (extend + retract). A standard pneumatic tank holds about 100 in³ at 120 PSI. At
          60 PSI working pressure, that's only about 14–16 full cycles before you're below working
          pressure. Count your actuations before kickoff day, not after.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cylinder extend force</h3>
          <p>
            Force is pressure multiplied by the area that pressure acts on. For a pneumatic cylinder
            extending, pressure acts on the full bore (piston face) area.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Cylinder Extend Force',
      latex: String.raw`F_{extend} = P \times A_{bore} \qquad A_{bore} = \pi \left(\frac{d_{bore}}{2}\right)^2`,
      variables: [
        { symbol: 'F_{extend}',  meaning: 'Force on extend stroke',      unit: 'N (or lbf if P in PSI and A in in²)' },
        { symbol: 'P',           meaning: 'Gauge pressure at the cylinder', unit: 'Pa or PSI' },
        { symbol: 'A_{bore}',    meaning: 'Full bore cross-sectional area', unit: 'm² or in²' },
        { symbol: 'd_{bore}',    meaning: 'Cylinder bore diameter',         unit: 'm or in' },
      ],
      explanation:
        'When working in imperial units (common for FRC pneumatics), use PSI for pressure and in² for area — the result is lbf directly. 1 lbf = 4.448 N.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Retract force is less</h3>
          <p>
            On the retract stroke, pressure acts on the annular area around the rod — the bore area
            minus the rod area. This means retract force is always less than extend force with the
            same pressure. For mechanisms that need equal force in both directions, use a
            double-rod cylinder or a double-solenoid configuration with separate pressure regulation.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Cylinder Retract Force',
      latex: String.raw`F_{retract} = P \times \left(A_{bore} - A_{rod}\right) \qquad A_{rod} = \pi\left(\frac{d_{rod}}{2}\right)^2`,
      variables: [
        { symbol: 'F_{retract}', meaning: 'Force on retract stroke',   unit: 'N or lbf' },
        { symbol: 'A_{rod}',     meaning: 'Rod cross-sectional area',  unit: 'm² or in²' },
        { symbol: 'd_{rod}',     meaning: 'Rod diameter',              unit: 'm or in' },
      ],
      explanation:
        'For a typical 1.5-inch bore cylinder with a 0.5-inch rod at 60 PSI: A_bore = π(0.75)² ≈ 1.767 in², A_rod = π(0.25)² ≈ 0.196 in². F_retract = 60 × (1.767 − 0.196) = 60 × 1.571 ≈ 94.3 lbf.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Estimating cycle count from the tank</h3>
          <p>
            Each full cycle (extend + retract) consumes a volume of air equal to the bore area times
            the stroke length — twice, once for each direction. The tank stores a fixed amount of
            air at high pressure. As you actuate, pressure drops. When pressure falls below the
            minimum working pressure (typically 60 PSI for FRC actuators), the cylinder can no
            longer produce its rated force.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Cycle Count from Tank',
      latex: String.raw`n_{cycles} = \frac{V_{tank} \times (P_{tank} - P_{min})}{V_{per\,cycle} \times P_{working}}`,
      variables: [
        { symbol: 'n_{cycles}',    meaning: 'Number of full actuation cycles',        unit: '—' },
        { symbol: 'V_{tank}',      meaning: 'Tank volume',                             unit: 'in³ or L' },
        { symbol: 'P_{tank}',      meaning: 'Initial tank pressure',                   unit: 'PSI or Pa' },
        { symbol: 'P_{min}',       meaning: 'Minimum usable pressure (cutoff)',        unit: 'PSI or Pa' },
        { symbol: 'V_{per\\,cycle}', meaning: 'Air volume consumed per cycle',         unit: 'in³ or L' },
        { symbol: 'P_{working}',   meaning: 'Working pressure at the cylinder',        unit: 'PSI or Pa' },
      ],
      explanation:
        'V_per_cycle = 2 × A_bore × stroke (extend + retract, assuming same pressure both ways). Use consistent units throughout — all PSI or all Pa.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Over-size cylinders; regulate down',
      content: (
        <p>
          If your force calculation says you need 40 lbf and a 1-inch bore at 60 PSI gives 47 lbf,
          use the 1-inch bore. You can reduce pressure at the regulator to dial in exactly the force
          you need. An undersized bore cannot be compensated — you're limited by maximum FRC working
          pressure (~120 PSI, regulated to 60 PSI for most actuators).
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: '1.5-inch bore cylinder — force and cycle count',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A <strong>1.5-inch bore</strong>, <strong>4-inch stroke</strong> double-acting cylinder
            operates at <strong>60 PSI</strong>. The rod diameter is <strong>0.5 inches</strong>.
          </p>
          <p>
            Tank volume: <strong>0.6 L (36.6 in³)</strong> at <strong>120 PSI</strong>.
            Minimum usable pressure: <strong>60 PSI</strong>.
          </p>
          <p className="text-slate-500">Find extend force, retract force, and total number of full cycles.</p>
        </div>
      ),
      steps: [
        {
          label: 'Compute bore and rod areas',
          latex: String.raw`A_{bore} = \pi \left(\frac{1.5}{2}\right)^2 = \pi(0.75)^2 \approx 1.767 \text{ in}^2 \qquad A_{rod} = \pi(0.25)^2 \approx 0.196 \text{ in}^2`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Always compute areas from radii (diameter ÷ 2). The rod area will be subtracted for
              the retract calculation.
            </p>
          ),
        },
        {
          label: 'Extend force',
          latex: String.raw`F_{extend} = 60 \text{ PSI} \times 1.767 \text{ in}^2 \approx 106 \text{ lbf} = 472 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              106 lbf is substantial — enough to deploy most intakes and bumper-mounted mechanisms
              against gravity and light contact resistance.
            </p>
          ),
        },
        {
          label: 'Retract force',
          latex: String.raw`F_{retract} = 60 \times (1.767 - 0.196) = 60 \times 1.571 \approx 94.3 \text{ lbf} = 419 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Retract force is about 11% less than extend force. For most intake deployments this
              difference doesn't matter, but for a mechanism that needs equal force in both
              directions, this must be accounted for.
            </p>
          ),
        },
        {
          label: 'Air consumed per cycle',
          latex: String.raw`V_{cycle} = 2 \times A_{bore} \times \text{stroke} = 2 \times 1.767 \times 4 \approx 14.1 \text{ in}^3`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each extend and each retract consumes A × stroke of air at working pressure. Doubled
              for a full cycle (extend + retract).
            </p>
          ),
        },
        {
          label: 'Number of cycles from tank',
          latex: String.raw`n = \frac{36.6 \times (120 - 60)}{14.1 \times 60} = \frac{36.6 \times 60}{846} = \frac{2196}{846} \approx 2.6 \text{ cycles}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Only about 2–3 full cycles from a single tank! This is why most FRC teams running
              active pneumatics use either a compressor (to refill mid-match) or multiple tanks. If
              your robot relies on more than 3–4 pneumatic cycles per match, you need a compressor
              or more tank volume.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Extend: <strong>106 lbf (472 N)</strong>. Retract: <strong>94 lbf (419 N)</strong>.
          Tank provides approximately <strong>2–3 full cycles</strong> before dropping below 60 PSI
          — a compressor or additional tank storage is required for sustained use.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Bore area',
          latex: String.raw`A = \pi (d/2)^2`,
          note: 'd in inches → A in in²',
        },
        {
          label: 'Extend force',
          latex: String.raw`F_{ext} = P \times A_{bore}`,
          note: 'PSI × in² = lbf',
        },
        {
          label: 'Retract force',
          latex: String.raw`F_{ret} = P \times (A_{bore} - A_{rod})`,
          note: 'Always less than extend force',
        },
        {
          label: 'Volume per cycle',
          latex: String.raw`V_{cycle} = 2 \times A_{bore} \times \text{stroke}`,
          note: 'Extend + retract',
        },
        {
          label: 'Cycle count',
          latex: String.raw`n = \dfrac{V_{tank}(P_{tank} - P_{min})}{V_{cycle} \cdot P_{working}}`,
          note: 'Consistent units required',
        },
      ],
    },

    {
      type: 'worked-example',
      title: 'Match air budget — two cylinders, 5L tank',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Your robot has <strong>two identical cylinders</strong>: <strong>1.5-inch bore</strong>,{' '}
            <strong>3-inch stroke</strong>, <strong>0.5-inch rod</strong>. They share one{' '}
            <strong>5 L (305 in³) tank</strong> pressurized to <strong>120 PSI</strong>. Working
            pressure at the cylinders is <strong>60 PSI</strong>. Each cylinder cycles{' '}
            <strong>8 times</strong> per match.
          </p>
          <p className="text-slate-500">
            Find: extend force, retract force, total air consumed, and how much margin the tank provides.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Bore and rod areas',
          latex: String.raw`A_{bore} = \pi(0.75)^2 \approx 1.767 \text{ in}^2 \qquad A_{rod} = \pi(0.25)^2 \approx 0.196 \text{ in}^2`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Same cylinder as before — only the stroke and count differ.
            </p>
          ),
        },
        {
          label: 'Forces at 60 PSI',
          latex: String.raw`F_{ext} = 60 \times 1.767 \approx 106 \text{ lbf} \qquad F_{ret} = 60 \times 1.571 \approx 94 \text{ lbf}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Extend and retract forces are the same regardless of stroke length — stroke only
              affects how much air is consumed, not how hard the cylinder pushes.
            </p>
          ),
        },
        {
          label: 'Air per cycle (one cylinder)',
          latex: String.raw`V_{cycle,1} = A_{bore}\times\text{stroke} + (A_{bore}-A_{rod})\times\text{stroke} = (1.767+1.571)\times 3 = 3.338\times 3 \approx 10.0 \text{ in}^3`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Extend consumes A_bore × stroke; retract consumes (A_bore − A_rod) × stroke. Total
              for one cycle of one cylinder is their sum.
            </p>
          ),
        },
        {
          label: 'Total air for the whole match (both cylinders, 8 cycles each)',
          latex: String.raw`V_{total} = 2 \text{ cylinders} \times 8 \text{ cycles} \times 10.0 \text{ in}^3 = 160 \text{ in}^3`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              16 total cycles × 10 in³ per cycle = 160 in³ of air needed at working pressure.
            </p>
          ),
        },
        {
          label: 'Usable air from the tank',
          latex: String.raw`V_{usable} = V_{tank} \times \frac{P_{tank} - P_{min}}{P_{working}} = 305 \times \frac{120-60}{60} = 305 \times 1 = 305 \text{ in}^3`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The tank stores air down to 60 PSI (the minimum working pressure). The usable fraction
              equals (P_tank − P_min)/P_working × V_tank. Here (120 − 60)/60 = 1, so the full 305
              in³ volume is usable.
            </p>
          ),
        },
        {
          label: 'Margin',
          latex: String.raw`\text{margin} = \frac{V_{usable}}{V_{total}} = \frac{305}{160} \approx 1.9\times`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The tank can sustain about 1.9× the required air — a reasonable margin. Adding a
              compressor (which can refill mid-match) would eliminate this concern entirely.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Each cylinder extends with <strong>106 lbf</strong> and retracts with{' '}
          <strong>94 lbf</strong>. The full match requires <strong>160 in³</strong> of air. A 5 L
          (305 in³) tank provides ~<strong>1.9× margin</strong> — adequate without a compressor for
          8 cycles per cylinder per match.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Single-solenoid vs. double-solenoid — choose deliberately',
      content: (
        <p>
          A <strong>single-solenoid (5/2)</strong> valve is spring-return: it retracts the cylinder
          when de-energized. This is useful for mechanisms you want to automatically retract on
          robot disable (e.g., a climber that must be fully retracted at match end). A{' '}
          <strong>double-solenoid (5/3)</strong> valve holds its last position when de-energized —
          no spring, no return. Use this for an intake that must stay deployed without constant power.
          Choose based on your <em>fail-safe behavior</em>, not just which valve is on the shelf.
        </p>
      ),
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A 2-inch bore cylinder operates at 60 PSI. What is the extend force? (A_bore = π × 1² ≈ 3.14 in²)',
          options: ['60 lbf', '120 lbf', '188 lbf', '376 lbf'],
          correctIndex: 2,
          explanation: 'F = P × A = 60 PSI × 3.14 in² ≈ 188 lbf. The bore area is π × (d/2)² = π × 1² ≈ 3.14 in².',
        },
        {
          question: 'Why is the retract force of a pneumatic cylinder less than the extend force at the same pressure?',
          options: [
            'Pressure is lower on the retract side',
            'The rod occupies part of the piston face on the retract side, reducing effective area',
            'Friction increases on the retract stroke',
            'The solenoid restricts flow during retraction',
          ],
          correctIndex: 1,
          explanation: 'On the retract stroke, pressure acts on the annular area = A_bore − A_rod. The rod takes up part of the piston face, so the net force-producing area is smaller.',
        },
        {
          question: 'A team has a 1-inch bore, 6-inch stroke cylinder and wants to know how many cycles one tank provides. What volume of air does each full cycle consume? (A_bore = 0.785 in²)',
          options: ['4.7 in³', '9.4 in³', '0.785 in³', '6.0 in³'],
          correctIndex: 1,
          explanation: 'V_cycle = 2 × A_bore × stroke = 2 × 0.785 × 6 = 9.42 in³. The factor of 2 accounts for both the extend and retract strokes.',
        },
        {
          question: 'Which of the following is the best reason to use pneumatics rather than a motor for a game piece deploy mechanism?',
          options: [
            'Pneumatics provide more precise position control',
            'Pneumatics are lighter than all motors',
            'Pneumatics provide fast, repeatable bang-bang actuation without encoder feedback',
            'Pneumatics generate more total force than any motor',
          ],
          correctIndex: 2,
          explanation: 'Pneumatics excel at fast, repeatable two-position actuation (in/out, open/close) with no sensor feedback required. Motors are better for continuous or position-controlled motion.',
        },
      ],
    },
  ],
};
