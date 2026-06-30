import { type Lesson } from '../../../types/curriculum';

export const lesson06: Lesson = {
  id: 'chain-belt-drive',
  title: 'Chain & Belt Drive',
  subtitle: 'Center-to-center distance, pitch, sprocket ratio, and max chain load.',
  order: 6,
  estimatedMinutes: 25,
  tags: ['chain', 'belt', 'sprocket', 'pitch', 'center-distance'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Chain and belt are used everywhere in FRC — swerve module drive reductions, elevator
            stages, arm pivots, intake rollers. Unlike gears, which must mesh at a fixed center
            distance determined by tooth size, chain and belt let you place the driving and driven
            sprockets wherever packaging requires. That flexibility comes with a different set of
            calculations: center-to-center distance, chain pitch, and number of links are all
            interdependent and must be solved together.
          </p>
          <p>
            Get this math wrong and you'll either have a chain so tight it pops off under load or
            so loose it skips teeth in the first match. This lesson gives you the exact formulas
            teams use to spec chain runs before cutting the first piece of metal.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Chain vs belt — when to use each',
      content: (
        <p>
          <strong>#25 roller chain</strong> is compact, cheap, and tolerates shock loads well, but
          needs periodic retensioning as it wears. It's the standard for drivetrains, elevator
          stages, and high-load mechanisms. <strong>GT2/GT3 timing belt</strong> is quieter,
          lighter, and never needs retensioning after install — but costs more and can't handle
          as much lateral or shock load. Timing belt dominates precision mechanisms: swerve
          steer reductions, arm pivots, and wrist joints where backlash matters.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Gear ratio from sprocket teeth
          </h3>
          <p>
            The speed ratio works exactly like meshing gears: divide driven teeth by driver teeth.
            The torque ratio is the inverse. But unlike gears, chain and belt can{' '}
            <strong>skip teeth</strong> if the chain is too loose or the sprocket too small.
            Keep driver sprockets at 12 teeth minimum for #25 chain and 12+ for most belts. Below
            that, the chain wraps around too few teeth and skips under load.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Sprocket Speed & Torque Ratio',
      latex: String.raw`GR = \frac{N_{driven}}{N_{driver}} \qquad \omega_{out} = \frac{\omega_{in}}{GR} \qquad \tau_{out} = \tau_{in} \times GR \times \eta`,
      variables: [
        { symbol: 'GR',          meaning: 'Gear ratio (output slower when > 1)',  unit: '—' },
        { symbol: 'N_{driven}',  meaning: 'Driven (output) sprocket tooth count', unit: 'teeth' },
        { symbol: 'N_{driver}',  meaning: 'Driver (input) sprocket tooth count',  unit: 'teeth' },
        { symbol: '\\eta',       meaning: 'Efficiency (chain ~0.98, belt ~0.99)', unit: '—' },
      ],
      explanation:
        'Efficiency is near 100% for both — far better than a multi-stage gearbox. This is why a single chain reduction is preferred over adding a gear stage when packaging allows.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Center-to-center distance — the key calculation
          </h3>
          <p>
            Given two sprockets of known sizes, you choose a desired center-to-center (C-C)
            distance based on packaging constraints. The number of chain links required for that
            geometry is almost never a whole number. Because chain must close in complete links
            (or with a half-link master link), you round to the nearest even integer, then
            back-solve to find the true C-C distance your integer link count produces.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Chain Link Count (nominal → integer)',
      latex: String.raw`L = \frac{2C}{p} + \frac{N_1 + N_2}{2} + \frac{(N_2 - N_1)^2}{4\pi^2} \cdot \frac{p}{C}`,
      variables: [
        { symbol: 'L',   meaning: 'Number of chain links (round to nearest even integer)', unit: 'links' },
        { symbol: 'C',   meaning: 'Desired center-to-center distance',                      unit: 'inches' },
        { symbol: 'p',   meaning: 'Chain pitch (#25: 0.25 in, #35: 0.375 in)',              unit: 'in' },
        { symbol: 'N_1', meaning: 'Driver sprocket teeth',                                  unit: 'teeth' },
        { symbol: 'N_2', meaning: 'Driven sprocket teeth',                                  unit: 'teeth' },
      ],
      explanation:
        'Round the result to the nearest even integer. Odd link counts require a half-link (offset link), which is weaker than a full link and not recommended for high-load runs.',
    },

    {
      type: 'formula',
      label: 'True C-C from Integer Link Count',
      latex: String.raw`C = \frac{p}{8}\left[2L - (N_1+N_2) + \sqrt{\bigl(2L-(N_1+N_2)\bigr)^2 - \frac{8(N_2-N_1)^2}{\pi^2}}\right]`,
      variables: [
        { symbol: 'C', meaning: 'True center-to-center distance after rounding links', unit: 'inches' },
        { symbol: 'L', meaning: 'Rounded integer link count',                          unit: 'links' },
        { symbol: 'p', meaning: 'Chain pitch',                                          unit: 'in' },
      ],
      explanation:
        'Because you rounded L, the true C-C differs slightly from the nominal value. This back-solve gives you the actual slot or slot-adjust spacing to cut in your plate. Always add 2–4 extra links and use an idler tensioner so the chain stays tight as it wears.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Belt uses the same formula — substitute belt pitch and tooth counts',
      content: (
        <p>
          GT2 belt pitch = 2 mm, GT3 = 3 mm. Plug those values into the link-count formula
          (converting C to mm). The rounded "link count" is the belt tooth count — order that
          exact belt length from the supplier. Unlike chain, you can't add or remove links;
          the belt is a fixed loop.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Sizing a swerve drive chain reduction',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A swerve drive module needs a <strong>6.75:1</strong> total drive reduction from a NEO
            motor. Split across two #25 chain stages: Stage 1 is <strong>16T → 48T (3:1)</strong>{' '}
            with a desired C-C of <strong>2.5 in</strong>.
          </p>
          <p className="text-slate-500">
            Find the number of links needed and the true C-C distance for Stage 1.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Verify ratio split',
          latex: String.raw`\text{Stage 1}: \frac{48}{16} = 3{:}1 \quad \text{Stage 2}: \frac{36}{16} = 2.25{:}1 \quad \text{Total}: 3 \times 2.25 = 6.75{:}1\checkmark`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A single 108T sprocket would be unpackageable. Splitting 6.75:1 into two stages
              (3:1 and 2.25:1) keeps the largest sprocket at 48 teeth — compact enough for a
              swerve module.
            </p>
          ),
        },
        {
          label: 'Calculate nominal link count',
          latex: String.raw`L = \frac{2(2.5)}{0.25} + \frac{16+48}{2} + \frac{(48-16)^2}{4\pi^2} \cdot \frac{0.25}{2.5} = 20 + 32 + 2.59 \approx 54.6`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The third term — the correction for unequal sprocket sizes — adds 2.59 links.
              Without it you'd underestimate the required chain length.
            </p>
          ),
        },
        {
          label: 'Round to nearest even integer',
          latex: String.raw`L = 54.6 \rightarrow 54 \text{ links (even)}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              54 is the nearest even integer. This makes the chain slightly shorter than the nominal
              geometry, meaning the true C-C will be slightly less than 2.5 in.
            </p>
          ),
        },
        {
          label: 'Back-solve for true C-C',
          latex: String.raw`2L-(N_1+N_2) = 108-64 = 44 \quad \Delta^2 = 44^2 - \frac{8\times 32^2}{\pi^2} = 1936 - 831 = 1105`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Building up the discriminant under the square root.
            </p>
          ),
        },
        {
          label: 'Complete the C-C calculation',
          latex: String.raw`C = \frac{0.25}{8}\left[44 + \sqrt{1105}\right] = 0.03125\times(44 + 33.24) \approx 2.413 \text{ in}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The true C-C with 54 links is 2.413 in rather than 2.5 in. Design the plate slot
              to allow adjustment from 2.35 to 2.5 in so an idler or adjusting bolt can tension
              the chain to the true C-C.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Stage 1 needs <strong>54 links</strong> of #25 chain. True C-C:{' '}
          <strong>2.413 in</strong>. Machine the adjuster slot to span 2.35–2.5 in so you
          can tension properly.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Maximum chain load</h3>
          <p>
            Every chain has a <strong>working load limit (WLL)</strong>. Exceeding it causes
            rapid elongation ("stretch"), tooth-skipping, or outright breakage. For #25 roller
            chain, WLL ≈ 140 lbf (620 N). For long mechanism life, stay below 50% of WLL.
          </p>
          <p>
            The tight-side chain tension when transmitting torque is simply the output torque
            divided by the driven sprocket's pitch radius.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Chain Tension from Output Torque',
      latex: String.raw`T = \frac{\tau_{output}}{r_{sprocket}} = \frac{2\pi\,\tau_{output}}{N_{driven} \times p}`,
      variables: [
        { symbol: 'T',              meaning: 'Tight-side chain tension',              unit: 'N' },
        { symbol: '\\tau_{output}', meaning: 'Output torque at the driven sprocket',  unit: 'N·m' },
        { symbol: 'r_{sprocket}',   meaning: 'Pitch radius of driven sprocket = N·p/(2π)', unit: 'm' },
        { symbol: 'p',              meaning: 'Chain pitch (#25: 0.00635 m)',            unit: 'm' },
      ],
      explanation:
        'Compare T to the chain WLL and stay below 50% for a reliable service life. For shock-loaded mechanisms (intake deploy, climber), apply a 2× shock factor to the computed tension before comparing.',
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Sprocket ratio',
          latex: String.raw`GR = N_{driven}/N_{driver}`,
          note: 'Same as gear ratio math',
        },
        {
          label: 'Link count (nominal)',
          latex: String.raw`L = \tfrac{2C}{p} + \tfrac{N_1+N_2}{2} + \tfrac{p(N_2-N_1)^2}{4\pi^2 C}`,
          note: 'Round to nearest even integer',
        },
        {
          label: 'True C-C (back-solve)',
          latex: String.raw`C = \tfrac{p}{8}\!\left[2L\!-\!(N_1\!+\!N_2) + \sqrt{(\ldots)^2 - \tfrac{8\Delta N^2}{\pi^2}}\right]`,
          note: 'ΔN = N2 − N1',
        },
        {
          label: 'Chain tension',
          latex: String.raw`T = 2\pi\,\tau_{out}/(N_{driven}\cdot p)`,
          note: 'Compare to WLL; stay below 50%',
        },
        {
          label: '#25 chain specs',
          latex: String.raw`p = 0.25\text{ in} = 6.35\text{ mm},\quad WLL \approx 620\text{ N}`,
          note: '#35: p=0.375 in, WLL≈1780 N',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A driver sprocket has 18 teeth and the driven sprocket has 54 teeth. What is the gear ratio and which shaft spins slower?',
          options: [
            '1:3 — the driver shaft is slower',
            '3:1 — the driven (output) shaft spins 3× slower with 3× the torque',
            '2:1 — the driven shaft spins twice as slow',
            '18:1 — sprocket teeth directly set RPM',
          ],
          correctIndex: 1,
          explanation:
            'GR = N_driven / N_driver = 54 / 18 = 3. The output shaft rotates 3× slower than the input, but the output torque is 3× higher (times efficiency). This is the core trade-off for every reduction.',
        },
        {
          question: 'Why must the calculated number of chain links always be rounded to an even integer (or use a half-link for odd counts)?',
          options: [
            '#25 chain is only manufactured in even-link lengths',
            'Chain links alternate between inner and outer plates — an even count ensures the loop closes with matching plate types at each end',
            'Odd link counts cause the chain to skip teeth on the small sprocket',
            'Chain tension calculations only hold for even-link chains',
          ],
          correctIndex: 1,
          explanation:
            'Roller chain alternates inner links (with bushings) and outer links (with side plates). For the loop to close, both ends must match — requiring an even total. A half-link (master link) bridges an odd count but is weaker than a standard link.',
        },
        {
          question: 'A driven sprocket has 60 teeth, #25 chain pitch p = 0.00635 m, and receives 5 N·m of output torque. What is the chain tension?',
          options: ['~83 N', '~166 N', '~42 N', '~330 N'],
          correctIndex: 0,
          explanation:
            'r = N×p/(2π) = 60×0.00635/6.283 = 0.0606 m. T = τ/r = 5.0/0.0606 ≈ 83 N. The #25 WLL is ~620 N, so this is only 13% of the limit — a very comfortable margin.',
        },
        {
          question: 'You calculate 51.8 links for a chain run and round to 52. How does this affect the center-to-center distance versus your nominal design value?',
          options: [
            'It increases the true C-C slightly — the chain is a bit longer than the nominal geometry needs',
            'It decreases the true C-C slightly — fewer links means a shorter chain',
            'No effect — the chain stretches to fit whatever C-C you mount the sprockets at',
            'The chain breaks at the rounding discontinuity',
          ],
          correctIndex: 0,
          explanation:
            'Rounding 51.8 up to 52 adds links, making the chain slightly longer than nominal. The back-solve formula gives the true C-C for 52 links, which is slightly larger than the design value. Use an adjuster slot or idler to take up the slack.',
        },
      ],
    },
  ],
};
