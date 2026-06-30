import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson05: Lesson = {
  id: 'linear-algebra',
  title: 'Intro Linear Algebra',
  subtitle: 'Transformation matrices are how robots answer "where is that object in field coordinates?"',
  order: 5,
  estimatedMinutes: 30,
  tags: ['linear-algebra', 'matrices', 'transformations', 'vision', 'pose'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            A camera mounted on the robot sees a game piece at coordinates relative to{' '}
            <em>the camera</em>. But you need to know where it is on <em>the field</em>. Getting
            from camera frame → robot frame → field frame requires two coordinate transformations.
            The math that packages those transformations compactly is matrix multiplication.
          </p>
          <p>
            You do not need to be a linear algebra expert to use matrices in FRC. You need to
            understand what they represent: a transformation that rotates and translates a
            coordinate frame.
          </p>
        </div>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">2D rotation matrix</h3>
          <p>
            To rotate a point by angle <M tex="\theta" /> around the origin:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: '2D rotation matrix',
      latex: String.raw`R(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}`,
      explanation: 'Multiply this matrix by a column vector [x, y]ᵀ to rotate the vector by θ. Positive θ = counter-clockwise.',
    },

    {
      type: 'formula',
      label: 'Rotate a point',
      latex: String.raw`\begin{pmatrix} x' \\ y' \end{pmatrix} = R(\theta) \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} x\cos\theta - y\sin\theta \\ x\sin\theta + y\cos\theta \end{pmatrix}`,
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Homogeneous coordinates: rotation + translation together</h3>
          <p>
            Pure rotation matrices cannot represent translation. Homogeneous coordinates add a
            third row/column that packs translation in, so a single 3×3 matrix can express both
            a rotation <em>and</em> a shift — exactly what a coordinate frame transform needs.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Homogeneous transform (2D)',
      latex: String.raw`T = \begin{pmatrix} \cos\theta & -\sin\theta & t_x \\ \sin\theta & \cos\theta & t_y \\ 0 & 0 & 1 \end{pmatrix}`,
      variables: [
        { symbol: 't_x, t_y', meaning: 'Translation (where is the new origin?)', unit: 'm' },
        { symbol: '\\theta',  meaning: 'Rotation angle of the new frame',          unit: 'rad' },
      ],
      explanation: 'WPILib\'s Transform2d and Pose2d internally represent exactly this. When you call pose.transformBy(transform), it is a 3×3 matrix multiply.',
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Camera → robot → field in WPILib',
      content: (
        <div className="space-y-1 text-sm">
          <p>
            PhotonVision / Limelight gives you a <code>Transform3d</code>: "the target is at this
            position relative to the camera." WPILib lets you chain transforms:
          </p>
          <code className="block bg-slate-800 text-green-300 p-2 rounded mt-1 text-xs">
            Pose3d fieldToTarget = robotPose.transformBy(cameraToRobot.inverse()).transformBy(cameraToTarget);
          </code>
          <p className="mt-1">
            Each <code>transformBy</code> is a matrix multiply. You can write this math by hand
            for a 2D approximation using the formula above.
          </p>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'Camera-to-field coordinate transform',
      problem: (
        <div className="text-sm space-y-1">
          <p>
            Camera sees a target at <M tex="(1.5, 0.3)" /> m in camera-relative coordinates.
            The camera is mounted on a robot whose field pose is <M tex="(3.0, 2.0, 30°)" />.
            The camera is directly at the robot's center (no offset). Where is the target in field
            coordinates?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Build the robot-to-field transform matrix',
          latex: String.raw`T_{robot\to field} = \begin{pmatrix} \cos30° & -\sin30° & 3.0 \\ \sin30° & \cos30° & 2.0 \\ 0 & 0 & 1 \end{pmatrix} = \begin{pmatrix} 0.866 & -0.5 & 3.0 \\ 0.5 & 0.866 & 2.0 \\ 0 & 0 & 1 \end{pmatrix}`,
          explanation: (
            <p className="text-sm text-slate-600">The robot's (x, y, θ) fills the last column and the rotation block.</p>
          ),
        },
        {
          label: 'Apply transform to target position',
          latex: String.raw`\begin{pmatrix} x_f \\ y_f \\ 1 \end{pmatrix} = T \begin{pmatrix} 1.5 \\ 0.3 \\ 1 \end{pmatrix} = \begin{pmatrix} 0.866(1.5) - 0.5(0.3) + 3.0 \\ 0.5(1.5) + 0.866(0.3) + 2.0 \\ 1 \end{pmatrix}`,
          explanation: (
            <p className="text-sm text-slate-600">Matrix multiply row by column. The last row always stays 1.</p>
          ),
        },
        {
          label: 'Evaluate',
          latex: String.raw`x_f = 1.299 - 0.15 + 3.0 = 4.149 \text{ m} \qquad y_f = 0.75 + 0.26 + 2.0 = 3.010 \text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600">The target is at (4.15, 3.01) on the field — 1.15 m further down-field and 1.01 m to the left of the robot's starting position.</p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Target field position: <strong>(4.15 m, 3.01 m)</strong>.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: '2D rotation',    latex: String.raw`R = \begin{pmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{pmatrix}` },
        { label: 'Rotate point',   latex: String.raw`\vec{p'} = R\vec{p}` },
        { label: 'Homogeneous T',  latex: String.raw`T = \begin{pmatrix}R & \vec{t} \\ \mathbf{0} & 1\end{pmatrix}` },
        { label: 'Chain transforms', latex: String.raw`T_{A\to C} = T_{B\to C} \cdot T_{A\to B}` },
        { label: 'Inverse transform', latex: String.raw`T^{-1} = \begin{pmatrix}R^T & -R^T\vec{t} \\ \mathbf{0} & 1\end{pmatrix}`, note: 'R⁻¹ = Rᵀ for rotation matrices' },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'What is the 2D rotation matrix for a 90° counter-clockwise rotation?',
          options: [
            '[[0, -1], [1, 0]]',
            '[[1, 0], [0, 1]]',
            '[[0, 1], [-1, 0]]',
            '[[-1, 0], [0, -1]]',
          ],
          correctIndex: 0,
          explanation: 'R(90°) = [[cos90°, -sin90°], [sin90°, cos90°]] = [[0, -1], [1, 0]]. This maps (1,0) → (0,1) and (0,1) → (-1,0), which is a 90° CCW rotation.',
        },
        {
          question: 'A point at (2, 0) is rotated 30° counter-clockwise. What is its new y-coordinate?',
          options: ['0', '1.0', '1.73', '2.0'],
          correctIndex: 1,
          explanation: 'y\' = x·sin(θ) + y·cos(θ) = 2·sin(30°) + 0·cos(30°) = 2 × 0.5 = 1.0. The x-component contributes to y through sin(θ) in the rotation matrix.',
        },
        {
          question: 'Why do we use homogeneous (3×3) transform matrices instead of 2×2 rotation matrices for robot coordinate transforms?',
          options: [
            '3×3 matrices are faster to multiply on a roboRIO',
            'A 2×2 rotation matrix can only rotate around the origin — it cannot represent translation (offset) in the same matrix',
            '2×2 matrices only work for integer coordinates',
            'WPILib requires 3×3 matrices as input',
          ],
          correctIndex: 1,
          explanation: 'A pure rotation matrix rotates around the origin and cannot represent "the camera is 0.3 m in front of and 0.1 m to the left of the robot center." Homogeneous coordinates pack both rotation and translation into one matrix multiply.',
        },
        {
          question: 'You have transforms T_A→B (A frame to B frame) and T_B→C (B frame to C frame). How do you get T_A→C?',
          options: [
            'T_A→C = T_A→B + T_B→C',
            'T_A→C = T_B→C × T_A→B',
            'T_A→C = T_A→B × T_B→C',
            'T_A→C = T_A→B - T_B→C',
          ],
          correctIndex: 1,
          explanation: 'Transform chaining multiplies in the order T_B→C × T_A→B — the rightmost matrix applies first. This is the same as WPILib\'s pose.transformBy() chain: each call applies the next transform in sequence.',
        },
      ],
    },
  ],
};
