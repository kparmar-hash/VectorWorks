import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson03: Lesson = {
  id: 'vectors',
  title: '2D Vectors',
  subtitle: 'Swerve math is vector addition. Force analysis is vector resolution. Both start here.',
  order: 3,
  estimatedMinutes: 25,
  tags: ['vectors', 'swerve', 'forces', 'kinematics'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            A scalar has magnitude only — temperature, mass, gear ratio. A{' '}
            <em>vector</em> has magnitude <em>and direction</em> — velocity, force, acceleration.
            Most quantities in robotics are vectors, which means you cannot just add or subtract
            their magnitudes; direction matters.
          </p>
          <p>
            Swerve drive is the most visible example on FRC robots. Each module can face any
            direction while the chassis moves another. Calculating the correct angle and speed for
            each module requires decomposing the desired robot velocity into x and y components,
            combining with rotation, and solving per-module — pure 2D vector math.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Vector components',
      latex: String.raw`\vec{v} = \begin{pmatrix} v_x \\ v_y \end{pmatrix} = v\begin{pmatrix} \cos\theta \\ \sin\theta \end{pmatrix}`,
      variables: [
        { symbol: 'v',        meaning: 'Magnitude (speed)',        unit: 'm/s' },
        { symbol: '\\theta',  meaning: 'Direction from +x axis',   unit: 'rad' },
        { symbol: 'v_x, v_y', meaning: 'Cartesian components',     unit: 'm/s' },
      ],
    },

    {
      type: 'formula',
      label: 'Vector addition',
      latex: String.raw`\vec{a} + \vec{b} = \begin{pmatrix} a_x + b_x \\ a_y + b_y \end{pmatrix}`,
      explanation: 'Add component-by-component. This is why components are so useful — individual scalars that you can add with ordinary arithmetic.',
    },

    {
      type: 'formula',
      label: 'Magnitude and direction from components',
      latex: String.raw`|\vec{v}| = \sqrt{v_x^2 + v_y^2} \qquad \theta = \text{atan2}(v_y,\, v_x)`,
      explanation:
        'atan2 handles all four quadrants correctly. Never use atan(vy/vx) in code — it breaks when vx = 0 and returns the wrong quadrant for vx < 0.',
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Swerve kinematics in one paragraph',
      content: (
        <p>
          WPILib's <code>SwerveDriveKinematics</code> takes a{' '}
          <code>ChassisSpeeds</code> object (desired <M tex="v_x" />, <M tex="v_y" />,{' '}
          <M tex="\omega" />) and decomposes it into individual module states using the module
          positions relative to the center of the robot. Each module position is a vector, the
          rotation contributes a tangential velocity vector, and everything gets summed and
          converted to polar form (speed + angle). The math is 2D vectors from this lesson plus the
          transformation matrices from Lesson 5.
        </p>
      ),
    },

    {
      type: 'worked-example',
      title: 'Robot driving at an angle while rotating',
      problem: (
        <div className="text-sm space-y-1">
          <p>
            A swerve robot drives at <strong>3.0 m/s forward</strong> and{' '}
            <strong>1.5 m/s sideways</strong>. What is the robot's actual speed and direction?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Set up the velocity vector',
          latex: String.raw`\vec{v} = \begin{pmatrix} 3.0 \\ 1.5 \end{pmatrix} \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600">
              x is forward (toward the opposing alliance wall), y is sideways.
            </p>
          ),
        },
        {
          label: 'Find the magnitude',
          latex: String.raw`|\vec{v}| = \sqrt{3.0^2 + 1.5^2} = \sqrt{9 + 2.25} = \sqrt{11.25} \approx 3.35 \text{ m/s}`,
          explanation: (
            <p className="text-sm text-slate-600">
              This is the robot's ground speed — the speed as measured by a camera above the field.
            </p>
          ),
        },
        {
          label: 'Find the direction',
          latex: String.raw`\theta = \text{atan2}(1.5,\, 3.0) \approx 26.6°`,
          explanation: (
            <p className="text-sm text-slate-600">
              The robot moves 26.6° off the forward axis toward the sideways direction.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          The robot moves at <strong>3.35 m/s</strong> at an angle of <strong>26.6°</strong> from
          straight ahead.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Components from polar', latex: String.raw`v_x = v\cos\theta,\quad v_y = v\sin\theta` },
        { label: 'Magnitude',            latex: String.raw`|\vec{v}| = \sqrt{v_x^2 + v_y^2}` },
        { label: 'Direction',            latex: String.raw`\theta = \text{atan2}(v_y, v_x)` },
        { label: 'Vector addition',      latex: String.raw`\vec{a}+\vec{b} = (a_x+b_x,\; a_y+b_y)` },
        { label: 'Dot product',          latex: String.raw`\vec{a}\cdot\vec{b} = a_x b_x + a_y b_y`, note: 'Equals |a||b|cosθ — useful for angle between vectors' },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'A swerve robot drives at vx = 2.0 m/s and vy = 2.0 m/s. What is the robot\'s ground speed?',
          options: ['2.0 m/s', '4.0 m/s', '2.83 m/s', '8.0 m/s'],
          correctIndex: 2,
          explanation: 'Speed = sqrt(vx² + vy²) = sqrt(4 + 4) = sqrt(8) ≈ 2.83 m/s. You cannot just add 2.0 + 2.0 — vector magnitudes add using the Pythagorean theorem.',
        },
        {
          question: 'A robot has velocity vector (3, 4) m/s. What direction is it moving, measured from the +x axis?',
          options: ['36.9°', '53.1°', '45.0°', '0.75°'],
          correctIndex: 1,
          explanation: 'θ = atan2(vy, vx) = atan2(4, 3) ≈ 53.1°. Note atan2 takes (y, x) in that order. atan(4/3) ≈ 53.1°, not 36.9° (which would be atan(3/4)).',
        },
        {
          question: 'Two forces act on a robot: F1 = (5, 0) N and F2 = (0, 3) N. What is the net force vector?',
          options: ['(5, 3) N', '(8, 0) N', '(0, 8) N', '(5, -3) N'],
          correctIndex: 0,
          explanation: 'Vector addition adds components independently: (5+0, 0+3) = (5, 3) N. The net force has magnitude sqrt(25+9) = sqrt(34) ≈ 5.83 N at 31° above horizontal.',
        },
        {
          question: 'What does a dot product of zero between two vectors tell you?',
          options: [
            'One of the vectors has zero magnitude',
            'The vectors are perpendicular (90° apart)',
            'The vectors are parallel (pointing the same direction)',
            'The vectors cancel each other out',
          ],
          correctIndex: 1,
          explanation: 'Dot product = |a||b|cos(θ). When θ = 90°, cos(90°) = 0, so the dot product is zero regardless of the magnitudes. This is the standard test for perpendicularity.',
        },
      ],
    },
  ],
};
