import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson06: Lesson = {
  id: 'electrical-basics',
  title: 'Electrical Basics',
  subtitle: 'Battery, voltage, current — the plumbing behind every motor.',
  order: 6,
  estimatedMinutes: 30,
  tags: ['electrical', 'ohm', 'voltage', 'current', 'resistance', 'battery'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Your robot browning out in autonomous is not a software bug. It is a voltage problem.
            Six motors each drawing 80 A simultaneously creates a 480 A total current draw —
            across a battery with real internal resistance, that drops the terminal voltage from
            12 V to something the roboRIO's brownout protection cuts power to maintain stability.
          </p>
          <p>
            Electrical fundamentals are not optional knowledge for FRC. They explain brownouts,
            why your motors make different sounds at different battery charge levels, why wire
            gauge matters, and how to design an electrical system that doesn't fail in finals.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Electrical math affects mechanical performance',
      content: (
        <p>
          A motor's torque output is proportional to current, which depends on available voltage.
          If battery sag drops voltage from 12 V to 9 V, your motors have roughly 75% of their
          rated torque available. That is not a programming problem — it is a physics consequence
          you can predict and design around.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Voltage, Current, Resistance</h3>
          <p>
            Think of electrical circuits as water systems. <strong>Voltage</strong> (V, volts) is
            the pressure pushing current through the circuit — like water pressure in a pipe.
            <strong> Current</strong> (I, amperes) is the flow rate — how many electrons per second
            pass a point. <strong>Resistance</strong> (R, ohms) is the restriction — like a narrow
            pipe slowing flow.
          </p>
          <p>
            Ohm's Law connects all three: voltage equals current times resistance. It is the most
            fundamental equation in electronics.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: "Ohm's Law",
      latex: String.raw`V = IR`,
      variables: [
        { symbol: 'V', meaning: 'Voltage (potential difference)', unit: 'V (volts)' },
        { symbol: 'I', meaning: 'Current',                        unit: 'A (amperes)' },
        { symbol: 'R', meaning: 'Resistance',                     unit: 'Ω (ohms)' },
      ],
      explanation:
        'Rearrange freely: I = V/R (find current from voltage and resistance), R = V/I (find resistance). In FRC, you often calculate I = V/R to find how much current a circuit or motor draws, then check whether the breaker and wire can handle it.',
    },

    {
      type: 'formula',
      label: 'Electrical Power',
      latex: String.raw`P = IV = I^2 R = \frac{V^2}{R}`,
      variables: [
        { symbol: 'P', meaning: 'Electrical power', unit: 'W (watts)' },
        { symbol: 'I', meaning: 'Current',          unit: 'A' },
        { symbol: 'V', meaning: 'Voltage',          unit: 'V' },
        { symbol: 'R', meaning: 'Resistance',       unit: 'Ω' },
      ],
      explanation:
        'P = I²R is the heat dissipation formula — this is how much power is wasted as heat in wires and motor windings. A 1 Ω wire carrying 100 A dissipates 10,000 W — enough to start a fire. Use the right gauge wire.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The FRC battery</h3>
          <p>
            FRC robots use a sealed lead-acid (SLA) battery: <strong>12 V nominal</strong>,
            approximately <strong>18 Ah</strong> capacity. The critical electrical property that
            most teams overlook is the battery's <em>internal resistance</em> — typically around{' '}
            <strong>0.015–0.025 Ω</strong> for a fresh battery, higher for an aging one.
          </p>
          <p>
            When the robot draws high current, that internal resistance causes a voltage drop
            <em> inside</em> the battery itself. The voltage the robot actually sees — at the
            terminal — is lower than the battery's open-circuit voltage:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Battery Voltage Under Load',
      latex: String.raw`V_{terminal} = V_{batt} - I \cdot R_{int}`,
      variables: [
        { symbol: 'V_{terminal}', meaning: 'Voltage at robot terminals (what motors see)', unit: 'V' },
        { symbol: 'V_{batt}',     meaning: 'Open-circuit battery voltage (~12.6 V full charge)', unit: 'V' },
        { symbol: 'I',            meaning: 'Total current draw',                    unit: 'A' },
        { symbol: 'R_{int}',      meaning: 'Battery internal resistance',           unit: 'Ω' },
      ],
      explanation:
        'The roboRIO triggers a brownout if terminal voltage drops below ~6.3 V. With R_int = 0.020 Ω and V_batt = 12.5 V, reaching brownout requires I = (12.5 − 6.3) / 0.020 = 310 A total draw — achievable if multiple mechanisms stall simultaneously.',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Wire resistance adds to the problem',
      content: (
        <p>
          Wire has resistance too. 10 feet of 12 AWG wire has about 0.0016 Ω of resistance.
          At 100 A, that drops another 0.16 V — per wire (you have two: positive and ground).
          Total wire drop can be 0.3–1.0 V on a poorly designed harness. Use appropriately
          gauged wire: 6 AWG for main runs, 10 AWG for high-current motor circuits, 18 AWG
          for signals and sensors.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Stagger high-current mechanisms to prevent brownouts',
      content: (
        <p>
          If your drivetrain, shooter flywheel, and elevator all spin up simultaneously during
          auto, the combined inrush current can easily exceed 300 A for a few hundred
          milliseconds — enough for a brownout. Sequence your auto to delay spin-up of secondary
          mechanisms by 0.1–0.3 seconds. The voltage sag is brief but has outsized consequences
          on roboRIO stability.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Series vs. parallel circuits</h3>
          <p>
            In a <strong>series circuit</strong>, components are end-to-end: same current flows
            through all, voltages add. In a <strong>parallel circuit</strong>, components share
            the same voltage; currents add. FRC motors are all wired in parallel off the main
            bus — each sees roughly the same voltage, but the total current is the sum of all
            motor currents.
          </p>
          <p>
            The PDP/PDH distributes power to each mechanism through individual breakers. When a
            mechanism draws too much current, its breaker trips — protecting the wiring but
            disabling the mechanism for the rest of the match if the breaker doesn't reset.
          </p>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'Will the robot brownout?',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            During auto, the robot draws <strong>200 A</strong> total (drivetrain + shooter
            + intake). The battery has <strong>12.5 V open-circuit</strong> and{' '}
            <strong>0.020 Ω internal resistance</strong>. Assume 0.5 Ω total wire resistance
            in the main power path.
          </p>
          <p className="text-slate-500">What voltage do the motors see? Will the robot brownout?</p>
        </div>
      ),
      steps: [
        {
          label: 'Calculate voltage drop across battery internal resistance',
          latex: String.raw`V_{drop,batt} = I \cdot R_{int} = 200 \times 0.020 = 4.0 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              4 volts is lost inside the battery at 200 A draw. This is the dominant loss source.
            </p>
          ),
        },
        {
          label: 'Calculate voltage drop across wire resistance',
          latex: String.raw`V_{drop,wire} = I \cdot R_{wire} = 200 \times 0.005 = 1.0 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Using a more realistic wire resistance of 0.005 Ω (well-crimped 6 AWG run). Wire drop
              is 1.0 V additional.
            </p>
          ),
        },
        {
          label: 'Calculate terminal voltage',
          latex: String.raw`V_{terminal} = V_{batt} - V_{drop,batt} - V_{drop,wire} = 12.5 - 4.0 - 1.0 = 7.5 \text{ V}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The motors see 7.5 V instead of 12.5 V — about 60% of rated voltage. Motor torque
              is roughly proportional to voltage, so you have approximately 60% rated torque available.
            </p>
          ),
        },
        {
          label: 'Check against brownout threshold',
          latex: String.raw`V_{terminal} = 7.5 \text{ V} > V_{brownout} = 6.3 \text{ V} \quad \checkmark`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No brownout, but you are running at 7.5 V — significantly below nominal. If a
              stall event temporarily spikes current to 350 A, terminal voltage drops to{' '}
              <M tex="12.5 - 350 \times 0.025 = 3.75 \text{ V}" /> — deep into brownout territory.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          At 200 A draw, the robot sees <strong>7.5 V</strong> — no brownout, but significantly
          reduced motor performance. A stall spike to 350 A would cause a brownout. Implement
          current limits on all motor controllers: 40–60 A per motor is a common starting point.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Battery sag explains your auto issues',
      content: (
        <p>
          Teams often see autonomous routines work perfectly in testing but fail at competition.
          The difference is battery state. A fresh battery at 12.7 V and a tired one at 11.8 V
          after two matches deliver different voltages under load, causing motors to run at
          different speeds and timing assumptions to break. Always test auto on a battery at
          realistic charge levels, and write velocity-controlled auto routines (not open-loop
          time-based) to compensate.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: "Ohm's law",       latex: String.raw`V = IR`,                              note: 'V in volts, I in amps, R in Ω' },
        { label: 'Power',           latex: String.raw`P = IV = I^2R = V^2/R`,               note: 'P in watts' },
        { label: 'Voltage sag',     latex: String.raw`V_{out} = V_{batt} - I \cdot R_{int}`,note: 'R_int ≈ 0.020 Ω' },
        { label: 'Brownout',        latex: String.raw`V_{brownout} \approx 6.3 \text{ V}`,  note: 'roboRIO threshold' },
        { label: 'Current limit',   latex: String.raw`I_{max} \approx 40{-}60 \text{ A}`,   note: 'Per motor controller, typical FRC' },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A motor draws 30 A from a 12 V source. What power is it consuming?',
          options: ['0.4 W', '2.5 W', '42 W', '360 W'],
          correctIndex: 3,
          explanation: 'P = I * V = 30 A * 12 V = 360 W. This is electrical input power — mechanical output power will be less due to motor inefficiency.',
        },
        {
          question: 'A FRC battery has internal resistance of 0.020 Ω and the robot draws 200 A. How much voltage is lost across the battery internal resistance?',
          options: ['0.04 V', '0.4 V', '4.0 V', '40 V'],
          correctIndex: 2,
          explanation: 'V_drop = I * R_internal = 200 A * 0.020 Ω = 4.0 V. At 200 A, a 12 V battery effectively delivers only 8 V to the load — a significant sag.',
        },
        {
          question: 'The roboRIO brownout protection threshold is approximately 6.3 V. If battery open-circuit voltage is 12 V with 0.020 Ω internal resistance, what current draw causes brownout?',
          options: ['63 A', '157 A', '285 A', '630 A'],
          correctIndex: 2,
          explanation: 'Brownout at V_out = 6.3 V: I = (V_batt - V_brownout) / R_int = (12 - 6.3) / 0.020 = 5.7 / 0.020 = 285 A.',
        },
        {
          question: 'Doubling the current through a resistor multiplies the power dissipated (heat) by:',
          options: ['2x (linear relationship)', '4x (current squared)', '8x (current cubed)', 'No change — only voltage matters'],
          correctIndex: 1,
          explanation: 'P = I^2 * R, so power scales with the square of current. Doubling current quadruples heat dissipation in wires and motor windings — why overcurrent is so damaging.',
        },
      ],
    },
  ],
};
