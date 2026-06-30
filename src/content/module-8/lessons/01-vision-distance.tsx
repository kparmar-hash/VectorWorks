import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson01: Lesson = {
  id: 'vision-distance',
  title: 'Vision-Based Distance & Pose',
  subtitle: 'Camera geometry, tx/ty to robot pose, and AprilTag homography basics.',
  order: 1,
  estimatedMinutes: 30,
  tags: ['vision', 'limelight', 'apriltag', 'camera', 'distance', 'pose-estimation'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Every competitive FRC team uses a camera to automate targeting. Limelight,
            PhotonVision, and raw OpenCV all answer the same question: where is the target
            relative to the camera, and therefore relative to the robot? The math is pure
            geometry — right triangles and coordinate transforms.
          </p>
          <p>
            Understanding the geometry means you can tune your camera mount angle analytically
            before the robot exists, debug a missed-shot sequence from first principles, and
            implement fallback calculations when the pipeline fails. None of this requires a
            computer science background — it's the same trig you used in physics class.
          </p>
        </div>
      ),
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'Limelight makes vision easy — understanding the math makes it reliable',
      content: (
        <p>
          Limelight and PhotonVision output <strong>tx</strong> (horizontal angle to target),{' '}
          <strong>ty</strong> (vertical angle to target), and with AprilTags, a full 3D pose
          estimate. Knowing the geometry behind these numbers lets you choose the right mount
          height and angle, compensate for mounting errors, and validate pipeline output before
          trusting it to drive your shooter.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Camera geometry — the basic triangle
          </h3>
          <p>
            Mount the camera at a known height <M tex="h_{camera}" /> above the floor, tilted
            upward at mount angle <M tex="\theta_{mount}" /> above horizontal. The target (speaker
            opening, AprilTag center) is at known height <M tex="h_{target}" />. The Limelight
            reports <M tex="t_y" /> — the vertical angle from the camera's optical axis to the
            target, positive when the target is above center.
          </p>
          <p>
            These three numbers form a right triangle in the vertical plane. The total elevation
            angle from true horizontal to the camera-to-target line of sight is{' '}
            <M tex="\theta_{mount} + t_y" />. The vertical leg of the triangle is{' '}
            <M tex="h_{target} - h_{camera}" /> and the horizontal leg is the ground distance{' '}
            <M tex="d" /> you want.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Horizontal Distance from Camera Pitch Angle',
      latex: String.raw`d = \frac{h_{target} - h_{camera}}{\tan(\theta_{mount} + t_y)}`,
      variables: [
        { symbol: 'd',              meaning: 'Horizontal ground distance, camera to target', unit: 'm' },
        { symbol: 'h_{target}',     meaning: 'Target height above floor',                    unit: 'm' },
        { symbol: 'h_{camera}',     meaning: 'Camera lens height above floor',               unit: 'm' },
        { symbol: '\\theta_{mount}', meaning: 'Camera mount angle above horizontal',          unit: 'rad' },
        { symbol: 't_y',            meaning: 'Limelight ty — vertical offset to target',     unit: 'rad (convert from degrees!)' },
      ],
      explanation:
        'This gives horizontal ground distance from the camera to the target. Add the camera\'s forward offset from the robot bumper to get shooter distance. Maximising (θ_mount + ty) improves distance sensitivity — a 1° change in ty causes a larger Δd when the total angle is small (nearly horizontal).',
    },

    {
      type: 'callout',
      variant: 'warning',
      title: 'ty from Limelight is in degrees — convert before using tan()',
      content: (
        <p>
          Limelight and PhotonVision report tx/ty in degrees. Passing degrees directly to
          JavaScript's <code>Math.tan()</code> (which expects radians) produces completely wrong
          distances. Always convert:{' '}
          <code>const tyRad = tyDeg * (Math.PI / 180)</code>. This is one of the most common
          vision bugs in FRC code.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Horizontal angle to target (tx) — lateral offset and auto-aim
          </h3>
          <p>
            <M tex="t_x" /> is the horizontal angle from the camera centerline to the target.
            When <M tex="t_x = 0°" /> the target is perfectly centered in the frame. Positive tx
            means the target is to the camera's right; negative means left.
          </p>
          <p>
            Auto-aim works by running a heading P controller on tx: rotate the robot until tx
            approaches zero. The lateral offset of the target from the camera line of sight at
            distance <M tex="d" /> is <M tex="d \times \tan(t_x)" />.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Lateral Offset from tx',
      latex: String.raw`x_{offset} = d \times \tan(t_x)`,
      variables: [
        { symbol: 'x_{offset}', meaning: 'Lateral distance from camera line-of-sight to target', unit: 'm' },
        { symbol: 'd',          meaning: 'Horizontal distance to target (from ty formula)',       unit: 'm' },
        { symbol: 't_x',        meaning: 'Limelight tx — horizontal offset to target',            unit: 'rad' },
      ],
      explanation:
        'Combined with d, this gives the full (x, y) camera-relative position of the target. The auto-aim correction is simply heading_error = −tx × Kp: rotate until tx → 0.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            AprilTag pose estimation — from 2D pixels to 3D field position
          </h3>
          <p>
            AprilTags are fiducial markers with known physical size (typically 6-inch or 8-inch
            squares) and known positions on the field. A single visible AprilTag provides a full{' '}
            <strong>6-DOF pose estimate</strong> — the camera's position and orientation in 3D
            space relative to the tag.
          </p>
          <p>
            The algorithm is called <strong>Perspective-n-Point (PnP)</strong>: given the four
            corner pixels in the image and the four known corner positions in 3D space, solve for
            the unique camera pose that projects the 3D corners onto those exact pixels. This is
            what Limelight's MegaTag and PhotonVision run under the hood.
          </p>
          <p>
            Once you have the camera-to-tag transform, you invert it to get tag-to-camera, then
            subtract the known camera-to-robot offset (from a CAD measurement) to get the robot's
            position on the field.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Robot Field Position from AprilTag Pose',
      latex: String.raw`\vec{p}_{robot} = \vec{p}_{tag} - R_{robot}\,\vec{t}_{cam\to tag}`,
      variables: [
        { symbol: '\\vec{p}_{robot}',      meaning: 'Robot position on field',                         unit: 'm (x, y)' },
        { symbol: '\\vec{p}_{tag}',        meaning: 'AprilTag position on field (from game manual)',    unit: 'm' },
        { symbol: 'R_{robot}',             meaning: 'Rotation matrix from robot heading (gyro)',        unit: '—' },
        { symbol: '\\vec{t}_{cam\\to tag}', meaning: 'Camera-to-tag translation vector from PnP solve', unit: 'm' },
      ],
      explanation:
        'WPILib\'s PhotonPoseEstimator runs this chain automatically. Understanding it helps you set the correct camera-to-robot Transform3d in your code and debug when pose jumps unexpectedly.',
    },

    {
      type: 'callout',
      variant: 'tip',
      title: 'Multi-tag is much more reliable than single-tag',
      content: (
        <p>
          A single AprilTag pose estimate has ±3–5 cm error at 3 m. Using multiple visible tags
          simultaneously (Limelight MegaTag2 or PhotonVision multi-tag mode) reduces that to
          ±1–2 cm because the PnP solve is <em>over-constrained</em> — more point correspondences
          than the minimum needed means measurement noise averages out. Always enable multi-tag
          whenever two or more tags are in frame.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Auto-aim pipeline — the full chain
          </h3>
          <p>
            A production auto-aim system combines all of the above:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Camera captures frame; pipeline outputs tx, ty, and optionally pose.</li>
            <li>
              Distance: <M tex="d = (h_{target} - h_{camera}) / \tan(\theta_{mount} + t_y)" />
            </li>
            <li>
              Heading correction: error = <M tex="-t_x" /> (rotate until tx → 0).
            </li>
            <li>
              Shooter RPM = interpolation table or physics formula at distance <M tex="d" />.
            </li>
            <li>
              Ready-to-shoot gate: |heading error| &lt; threshold <strong>AND</strong> flywheel
              within ±tolerance of setpoint <strong>AND</strong> robot lateral acceleration ≈ 0.
            </li>
          </ol>
          <p>
            All five conditions must be true simultaneously before the indexer fires.
          </p>
        </div>
      ),
    },

    {
      type: 'worked-example',
      title: 'Distance calculation for a speaker shot',
      problem: (
        <div className="space-y-1 text-sm">
          <p>
            Limelight mounted at <strong>h_camera = 0.65 m</strong>, tilted up{' '}
            <strong>θ_mount = 25°</strong>. Speaker target center at{' '}
            <strong>h_target = 2.05 m</strong>. Pipeline reports{' '}
            <strong>ty = 12.3°</strong>. Find horizontal distance to the target.
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Convert angles to radians',
          latex: String.raw`\theta_{mount} = 25° \times \frac{\pi}{180} = 0.4363\text{ rad} \qquad t_y = 12.3° \times \frac{\pi}{180} = 0.2147\text{ rad}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Always the first step. Using degrees in Math.tan() gives a wildly wrong result.
            </p>
          ),
        },
        {
          label: 'Total elevation angle',
          latex: String.raw`\theta_{total} = \theta_{mount} + t_y = 0.4363 + 0.2147 = 0.6510\text{ rad}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This is the angle from true horizontal to the line from the camera to the target.
            </p>
          ),
        },
        {
          label: 'Compute tan of total angle',
          latex: String.raw`\tan(0.6510) = 0.7673`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              At this combined angle, 1 m of horizontal distance corresponds to 0.767 m of
              vertical height difference.
            </p>
          ),
        },
        {
          label: 'Divide vertical separation by tan',
          latex: String.raw`d = \frac{h_{target} - h_{camera}}{\tan(\theta_{total})} = \frac{2.05 - 0.65}{0.7673} = \frac{1.40}{0.7673} \approx 1.825\text{ m}`,
          explanation: (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The camera sees the target 1.83 m away horizontally. Add the camera's forward
              offset from the bumper (e.g., 0.15 m rearward) to get shooter-to-target distance.
            </p>
          ),
        },
      ],
      answer: (
        <p className="text-sm">
          Horizontal distance camera-to-target: <strong>1.83 m</strong>. If the camera is 0.15 m
          behind the shooter, shooter distance ≈ <strong>1.98 m</strong>. Use this distance
          to look up the required flywheel RPM from your interpolation table.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        {
          label: 'Distance (ty method)',
          latex: String.raw`d = (h_{target} - h_{camera})/\tan(\theta_{mount} + t_y)`,
          note: 'All angles in radians',
        },
        {
          label: 'Degrees → radians',
          latex: String.raw`\theta_{rad} = \theta_{deg} \times \pi/180`,
          note: 'Do this first — always',
        },
        {
          label: 'Lateral offset',
          latex: String.raw`x_{offset} = d \times \tan(t_x)`,
          note: 'tx in radians',
        },
        {
          label: 'Auto-aim heading error',
          latex: String.raw`\Delta\theta = -t_x`,
          note: 'Rotate until tx → 0',
        },
        {
          label: 'Robot pose from tag',
          latex: String.raw`\vec{p}_{robot} = \vec{p}_{tag} - R\,\vec{t}_{cam}`,
          note: 'PhotonPoseEstimator handles this',
        },
      ],
    },

    {
      type: 'quiz',
      questions: [
        {
          question: 'A Limelight reports ty = 0°. The camera is mounted at 20° above horizontal. What is the total elevation angle to the target?',
          options: [
            '0° — ty = 0 means the target is at floor level',
            '20° — the total angle equals only the mount angle when ty = 0',
            '40° — ty doubles the mount angle',
            '90° — the target is directly above the camera',
          ],
          correctIndex: 1,
          explanation:
            'ty = 0° means the target lies exactly on the camera optical axis. The camera is tilted 20° upward, so the line from camera to target makes a 20° + 0° = 20° angle with true horizontal. Distance = Δh / tan(20°).',
        },
        {
          question: 'A programmer passes ty = 15 (degrees) directly to Math.tan() in JavaScript without conversion. What happens to the computed distance?',
          options: [
            'The distance is computed correctly because degrees and radians give the same tan value for small angles',
            'The distance is wildly wrong — Math.tan(15) ≈ −0.855 (treating 15 as radians), not tan(15°) ≈ 0.268',
            'JavaScript automatically converts degrees to radians',
            'The distance is slightly off by a factor of π',
          ],
          correctIndex: 1,
          explanation:
            'Math.tan() expects radians. tan(15 radians) ≈ −0.855, while tan(15°) = tan(0.2618 rad) ≈ 0.268. The resulting distance would be off by a factor of ~3 and have the wrong sign — a very common, hard-to-spot bug.',
        },
        {
          question: 'tx = +8°. The robot runs a heading P controller on tx. In which direction must the robot rotate to center the target?',
          options: [
            'Counterclockwise (−yaw) — the target is to the left',
            'Clockwise (+yaw) — the target is to the right and the robot must turn right to center it',
            'No rotation — tx > 0 means the target is already centered',
            'Translate right, not rotate',
          ],
          correctIndex: 1,
          explanation:
            'tx = +8° means the target appears 8° to the right of the camera centerline. To bring it to center, the robot rotates clockwise (positive yaw when viewed from above). The heading correction is Δθ = +tx × Kp.',
        },
        {
          question: 'Why does using two visible AprilTags simultaneously produce a more accurate robot pose estimate than a single tag?',
          options: [
            'Two tags provide a faster pipeline frame rate',
            'The PnP solve becomes over-constrained — more point correspondences than the minimum needed, so noise averages out and accuracy improves to ±1–2 cm',
            'Two tags eliminate the need for a gyroscope entirely',
            'Two tags allow pose estimation without knowing camera mount height',
          ],
          correctIndex: 1,
          explanation:
            'Single-tag PnP uses exactly 4 corner points — the minimum to solve for 6 DOF. Multi-tag provides 8+ corners, making the system over-constrained. The least-squares solution averages measurement noise across all points, reducing position error from ±3–5 cm to ±1–2 cm at typical game distances.',
        },
      ],
    },
  ],
};
