import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'traction-limits',
  title: 'Traction Limits & Weight Distribution',
  subtitle: 'Friction is the force you cannot exceed — only redistribute.',
  order: 3,
  estimatedMinutes: 20,
  tags: ['traction', 'friction', 'weight', 'CoM'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            The traction limit isn't a suggestion — it's a hard wall imposed by physics. Once your
            drive force exceeds <M tex="\mu \cdot N" /> at any wheel, that wheel spins instead of
            gripping, and you lose the force entirely. Understanding how weight distributes across
            your wheels tells you which wheels are most likely to slip first.
          </p>
        </div>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Coefficient of friction for common FRC wheels
          </h3>
          <p>Typical μ values on FRC carpet:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Pneumatic tires — ~1.0 (best grip, but bounce)</li>
            <li>Colson Performa wheels — ~0.8 (go-to for competition)</li>
            <li>Neoprene treaded — ~0.7–0.9</li>
            <li>Omni wheels (forward) — ~0.8; (lateral) — ~0.1</li>
            <li>Smooth plastic / HDPE — ~0.4 (avoid for drive)</li>
          </ul>
          <p>
            Omni wheels are interesting: full grip in the forward direction, almost none sideways.
            That's intentional for steering, but dangerous if used incorrectly.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Traction Force Limit (per wheel)',
      latex: String.raw`F_{max,i} = \mu \cdot N_i`,
      variables: [
        { symbol: 'F_{max,i}', meaning: 'Maximum horizontal force before slip, wheel i', unit: 'N' },
        { symbol: '\\mu',      meaning: 'Coefficient of friction',                       unit: '—' },
        { symbol: 'N_i',       meaning: 'Normal force on wheel i',                       unit: 'N' },
      ],
      explanation: 'Normal force equals the fraction of robot weight carried by that wheel. If the robot is evenly balanced across 4 wheels, each carries m·g/4.',
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Weight transfer during acceleration
          </h3>
          <p>
            When a robot accelerates forward, inertia pushes the CoM backward — weight transfers to
            the rear wheels. The front wheels lose normal force; the rear wheels gain it. If the
            front wheels already have limited grip (say, they're omni), they'll break traction
            first. This is the same reason a car's rear squats under hard acceleration.
          </p>
          <p>
            The weight shift depends on CoM height <M tex="h" />, wheelbase <M tex="L" />, and
            acceleration <M tex="a" />:
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Normal Force Under Acceleration',
      latex: String.raw`N_{front} = \frac{m g \cdot x_{CoM}}{L} - \frac{m a \cdot h}{L} \qquad N_{rear} = \frac{m g \cdot (L - x_{CoM})}{L} + \frac{m a \cdot h}{L}`,
      variables: [
        { symbol: 'x_{CoM}', meaning: 'CoM distance from front axle', unit: 'm' },
        { symbol: 'h',       meaning: 'CoM height above ground',       unit: 'm' },
        { symbol: 'L',       meaning: 'Wheelbase (front-to-rear axle)', unit: 'm' },
        { symbol: 'a',       meaning: 'Robot acceleration',            unit: 'm/s²' },
      ],
      explanation: 'Positive acceleration reduces front normal force and increases rear. High CoM amplifies the transfer.',
    },
    {
      type: 'formula',
      label: 'Tipping Criterion',
      latex: String.raw`\text{Tips when: } F_{horizontal} \cdot h > m \cdot g \cdot x_{CoM}`,
      explanation: 'If the moment from horizontal force around the front-axle tipping point exceeds the restoring gravity moment, the robot tips forward (e.g., when hitting a wall at speed).',
    },
    {
      type: 'worked-example',
      title: 'Will the front wheels slip?',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            A <strong>100 lb (45.4 kg)</strong> robot accelerates at <strong>0.7g (6.87 m/s²)</strong>.
            Under static conditions, <strong>30% of weight</strong> is on the front wheels. CoM
            height = 0.25 m, wheelbase = 0.6 m. Front wheels are Colson (μ = 0.8).
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Will the front wheels slip during acceleration?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Static front normal force',
          latex: String.raw`N_{front,static} = 0.30 \times 45.4 \times 9.81 = 133.6 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              30% of total weight on front wheels.
            </p>
          ),
        },
        {
          label: 'Weight transfer term',
          latex: String.raw`\Delta N = \frac{m \cdot a \cdot h}{L} = \frac{45.4 \times 6.87 \times 0.25}{0.6} = \frac{78.0}{0.6} = 130 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              130 N transfers to the rear wheels during this acceleration.
            </p>
          ),
        },
        {
          label: 'Dynamic front normal force',
          latex: String.raw`N_{front,accel} = 133.6 - 130 = 3.6 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The front wheels are nearly unloaded — almost no weight on them at all.
            </p>
          ),
        },
        {
          label: 'Front traction limit under load',
          latex: String.raw`F_{max,front} = \mu \cdot N_{front} = 0.8 \times 3.6 = 2.9 \text{ N}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The front wheels can only provide 2.9 N of grip — essentially zero. They will
              spin (or skid) freely during hard acceleration.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          <strong>Yes, the front wheels will slip.</strong> The combination of a rear-biased CoM,
          tall CoM height, and hard acceleration nearly lifts the front wheels off the ground.
          Lower the CoM or move weight forward to fix this.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Never use all omni wheels',
      content: (
        <p>
          Omni wheels have near-zero lateral traction. A drivetrain with omni on all four corners
          can be pushed sideways almost freely by any defender. The standard fix: omni on rear
          corners, traction wheels (Colson/pneumatic) on front — or vice versa depending on CoM.
          Hybrid layouts let you turn smoothly while still resisting lateral pushes.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Tipping in auto',
      content: (
        <p>
          Teams that tip during autonomous almost always have a CoM that's too high and too far
          forward. The robot accelerates, hits the traction ceiling, and the front lifts. The fix
          is ballast low in the frame or a more rearward battery placement — calculated, not
          guessed.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Traction limit',
          latex: String.raw`F_{max} = \mu \cdot N`,
        },
        {
          label: 'Total traction',
          latex: String.raw`F_{max,total} = \mu \cdot m \cdot g`,
          note: 'All wheels, level ground',
        },
        {
          label: 'Front N (accel)',
          latex: String.raw`N_f = \tfrac{mg \cdot x_{CoM}}{L} - \tfrac{ma \cdot h}{L}`,
        },
        {
          label: 'Rear N (accel)',
          latex: String.raw`N_r = \tfrac{mg(L-x_{CoM})}{L} + \tfrac{ma \cdot h}{L}`,
        },
        {
          label: 'Tipping limit',
          latex: String.raw`F_h \cdot h < m g \cdot x_{CoM}`,
          note: 'Must hold to not tip forward',
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A 56 kg robot has four drive wheels with rubber tires (mu = 1.0). The maximum traction force the drivetrain can produce before wheels slip is:',
          options: ['56 N', '196 N', '549 N', '2160 N'],
          correctIndex: 2,
          explanation: 'F_max = mu * m * g = 1.0 * 56 * 9.81 = 549 N. All four wheels share this total traction budget.',
        },
        {
          question: 'When accelerating forward, weight shifts toward the rear wheels. This means the front wheels have:',
          options: [
            'More normal force, so more traction',
            'Less normal force, so less traction',
            'The same normal force — weight shift is a myth',
            'Zero normal force if acceleration is high enough',
          ],
          correctIndex: 1,
          explanation: 'During forward acceleration, inertia effectively shifts the center of mass rearward, reducing normal force on front wheels and increasing it on rear wheels. Front wheels lose traction potential; rear wheels gain it.',
        },
        {
          question: 'Omnidirectional (omni) wheels have significantly lower lateral (perpendicular) friction than front-to-back friction. Why should teams avoid putting omni wheels at all four corners?',
          options: [
            'Omni wheels are heavier and increase traction-limited acceleration',
            'With all-omni, the robot can be pushed sideways with almost no resistance',
            'Omni wheels increase rolling resistance in the drive direction',
            'Omni wheels cause the gyro to drift faster',
          ],
          correctIndex: 1,
          explanation: 'Omni wheels have low perpendicular CoF (typically < 0.1). With all four corners as omni, any lateral force easily slides the robot. Standard practice is omni at front/back corners and traction wheels at the remaining corners.',
        },
        {
          question: 'A robot is more likely to tip forward (over its front bumper) when:',
          options: [
            'The center of mass is low and far from the front',
            'The robot is decelerating quickly with a high center of mass',
            'The robot is moving slowly with no acceleration',
            'The robot is pushing backward against a wall',
          ],
          correctIndex: 1,
          explanation: 'Tipping forward requires the torque from deceleration (F_decel * h_CoM) to exceed the restoring torque (m*g * x_CoM). High CoM and/or rapid deceleration increases tipping risk.',
        },
      ],
    },
  ],
};
