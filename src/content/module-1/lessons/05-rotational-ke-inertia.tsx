import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson05: Lesson = {
  id: 'rotational-ke-inertia',
  title: 'Rotational KE & Moment of Inertia',
  subtitle: 'Why your flywheel keeps spinning — and how long it takes to get there.',
  order: 5,
  estimatedMinutes: 25,
  tags: ['rotational', 'inertia', 'flywheel', 'shooter'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            A shooter flywheel spinning at 3,000 RPM stores energy — a lot of it. When a game piece
            hits the wheel and momentarily slows it down, that stored energy is what launches the
            piece. A heavier, larger flywheel stores more energy and drops speed less between shots,
            meaning faster recovery time. But it also takes longer to spin up.
          </p>
          <p>
            The quantity that captures "how hard it is to change an object's rotational speed" is
            the <strong>moment of inertia</strong> — the rotational equivalent of mass.
            Understanding it lets you design shooter flywheels and other spinning mechanisms with
            intentional tradeoffs.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Rotational inertia in FRC mechanisms',
      content: (
        <p>
          Shooter flywheels (energy storage, spin-up time, recovery between shots), intake rollers
          (how quickly they can change speed to match game piece contact), turret rotation (inertia
          of the whole upper assembly), and arm dynamics (how fast an arm responds to motor commands)
          — all depend on moment of inertia. It appears wherever something rotates.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rotational kinetic energy</h3>
          <p>
            Just as a moving object has kinetic energy <M tex="\tfrac{1}{2}mv^2" />, a rotating
            object stores kinetic energy proportional to its moment of inertia and the square
            of its angular velocity.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Rotational Kinetic Energy',
      latex: String.raw`KE_{rot} = \tfrac{1}{2} I \omega^2`,
      variables: [
        { symbol: 'KE_{rot}',  meaning: 'Rotational kinetic energy', unit: 'J' },
        { symbol: 'I',         meaning: 'Moment of inertia',          unit: 'kg·m²' },
        { symbol: '\\omega',   meaning: 'Angular velocity',           unit: 'rad/s' },
      ],
      explanation:
        'To find the energy stored in a flywheel, calculate I for its shape, convert RPM to rad/s (multiply by π/30), then apply the formula. This energy is what launches the game piece.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Moment of inertia for common shapes</h3>
          <p>
            The moment of inertia depends on how mass is distributed relative to the rotation axis.
            Mass far from the axis contributes much more than mass near it — the contribution scales
            with the square of the distance. This is why putting mass at the rim of a flywheel is
            so effective.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Moment of Inertia — Common Shapes',
      latex: String.raw`I_{disk} = \tfrac{1}{2}mr^2 \qquad I_{ring} = mr^2 \qquad I_{rod,end} = \tfrac{1}{3}mL^2 \qquad I_{point} = mr^2`,
      variables: [
        { symbol: 'I_{disk}',    meaning: 'Solid disk/cylinder about its axis',  unit: 'kg·m²' },
        { symbol: 'I_{ring}',    meaning: 'Hollow ring/thin-walled cylinder',     unit: 'kg·m²' },
        { symbol: 'I_{rod,end}', meaning: 'Uniform rod about one end',            unit: 'kg·m²' },
        { symbol: 'I_{point}',   meaning: 'Point mass at distance r',             unit: 'kg·m²' },
        { symbol: 'm',           meaning: 'Mass',                                  unit: 'kg' },
        { symbol: 'r',           meaning: 'Radius',                                unit: 'm' },
        { symbol: 'L',           meaning: 'Length of rod',                         unit: 'm' },
      ],
      explanation:
        'For a flywheel with mass concentrated at the rim (ring approximation), I = mr². For a solid aluminum disk of the same mass and radius, I = ½mr² — half as much inertia. If you want energy storage, use a ring; if you want fast spin-up with less energy, use a solid disk.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Put flywheel mass at the rim',
      content: (
        <p>
          Since inertia scales as <M tex="r^2" />, mass at the rim contributes twice as much inertia
          per kilogram as mass at the average radius of a solid disk. A hex shaft with a heavy
          outer ring (like a polycarbonate ring weighted with steel or lead) stores significantly
          more energy for the same total mass. More stored energy = smaller drop in wheel speed
          per shot = faster recovery.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Parallel axis theorem</h3>
          <p>
            The formulas above give inertia about the object's own center of mass. If the
            rotation axis is offset from the center, add an extra term:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Parallel Axis Theorem',
      latex: String.raw`I = I_{cm} + md^2`,
      variables: [
        { symbol: 'I',      meaning: 'Inertia about the new axis',          unit: 'kg·m²' },
        { symbol: 'I_{cm}', meaning: 'Inertia about the center of mass',    unit: 'kg·m²' },
        { symbol: 'm',      meaning: 'Mass of the object',                  unit: 'kg' },
        { symbol: 'd',      meaning: 'Distance between the two axes',       unit: 'm' },
      ],
      explanation:
        'Used when a component (like an arm segment or roller) rotates about an axis that is not its center of mass. The md² term is always additive — offset rotation always increases inertia.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Spin-up time</h3>
          <p>
            The time to spin a flywheel up from rest to target speed follows from the rotational
            version of Newton's second law: <M tex="\tau = I\alpha" />, where{' '}
            <M tex="\alpha = \Delta\omega / t" /> is the angular acceleration. Rearranging:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Spin-up Time',
      latex: String.raw`t = \frac{I \cdot \Delta\omega}{\tau_{net}}`,
      variables: [
        { symbol: 't',             meaning: 'Time to spin up',             unit: 's' },
        { symbol: 'I',             meaning: 'Moment of inertia',           unit: 'kg·m²' },
        { symbol: '\\Delta\\omega',meaning: 'Change in angular velocity',  unit: 'rad/s' },
        { symbol: '\\tau_{net}',   meaning: 'Net motor torque (motor torque minus load)', unit: 'N·m' },
      ],
      explanation:
        'τ_net is the motor stall torque reduced by the load. For a freely spinning flywheel, load is approximately the friction torque — small. This formula gives minimum spin-up time; real spin-up takes longer as back-EMF reduces available torque at speed.',
    },

    {
      type: 'worked-example',
      title: 'Flywheel energy storage and spin-up time',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A flywheel disk: <strong>2 kg mass</strong>, <strong>6-inch (0.1524 m) diameter</strong>,
            spinning at <strong>3,000 RPM</strong>. Motor: <strong>NEO</strong> (stall torque 3.28 N·m).
          </p>
          <p className="text-slate-500">
            How much energy does it store? How long does spin-up take from rest?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Calculate moment of inertia',
          latex: String.raw`I = \tfrac{1}{2}mr^2 = \tfrac{1}{2}(2)(0.0762)^2 = \tfrac{1}{2}(2)(0.00581) = 0.00581 \text{ kg·m}^2`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Radius = diameter / 2 = 0.1524 / 2 = 0.0762 m. Solid disk: <M tex="I = \tfrac{1}{2}mr^2" />.
            </p>
          ),
        },
        {
          label: 'Convert RPM to rad/s',
          latex: String.raw`\omega = 3000 \times \frac{\pi}{30} = 3000 \times 0.10472 = 314.2 \text{ rad/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Always convert to rad/s before using in energy or torque equations.
            </p>
          ),
        },
        {
          label: 'Calculate stored energy',
          latex: String.raw`KE_{rot} = \tfrac{1}{2}I\omega^2 = \tfrac{1}{2}(0.00581)(314.2)^2 = \tfrac{1}{2}(0.00581)(98,722) = 286.8 \text{ J}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              About 287 joules — enough to spin-up and recover between rapid shots if motor
              replenishes the lost energy fast enough.
            </p>
          ),
        },
        {
          label: 'Calculate spin-up time (average torque approximation)',
          latex: String.raw`t = \frac{I \cdot \Delta\omega}{\tau_{avg}} = \frac{0.00581 \times 314.2}{3.28 / 2} = \frac{1.826}{1.64} = 1.11 \text{ s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Using average torque ≈ stall torque / 2 (since torque decreases linearly with speed).
              Actual spin-up is slightly longer. About 1.1 seconds from rest to 3,000 RPM.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          The 2 kg, 6-inch flywheel stores <strong>~287 J</strong> at 3,000 RPM and takes{' '}
          <strong>~1.1 seconds</strong> to spin up from rest with a NEO. If each shot removes
          50 J (speed drops ~10%), the motor only needs ~0.2 s to recover — fast enough for
          rapid-fire shot cycles.
        </p>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Recovery time between shots',
      content: (
        <p>
          The energy a game piece takes from the flywheel is approximately the kinetic energy
          change: <M tex="\Delta KE = \tfrac{1}{2}I(\omega_1^2 - \omega_2^2)" />. Minimize this
          by: (1) higher flywheel inertia (stores more, drops speed less per shot), (2) running the
          flywheel faster (energy scales as ω²), or (3) delivering more motor power (spins up faster).
          Most competitive shooters target less than 5% speed drop per shot.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Rotational KE',    latex: String.raw`KE_{rot} = \tfrac{1}{2}I\omega^2` },
        { label: 'Solid disk',       latex: String.raw`I = \tfrac{1}{2}mr^2` },
        { label: 'Ring (rim mass)',  latex: String.raw`I = mr^2` },
        { label: 'Rod (at end)',     latex: String.raw`I = \tfrac{1}{3}mL^2` },
        { label: 'Parallel axis',    latex: String.raw`I = I_{cm} + md^2` },
        { label: 'Spin-up time',     latex: String.raw`t = I\Delta\omega / \tau_{net}` },
        { label: 'RPM → rad/s',      latex: String.raw`\omega = \text{RPM} \times \pi/30` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A solid disk flywheel has mass 2 kg and radius 0.1 m. What is its moment of inertia?',
          options: ['0.005 kg·m²', '0.01 kg·m²', '0.02 kg·m²', '0.04 kg·m²'],
          correctIndex: 1,
          explanation: 'For a solid disk: I = 0.5 * m * r^2 = 0.5 * 2 * (0.1)^2 = 0.5 * 2 * 0.01 = 0.01 kg·m².',
        },
        {
          question: 'You have two flywheel options with the same mass and diameter. Option A is a solid disk; Option B is a ring with all mass at the rim. Which stores more energy at the same RPM?',
          options: [
            'Option A (solid disk), because it has more material near the center',
            'Option B (ring), because mass at the rim maximizes moment of inertia',
            'They store the same energy — same mass and diameter',
            'Depends on the RPM',
          ],
          correctIndex: 1,
          explanation: 'For a ring, I = m*r^2; for a solid disk, I = 0.5*m*r^2. The ring has twice the moment of inertia and therefore twice the rotational KE at the same speed. Putting mass at the rim is always more efficient for energy storage.',
        },
        {
          question: 'A flywheel spinning at 3000 RPM (314 rad/s) has I = 0.02 kg·m². How much energy does it store?',
          options: ['9.9 J', '197 J', '988 J', '3141 J'],
          correctIndex: 2,
          explanation: 'KE_rot = 0.5 * I * omega^2 = 0.5 * 0.02 * (314)^2 = 0.01 * 98596 = 986 J ≈ 988 J.',
        },
        {
          question: 'A motor applies 2 N·m of net torque to a flywheel with I = 0.04 kg·m². How long to spin up from rest to 200 rad/s?',
          options: ['1 s', '4 s', '8 s', '16 s'],
          correctIndex: 1,
          explanation: 'Spin-up time t = I * delta_omega / tau_net = 0.04 * 200 / 2 = 8 / 2 = 4 s.',
        },
      ],
    },
  ],
};
