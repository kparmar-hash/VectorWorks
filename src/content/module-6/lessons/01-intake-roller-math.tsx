import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'intake-roller-math',
  title: 'Intake & Roller Math',
  subtitle: 'Surface speed, compression, and torque — the numbers behind every intake design.',
  order: 1,
  estimatedMinutes: 20,
  tags: ['intake', 'roller', 'surface-speed', 'compression', 'torque'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            An intake is deceptively simple — spin some rollers, pick up a game piece. But teams
            that eyeball roller speed spend weeks chasing a mechanism that drops pieces under defense
            or jams when the driver is aggressive. The math behind intakes is fast to run, and it
            tells you exactly what motor, gear ratio, and compression to use before you cut a single
            piece of polycarbonate.
          </p>
          <p>
            The single most important number is <strong>surface speed</strong>: how fast the roller
            surface moves in meters per second. If the roller surface is slower than the game piece
            being fed in, the piece stalls the roller. If it's faster, friction pulls the piece in
            cleanly. Everything else follows from that.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Surface speed beats torque for intakes',
      content: (
        <p>
          Most FRC intakes fail because the roller is too slow, not because it lacks torque. A
          2024-style over-the-bumper intake needs roughly 8–14 m/s surface speed to reliably
          capture a note without requiring the driver to slow down. Calculate first, then build.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Surface speed from motor RPM</h3>
          <p>
            The roller surface speed is the tangential velocity at the roller's outer edge. A roller
            spinning at <M tex="\omega" /> RPM with diameter <M tex="d" /> meters has a
            circumference of <M tex="\pi d" />. Each revolution moves the surface that far, so
            multiplying by revolutions-per-second gives meters-per-second.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Roller Surface Speed',
      latex: String.raw`v_{surface} = \frac{\omega_{motor}}{GR \times 60} \times \pi d`,
      variables: [
        { symbol: 'v_{surface}',   meaning: 'Roller surface speed',       unit: 'm/s' },
        { symbol: '\\omega_{motor}', meaning: 'Motor free speed',          unit: 'RPM' },
        { symbol: 'GR',            meaning: 'Gear ratio (motor:roller)',   unit: '—' },
        { symbol: 'd',             meaning: 'Roller outer diameter',       unit: 'm' },
      ],
      explanation:
        'Dividing by 60 converts RPM to rev/s. Multiplying by πd converts rev/s to m/s. The gear ratio reduces the roller speed below the motor speed.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Compression and grip force</h3>
          <p>
            Compression is how much you squeeze the game piece between rollers (or a roller and a
            plate). More compression increases the normal force between roller and game piece, which
            increases the friction force pulling the piece in. But it also increases the torque the
            motor must supply — and too much compression stalls the motor entirely.
          </p>
          <p>
            A reasonable starting point for foam game pieces (like CRESCENDO notes) is
            10–20% compression. For harder game pieces, 5–15% is typical.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Required Motor Torque',
      latex: String.raw`\tau_{motor} = \frac{F_{compression} \times \mu \times r_{roller}}{GR}`,
      variables: [
        { symbol: '\\tau_{motor}',      meaning: 'Required motor torque',            unit: 'N·m' },
        { symbol: 'F_{compression}',    meaning: 'Normal force from compression',    unit: 'N' },
        { symbol: '\\mu',               meaning: 'Coefficient of friction (roller/piece)', unit: '—' },
        { symbol: 'r_{roller}',         meaning: 'Roller radius',                    unit: 'm' },
        { symbol: 'GR',                 meaning: 'Gear ratio',                       unit: '—' },
      ],
      explanation:
        'Friction force = μ × F_normal. Torque = friction force × radius. Dividing by GR reflects this back to the motor shaft. Compare to the motor stall torque — the motor must supply this comfortably without stalling.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Series rollers — staging the speed</h3>
          <p>
            When multiple rollers feed a game piece in sequence (e.g., outer intake → inner
            transfer → indexer), each downstream roller must run at least as fast as the upstream
            one, and ideally 5–10% faster. This keeps the piece moving forward instead of bunching
            up between stages.
          </p>
          <p>
            A common mistake: running all rollers at the same surface speed with the same sprocket
            ratio. Any small variation causes intermittent jams. Stage each section slightly faster.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'Over-compression stalls motors; under-compression drops pieces',
      content: (
        <p>
          Measure compression with calipers before finalizing the design. If the uncompressed game
          piece diameter is 35 cm and your intake gap is 30 cm, compression is 14% — in the
          reasonable range for foam. Going to 50% can more than double the required torque and trip
          your breaker mid-match.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Linear-moving intakes — gravity, load, and angle</h3>
          <p>
            Many modern intakes don't just spin in place — they <strong>deploy</strong>: a carriage,
            arm, or telescoping stage slides out to reach a game piece, then retracts to bring it
            inside the frame. Now the motor isn't only fighting friction on a roller, it's moving the
            entire mass of the intake assembly. Two new forces dominate: the <strong>weight</strong>{' '}
            of the intake (gravity) and any <strong>load</strong> it carries (the game piece plus the
            structure itself).
          </p>
          <p>
            The orientation of the travel matters enormously. If the intake slides straight up, the
            motor lifts the full weight. If it slides horizontally, gravity does almost nothing to
            the linear motor (only friction resists). Most real intakes deploy at an angle{' '}
            <M tex="\theta" /> from horizontal, so only the component of gravity{' '}
            <em>along the rail</em>, <M tex="mg\sin\theta" />, opposes the motor. The component{' '}
            <em>into the rail</em>, <M tex="mg\cos\theta" />, presses on the slide and adds friction.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Force to Move a Linear Intake on an Incline',
      latex: String.raw`F_{drive} = \underbrace{mg\sin\theta}_{\text{gravity along rail}} + \underbrace{\mu_s\, mg\cos\theta}_{\text{friction}} + \underbrace{ma}_{\text{acceleration}}`,
      variables: [
        { symbol: 'F_{drive}',  meaning: 'Linear force the actuator must supply',  unit: 'N' },
        { symbol: 'm',          meaning: 'Mass of intake assembly + game piece',   unit: 'kg' },
        { symbol: 'g',          meaning: 'Gravitational acceleration (9.81)',      unit: 'm/s²' },
        { symbol: '\\theta',    meaning: 'Angle of travel from horizontal',        unit: 'rad' },
        { symbol: '\\mu_s',     meaning: 'Coefficient of friction in the slide',   unit: '—' },
        { symbol: 'a',          meaning: 'Desired deployment acceleration',        unit: 'm/s²' },
      ],
      explanation:
        'Gravity along the rail is mg·sinθ — zero when horizontal (θ=0), full weight when vertical (θ=90°). Friction scales with the normal force mg·cosθ. The ma term is what it takes to accelerate the mass; set a=0 for the steady holding/slow-move case.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            That linear force has to come from a rotating motor. Whether you drive the slide with a
            lead screw, a rack-and-pinion, or a winch, there is some <strong>transmission radius</strong>{' '}
            <M tex="r_{eff}" /> (the pinion pitch radius, the spool radius, or for a lead screw the
            lead per radian) that converts torque into linear force: <M tex="F = \tau / r_{eff}" />.
            Reflecting that back through the gear ratio gives the torque the motor must produce.
          </p>
          <p>
            <strong>Extension vs. retraction.</strong> The sign of the gravity term flips depending
            on direction. Extending <em>down</em> the incline, gravity <em>helps</em> and the motor
            can even act as a brake. Retracting <em>up</em> the incline, gravity <em>fights</em> the
            motor and that is the worst case you must size for. Friction always opposes motion, so it
            keeps its sign relative to the direction of travel.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Motor Torque for Extension and Retraction',
      latex: String.raw`\tau_{motor} = \frac{r_{eff}}{GR}\Big( \pm\, mg\sin\theta \;+\; \mu_s\, mg\cos\theta \;+\; ma \Big)`,
      variables: [
        { symbol: '\\tau_{motor}', meaning: 'Required motor torque',                 unit: 'N·m' },
        { symbol: 'r_{eff}',       meaning: 'Effective drive radius (pinion/spool/lead)', unit: 'm' },
        { symbol: 'GR',            meaning: 'Gear ratio (motor:output)',             unit: '—' },
        { symbol: 'm',             meaning: 'Mass of intake + game piece',           unit: 'kg' },
        { symbol: '\\theta',       meaning: 'Angle of travel from horizontal',       unit: 'rad' },
        { symbol: '\\mu_s',        meaning: 'Slide coefficient of friction',         unit: '—' },
        { symbol: 'a',             meaning: 'Deployment acceleration',               unit: 'm/s²' },
      ],
      explanation:
        'Use +mg·sinθ when moving up the incline (retracting against gravity — the worst case) and −mg·sinθ when moving down (gravity assists). Always size the motor for the +sinθ case so it can both deploy and pull a loaded intake back up.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Why extension length matters</h3>
          <p>
            Extension length <M tex="L" /> shows up in three places. First, it sets the{' '}
            <strong>travel time</strong>: at deployment speed <M tex="v" />, the move takes{' '}
            <M tex="t = L/v" />, so a longer reach is a slower cycle unless you raise the speed (which
            raises the <M tex="ma" /> term during acceleration). Second, the work done against gravity
            and friction is force × distance, so a longer stroke means more <strong>energy</strong>{' '}
            and more battery sag. Third — and most important for <em>arm-style</em> intakes that pivot
            rather than slide — the extension acts as a lever arm: the gravity torque about the pivot
            grows directly with how far the mass sits from the joint.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Gravity Torque on a Pivoting (Arm) Intake',
      latex: String.raw`\tau_{gravity} = m\,g\,L_{cg}\cos\theta`,
      variables: [
        { symbol: '\\tau_{gravity}', meaning: 'Gravity torque about the pivot',       unit: 'N·m' },
        { symbol: 'm',               meaning: 'Mass of arm + game piece',             unit: 'kg' },
        { symbol: 'g',               meaning: 'Gravitational acceleration (9.81)',    unit: 'm/s²' },
        { symbol: 'L_{cg}',          meaning: 'Distance from pivot to center of mass', unit: 'm' },
        { symbol: '\\theta',         meaning: 'Arm angle above horizontal',           unit: 'rad' },
      ],
      explanation:
        'For an arm, the worst case is θ=0 (arm horizontal), where cosθ=1 and the full weight acts at the end of the lever. The torque scales linearly with L_cg — doubling the reach doubles the holding torque the motor must hold, so keep heavy components close to the pivot.',
    },

    {
      type: 'worked-example',
      title: 'Sizing a linear intake deploy motor',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            An intake carriage of <strong>2.5 kg</strong> (including a 0.3 kg game piece) slides on
            rails inclined at <strong>30°</strong> from horizontal. The slide friction coefficient is{' '}
            <strong>μ<sub>s</sub> = 0.15</strong>.
          </p>
          <p>
            It is driven by a pinion of <strong>radius 0.015 m</strong> through a{' '}
            <strong>20:1</strong> gearbox, and must accelerate at <strong>4 m/s²</strong> while
            <strong> retracting up the incline</strong>.
          </p>
          <p className="text-slate-500">Find the linear drive force and the required motor torque.</p>
        </div>
      ),
      steps: [
        {
          label: 'Gravity component along the rail',
          latex: String.raw`mg\sin\theta = 2.5 \times 9.81 \times \sin 30° = 24.5 \times 0.5 = 12.27 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Only half the weight resists motion along a 30° rail. On a vertical rail this would be
              the full 24.5 N; on a flat one it would be zero.
            </p>
          ),
        },
        {
          label: 'Friction force from the normal component',
          latex: String.raw`\mu_s\, mg\cos\theta = 0.15 \times 24.5 \times \cos 30° = 0.15 \times 21.24 = 3.19 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The rail presses with mg·cosθ = 21.24 N; friction is 15% of that. Friction opposes the
              retraction, so it adds to the required force.
            </p>
          ),
        },
        {
          label: 'Acceleration force, then total drive force',
          latex: String.raw`F_{drive} = mg\sin\theta + \mu_s mg\cos\theta + ma = 12.27 + 3.19 + (2.5 \times 4) = 25.46 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The ma term adds 10 N to get the carriage moving. Retracting up the incline is the worst
              case because gravity (+12.27 N) and friction both fight the motor.
            </p>
          ),
        },
        {
          label: 'Reflect through pinion and gear ratio to the motor',
          latex: String.raw`\tau_{motor} = \frac{F_{drive} \times r_{eff}}{GR} = \frac{25.46 \times 0.015}{20} = \frac{0.382}{20} \approx 0.019 \text{ N·m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The pinion converts force to torque (F × r), and the 20:1 reduction divides it down to
              the motor shaft. A NEO 550 (~0.97 N·m stall) handles this with enormous margin — the
              gearbox is the reason such a small motor can lift the carriage.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Drive force: <strong>25.5 N</strong> (worst-case retraction up the incline). Required motor
          torque: <strong>≈ 0.019 N·m</strong> — only ~2% of a NEO 550's stall torque, leaving huge
          margin for steeper angles, heavier game pieces, or a longer/heavier extension.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Surface speed',
          latex: String.raw`v = \dfrac{\omega_{motor}}{GR \times 60} \times \pi d`,
          note: 'ω in RPM, d in m → v in m/s',
        },
        {
          label: 'Friction force',
          latex: String.raw`F_{friction} = \mu \times F_{normal}`,
          note: 'μ ≈ 0.6–0.9 for rubber on foam',
        },
        {
          label: 'Motor torque needed',
          latex: String.raw`\tau_{motor} = \dfrac{F_{friction} \times r_{roller}}{GR}`,
          note: 'Compare to stall torque',
        },
        {
          label: 'Compression %',
          latex: String.raw`\text{compression} = \frac{d_{piece} - d_{gap}}{d_{piece}} \times 100\%`,
          note: 'Target 10–20% for foam pieces',
        },
        {
          label: 'Linear deploy force',
          latex: String.raw`F_{drive} = \pm mg\sin\theta + \mu_s mg\cos\theta + ma`,
          note: '+sinθ up the incline (worst case)',
        },
        {
          label: 'Deploy motor torque',
          latex: String.raw`\tau_{motor} = \dfrac{F_{drive} \times r_{eff}}{GR}`,
          note: 'r_eff = pinion/spool radius or screw lead/2π',
        },
        {
          label: 'Arm gravity torque',
          latex: String.raw`\tau_{gravity} = mgL_{cg}\cos\theta`,
          note: 'Worst case θ=0 (arm horizontal)',
        },
      ],
    },

    {
      type: 'simulation',
      componentKey: 'intake-load',
      title: 'Over-the-Bumper Intake — Live Arm Physics',
      description:
        'Extend and retract a pivoting OTB arm. Vary the motor, gear ratio, arm mass and length, roller size, and compression to see how gravity torque, motor current, and roller surface speed change in real time. Watch whether the motor can hold the arm at each angle.',
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A motor spins at 6000 RPM through a 2:1 gearbox driving a 3-inch (0.0762 m) diameter roller. What is the roller surface speed?',
          options: ['6.0 m/s', '12.0 m/s', '18.0 m/s', '3.0 m/s'],
          correctIndex: 1,
          explanation: 'v = (6000 / (2 × 60)) × π × 0.0762 = 50 rev/s × 0.2394 m ≈ 12.0 m/s. Dividing motor RPM by GR×60 gives rev/s at the roller, then multiplying by πd gives surface speed in m/s.',
        },
        {
          question: 'Increasing compression on an intake roller primarily increases which of the following?',
          options: [
            'Motor free speed',
            'Roller surface speed',
            'Normal force and friction on the game piece, raising required motor torque',
            'Gear ratio between motor and roller',
          ],
          correctIndex: 2,
          explanation: 'Compression increases the normal force between the roller and game piece. Since friction force = μ × F_normal, more compression means more friction force — which requires the motor to produce more torque to maintain speed.',
        },
        {
          question: 'Why should rollers later in an intake series run slightly faster than earlier rollers?',
          options: [
            'To increase total motor power consumption',
            'To prevent the game piece from bunching or jamming between stages',
            'To reduce compression at the intake entrance',
            'Because later rollers have larger diameters',
          ],
          correctIndex: 1,
          explanation: 'If downstream rollers are slower than upstream ones, the game piece catches up and bunches between stages. Each stage running 5–10% faster than the previous keeps the piece moving through cleanly.',
        },
        {
          question: 'A roller intake requires 0.12 N·m at the roller shaft. The gear ratio is 4:1. What motor torque is needed?',
          options: ['0.48 N·m', '0.03 N·m', '0.12 N·m', '4.0 N·m'],
          correctIndex: 1,
          explanation: 'Motor torque = roller torque / GR = 0.12 / 4 = 0.03 N·m. The gear ratio multiplies torque from motor to roller — so working backwards, motor torque is divided by GR.',
        },
        {
          question: 'A linear intake carriage of mass m slides on rails at angle θ from horizontal. As θ increases from 0° toward 90°, what happens to the gravity force the motor must fight while retracting?',
          options: [
            'It stays constant at mg regardless of angle',
            'It decreases, reaching zero when vertical',
            'It increases as mg·sinθ, reaching the full weight mg when vertical',
            'It depends only on friction, not on angle',
          ],
          correctIndex: 2,
          explanation: 'The gravity component along the rail is mg·sinθ. At θ=0 (horizontal) it is zero, and at θ=90° (vertical) sinθ=1 so the motor lifts the full weight mg. This is why steeper deploy angles demand more torque.',
        },
        {
          question: 'For a pivoting arm-style intake, at what arm angle is the gravity torque the motor must hold at its maximum?',
          options: [
            'When the arm is vertical (θ = 90°)',
            'When the arm is horizontal (θ = 0°)',
            'It is the same at every angle',
            'When the arm is at 45°',
          ],
          correctIndex: 1,
          explanation: 'Gravity torque is τ = mg·L_cg·cosθ. cosθ is largest (=1) at θ=0, when the arm is horizontal and the full weight acts at the end of the lever arm. Holding torque also grows linearly with extension length L_cg.',
        },
      ],
    },
  ],
};
