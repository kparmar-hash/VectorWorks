import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson05: Lesson = {
  id: 'swerve-kinematics',
  title: 'Swerve Drive Kinematics',
  subtitle: 'How independent steer-and-drive modules create omnidirectional motion.',
  order: 5,
  estimatedMinutes: 35,
  tags: ['swerve', 'kinematics', 'vector', 'inverse-kinematics'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Swerve drive dominated FRC from 2022 onward for good reason: every module steers
            independently and drives independently, so the robot can translate in any direction
            while simultaneously rotating. No tank turn needed. No strafing penalty.
          </p>
          <p>
            This flexibility comes from math. Each of the four modules needs to know its exact
            wheel angle and speed at every 20 ms control loop. Computing those values from the
            driver's joystick inputs — or from a trajectory — is the kinematics problem.
          </p>
        </div>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Chassis velocity: three degrees of freedom
          </h3>
          <p>
            A swerve robot has three independent velocity components:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><M tex="V_x" /> — forward/backward velocity (m/s)</li>
            <li><M tex="V_y" /> — left/right (strafe) velocity (m/s)</li>
            <li><M tex="\omega" /> — rotation rate (rad/s, positive = counter-clockwise)</li>
          </ul>
          <p>
            The driver joystick provides these three values. The kinematics problem is: given{' '}
            <M tex="(V_x, V_y, \omega)" />, what speed and angle should each module run?
          </p>
        </div>
      ),
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            The key insight: rotation adds a tangential velocity
          </h3>
          <p>
            When the robot rotates at rate <M tex="\omega" />, each module follows a circular arc
            around the robot's center. A module at position <M tex="(r_x, r_y)" /> from the center
            has a tangential velocity due to rotation:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              x-component from rotation: <M tex="-\omega \cdot r_y" /> (perpendicular to y)
            </li>
            <li>
              y-component from rotation: <M tex="+\omega \cdot r_x" /> (perpendicular to x)
            </li>
          </ul>
          <p>
            Add the translation velocity to get the total module velocity vector.
          </p>
        </div>
      ),
    },
    {
      type: 'formula',
      label: 'Inverse Kinematics — Module Velocity',
      latex: String.raw`\begin{aligned} V_{mod,x} &= V_x - \omega \cdot r_y \\ V_{mod,y} &= V_y + \omega \cdot r_x \end{aligned}`,
      variables: [
        { symbol: 'V_{mod,x}',  meaning: 'Module velocity x-component',                    unit: 'm/s' },
        { symbol: 'V_{mod,y}',  meaning: 'Module velocity y-component',                    unit: 'm/s' },
        { symbol: 'V_x, V_y',   meaning: 'Chassis translation velocity',                   unit: 'm/s' },
        { symbol: '\\omega',    meaning: 'Chassis rotation rate (+ CCW)',                   unit: 'rad/s' },
        { symbol: 'r_x, r_y',   meaning: 'Module position from robot center',              unit: 'm' },
      ],
      explanation: 'Apply this to each of the four modules using their individual (r_x, r_y) positions.',
    },
    {
      type: 'formula',
      label: 'Module Speed and Steering Angle',
      latex: String.raw`\text{speed} = \sqrt{V_{mod,x}^2 + V_{mod,y}^2} \qquad \theta_{steer} = \text{atan2}(V_{mod,y},\, V_{mod,x})`,
      variables: [
        { symbol: '\\text{speed}',    meaning: 'Module drive wheel speed',  unit: 'm/s' },
        { symbol: '\\theta_{steer}',  meaning: 'Module steering angle',     unit: 'rad' },
      ],
      explanation: 'atan2(y, x) returns the full four-quadrant angle in radians. Convert to degrees for display; keep radians for WPILib.',
    },
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Normalizing module speeds
          </h3>
          <p>
            After computing all four module speeds, one might exceed the physical maximum (motor
            free speed at that gear ratio). Normalizing scales all four speeds proportionally so
            the fastest module is at max and the ratio between modules is preserved.
          </p>
          <p>
            Find the maximum computed speed across all modules. If it exceeds{' '}
            <M tex="v_{max}" />, divide every module speed by that maximum.
          </p>
        </div>
      ),
    },
    {
      type: 'worked-example',
      title: 'Front-left module velocity during combined drive and rotate',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Robot chassis command: <strong>V_x = 1.0 m/s</strong>,{' '}
            <strong>V_y = 0.5 m/s</strong>, <strong>ω = 0.5 rad/s</strong> CCW.
          </p>
          <p>
            Front-left module is at position <M tex="r_x = +0.3 \text{ m}" />,{' '}
            <M tex="r_y = +0.3 \text{ m}" /> from robot center.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Find the module's required speed and steering angle.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Module x-velocity',
          latex: String.raw`V_{mod,x} = V_x - \omega \cdot r_y = 1.0 - 0.5 \times 0.3 = 1.0 - 0.15 = 0.85 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The CCW rotation pulls the front-left module's x-velocity slightly backward.
            </p>
          ),
        },
        {
          label: 'Module y-velocity',
          latex: String.raw`V_{mod,y} = V_y + \omega \cdot r_x = 0.5 + 0.5 \times 0.3 = 0.5 + 0.15 = 0.65 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rotation adds a positive y-component to the left-side module.
            </p>
          ),
        },
        {
          label: 'Module speed (magnitude)',
          latex: String.raw`\text{speed} = \sqrt{0.85^2 + 0.65^2} = \sqrt{0.7225 + 0.4225} = \sqrt{1.145} = 1.070 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The vector magnitude gives how fast the drive wheel should spin.
            </p>
          ),
        },
        {
          label: 'Steering angle',
          latex: String.raw`\theta = \text{atan2}(0.65,\, 0.85) = \text{atan2}(0.65, 0.85) \approx 37.4° \approx 0.653 \text{ rad}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The module steers 37.4° left of forward. All four modules get different angles when
              translating and rotating simultaneously.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Front-left module: drive at <strong>1.070 m/s</strong>, steer to{' '}
          <strong>37.4° (0.653 rad)</strong> from forward.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'WPILib SwerveDriveKinematics',
      content: (
        <p>
          <code>SwerveDriveKinematics</code> in WPILib runs these exact equations for all four
          modules simultaneously using matrix math. You pass a <code>ChassisSpeeds</code> object
          and receive four <code>SwerveModuleState</code> objects. Understanding the math helps you
          debug: if one module steers 180° wrong, it's usually a sign-convention error in how you
          defined that module's position vector.
        </p>
      ),
    },
    {
      type: 'callout',
      variant: 'deeper-dive',
      title: 'Matrix form',
      content: (
        <p>
          The full inverse kinematics for a 4-module swerve is an 8×3 matrix multiplication:
          multiply the kinematics matrix by the column vector{' '}
          <M tex="[V_x \; V_y \; \omega]^T" /> to get all eight module velocity components at once.
          WPILib uses Eigen (a C++ linear algebra library) under the hood. The matrix encodes the
          position of each module — change a wheel location and only the matrix needs updating.
        </p>
      ),
    },
    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Module Vx',
          latex: String.raw`V_{mod,x} = V_x - \omega r_y`,
        },
        {
          label: 'Module Vy',
          latex: String.raw`V_{mod,y} = V_y + \omega r_x`,
        },
        {
          label: 'Speed',
          latex: String.raw`\text{speed} = \sqrt{V_{mod,x}^2 + V_{mod,y}^2}`,
        },
        {
          label: 'Steer angle',
          latex: String.raw`\theta = \text{atan2}(V_{mod,y},\, V_{mod,x})`,
          note: 'rad, use Math.atan2 in Java/C++',
        },
        {
          label: 'Normalize',
          latex: String.raw`\text{if } \max(\text{speeds}) > v_{max}: \; \text{scale all by } v_{max}/\max`,
        },
      ],
    },
    {
      type: 'simulation',
      componentKey: 'swerve-kinematics',
      title: 'Swerve Kinematics Visualizer',
      description:
        'Set chassis Vx, Vy, and ω with sliders and watch all four module angles and speeds update live. Toggle field-centric mode to see how heading rotation transforms the velocity vector.',
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'In swerve inverse kinematics, why does each module need both a speed and a steering angle as outputs?',
          options: [
            'To redundantly verify the calculation',
            'Because each swerve module independently steers AND drives, so both must be commanded',
            'Speed controls the motor and angle controls the encoder',
            'One is for teleop, the other for autonomous',
          ],
          correctIndex: 1,
          explanation: 'Unlike tank drive where wheels only spin forward/back, each swerve module can point any direction while spinning at any speed. Inverse kinematics computes the required direction (atan2) and speed (magnitude of the velocity vector) for each module independently.',
        },
        {
          question: 'A swerve robot commands Vx = 1 m/s, Vy = 0 m/s, omega = 0 rad/s. A front-left module at position (+0.3 m, +0.3 m) from the robot center will have module velocity:',
          options: [
            'Vx_mod = 1 m/s, Vy_mod = 0 m/s (pure translation)',
            'Vx_mod = 1.3 m/s, Vy_mod = 0.3 m/s (adds position offset)',
            'Vx_mod = 0.7 m/s, Vy_mod = -0.3 m/s (subtracts offset)',
            'Vx_mod = 0 m/s, Vy_mod = 1 m/s (rotated 90°)',
          ],
          correctIndex: 0,
          explanation: 'V_mod_x = Vx - omega * r_y = 1 - 0 * 0.3 = 1 m/s. V_mod_y = Vy + omega * r_x = 0 + 0 * 0.3 = 0 m/s. With zero rotation (omega = 0), all modules get the same translation vector.',
        },
        {
          question: 'The atan2(Vy, Vx) function is used in swerve to compute:',
          options: [
            'The motor current for the steer motor',
            'The required steering angle for a module with velocity vector (Vx, Vy)',
            'The robot heading in field coordinates',
            'The encoder ticks per revolution for the drive motor',
          ],
          correctIndex: 1,
          explanation: 'atan2(Vy_mod, Vx_mod) gives the angle of the module velocity vector, which is the direction the module must point. atan2 is preferred over atan because it handles all four quadrants correctly.',
        },
        {
          question: 'After computing all four module speeds, the maximum speed exceeds the drive motor free speed. What should be done?',
          options: [
            'Discard the commands and do nothing this cycle',
            'Set all modules to maximum speed and ignore direction',
            'Scale all module speeds proportionally so the maximum equals the limit',
            'Reduce omega to zero to make room for translation',
          ],
          correctIndex: 2,
          explanation: 'Proportional scaling preserves the intended ratio between all module speeds, maintaining the correct robot motion direction and rotation ratio. Capping individual modules independently would distort the motion.',
        },
      ],
    },
  ],
};
