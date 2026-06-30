import { type Lesson } from '../../../types/curriculum';
import { InlineMath as M } from '../../../components/lesson/FormulaBlock';

export const lesson06: Lesson = {
  id: 'calculus-concepts',
  title: 'Intro Calculus: Rates of Change',
  subtitle: 'Velocity is derivative of position. Distance is integral of velocity. Robots use both every loop.',
  order: 6,
  estimatedMinutes: 25,
  tags: ['calculus', 'kinematics', 'motion-profiles', 'velocity', 'acceleration'],
  sections: [
    {
      type: 'prose',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            You do not need to solve integrals by hand to build robots. But the calculus concepts
            behind differentiation and integration show up everywhere in FRC code: PID controllers
            compute a derivative (how fast is the error changing?), motion profiles integrate
            velocity to get position, and impulse is the integral of force over time. Understanding
            what these operations <em>mean</em> physically lets you debug control loops and motion
            profiles when they misbehave.
          </p>
        </div>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">The derivative: rate of change</h3>
          <p>
            The derivative of a quantity with respect to time tells you how fast that quantity is
            changing right now. Position → velocity → acceleration is the canonical chain:
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Kinematic derivatives',
      latex: String.raw`v(t) = \frac{dx}{dt} \qquad a(t) = \frac{dv}{dt} = \frac{d^2x}{dt^2}`,
      explanation:
        'In code, you approximate these with finite differences: v ≈ Δx/Δt (encoder change per loop). WPILib\'s LinearFilter can smooth these estimates.',
    },

    {
      type: 'callout',
      variant: 'frc-connection',
      title: 'The D term in PID is a derivative',
      content: (
        <p>
          PID's "D" term computes <M tex="K_D \cdot \frac{de}{dt}" /> — how fast the error is
          changing. If error is shrinking fast (good), D damps the response. If error is growing
          fast (bad), D adds a corrective kick. That's exactly the derivative concept applied to
          control.
        </p>
      ),
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">The integral: area under the curve</h3>
          <p>
            Integration accumulates. The integral of velocity over time gives distance traveled.
            The integral of force over time gives impulse (change in momentum). On robot code,
            integration appears as a running sum updated every loop.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Distance from velocity',
      latex: String.raw`\Delta x = \int_{t_0}^{t_1} v(t)\, dt \approx \sum_{i} v_i \cdot \Delta t`,
      explanation: 'The Riemann sum approximation on the right is what an odometry loop does: multiply velocity by loop time (typically 20 ms) and add to position every cycle.',
    },

    {
      type: 'prose',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <h3 className="text-lg font-semibold text-slate-900">Motion profiles as piecewise integrals</h3>
          <p>
            A trapezoidal motion profile has three phases: constant acceleration, constant velocity,
            constant deceleration. The total distance is the area of the trapezoid formed by the
            velocity curve.
          </p>
        </div>
      ),
    },

    {
      type: 'formula',
      label: 'Trapezoidal profile total distance',
      latex: String.raw`d_{total} = \underbrace{\frac{1}{2}v_{max}t_{accel}}_{\text{ramp up}} + \underbrace{v_{max}t_{cruise}}_{\text{cruise}} + \underbrace{\frac{1}{2}v_{max}t_{decel}}_{\text{ramp down}}`,
      explanation: 'Each term is a geometric area: triangle (ramp) or rectangle (cruise). WPILib\'s TrapezoidProfile handles this automatically once you supply max velocity and acceleration.',
    },

    {
      type: 'worked-example',
      title: 'Distance traveled from a velocity profile',
      problem: (
        <div className="text-sm space-y-1">
          <p>
            An elevator accelerates at <strong>4 m/s²</strong> for{' '}
            <strong>0.5 s</strong>, then cruises at <strong>2 m/s</strong> for{' '}
            <strong>1.2 s</strong>, then decelerates at <strong>4 m/s²</strong> back to zero. How
            far did it travel?
          </p>
        </div>
      ),
      steps: [
        {
          label: 'Acceleration phase distance',
          latex: String.raw`d_{accel} = \frac{1}{2} \times 4 \times (0.5)^2 = \frac{1}{2} \times 4 \times 0.25 = 0.5 \text{ m}`,
          explanation: <p className="text-sm text-slate-600">Using <M tex="d = \frac{1}{2}at^2" /> from kinematics (same as integrating from 0 to t).</p>,
        },
        {
          label: 'Cruise phase distance',
          latex: String.raw`d_{cruise} = v_{max} \times t_{cruise} = 2.0 \times 1.2 = 2.4 \text{ m}`,
          explanation: <p className="text-sm text-slate-600">Constant velocity — the integral is just multiplication.</p>,
        },
        {
          label: 'Deceleration time and distance',
          latex: String.raw`t_{decel} = \frac{v_{max}}{a} = \frac{2.0}{4.0} = 0.5 \text{ s} \qquad d_{decel} = \frac{1}{2} \times 4 \times (0.5)^2 = 0.5 \text{ m}`,
          explanation: <p className="text-sm text-slate-600">Symmetric with the acceleration phase.</p>,
        },
        {
          label: 'Total distance',
          latex: String.raw`d_{total} = 0.5 + 2.4 + 0.5 = 3.4 \text{ m}`,
          explanation: <p className="text-sm text-slate-600">Sum of all three phases.</p>,
        },
      ],
      answer: (
        <p className="text-sm">
          The elevator travels <strong>3.4 m</strong> total. Total time: 0.5 + 1.2 + 0.5 ={' '}
          <strong>2.2 s</strong>.
        </p>
      ),
    },

    {
      type: 'cheatsheet',
      entries: [
        { label: 'Velocity',            latex: String.raw`v = \frac{dx}{dt} \approx \frac{\Delta x}{\Delta t}` },
        { label: 'Acceleration',        latex: String.raw`a = \frac{dv}{dt} \approx \frac{\Delta v}{\Delta t}` },
        { label: 'v from const accel',  latex: String.raw`v = v_0 + at` },
        { label: 'x from const accel',  latex: String.raw`x = x_0 + v_0 t + \tfrac{1}{2}at^2` },
        { label: 'v² kinematics',       latex: String.raw`v^2 = v_0^2 + 2a\Delta x`, note: 'Useful when time is unknown' },
        { label: 'Impulse',             latex: String.raw`J = \int F\,dt = \Delta p = m\Delta v` },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          question: 'An elevator position sensor reads 0.20 m at t = 0 s and 0.80 m at t = 0.1 s. What is the approximate velocity?',
          options: ['0.06 m/s', '6.0 m/s', '0.6 m/s', '60 m/s'],
          correctIndex: 1,
          explanation: 'v ≈ Δx / Δt = (0.80 - 0.20) / 0.10 = 0.60 / 0.10 = 6.0 m/s. This is the finite-difference approximation to the derivative — exactly what an odometry loop computes each cycle.',
        },
        {
          question: 'What does the "D" term in a PID controller compute?',
          options: [
            'The sum of all past errors',
            'The current error multiplied by a constant',
            'The rate of change of the error (derivative of error over time)',
            'The predicted future error',
          ],
          correctIndex: 2,
          explanation: 'The D term computes K_D × (de/dt) — how fast the error is currently changing. If error is shrinking fast, D damps the response to prevent overshoot.',
        },
        {
          question: 'A robot cruises at 3.0 m/s for 2.0 seconds, then decelerates to 0 over 1.5 seconds. How far does it travel in total?',
          options: ['6.0 m', '7.25 m', '8.25 m', '9.0 m'],
          correctIndex: 2,
          explanation: 'Cruise: 3.0 × 2.0 = 6.0 m. Deceleration is a triangle: (1/2) × 3.0 × 1.5 = 2.25 m. Total = 6.0 + 2.25 = 8.25 m. Distance is the area under the velocity-time curve.',
        },
        {
          question: 'In robot odometry code, why do you multiply velocity by loop time (Δt ≈ 0.02 s) every cycle?',
          options: [
            'To convert from m/s to encoder ticks',
            'Because the roboRIO can only process integers',
            'This is the Riemann sum approximation — integrating velocity over each small time step to get distance',
            'To average out sensor noise over the 20 ms window',
          ],
          correctIndex: 2,
          explanation: 'Multiplying v × Δt gives the small distance traveled in one loop, which is added to total position. Repeating this every loop is a discrete approximation of the integral ∫v dt = position.',
        },
      ],
    },
  ],
};
