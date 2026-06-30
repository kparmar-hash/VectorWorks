# VectorWorks

**Math and physics for building FRC robots — the stuff you actually use.**

VectorWorks is an interactive learning resource for FIRST Robotics Competition (FRC) students. It teaches the math and physics behind real robot mechanisms, from the algebra and trig you need on day one to the controls math behind a tuned autonomous routine. Every concept starts with the mechanism it helps you build, shows the real formulas, and lets you play with live simulations to see *why* the math matters.

---

## Who it's for

FRC students (grades 9–12) with any math background — from pre-calc to AP Calculus and Physics. Beginners can follow the progressive curriculum path; veterans can jump straight to the quick-reference cheat sheets and calculators.

---

## What's inside

### A progressive curriculum
- **Module 0 — Foundations:** Algebra, trigonometry, 2D vectors, coordinate systems, intro linear algebra, intro calculus, and statistics — each framed around a robotics problem.
- **Module 1 — Physics for Robotics:** Kinematics, forces and free-body diagrams, statics and torque, work/energy/power, rotational energy, and electrical/electromagnetism basics (Ohm's law, DC motor torque-speed curves, back-EMF, battery sag and brownout).
- **Modules 2+ — Mechanisms:** Dedicated sections for drivetrains, arms & pivots, elevators, shooters, intakes & rollers, pneumatics, and linkages. Each one walks from governing physics → specific calculations → worked example → common mistakes → interactive simulation.
- **Controls & Programming Math:** PID, feedforward and basic state-space, motion profiling, and sensor math.

### Interactive simulations
Manipulate inputs and watch the effect in real time — with the live equation updating alongside the motion. Each simulation includes a **"why the math matters"** mode that shows what fails when you guess instead of calculate (robots tipping, mechanisms stalling, shooters missing, motors browning out).

- Gear ratio explorer
- Arm torque vs. angle
- Projectile shooter
- Elevator response
- DC motor torque-speed curve
- PID tuning playground
- Free-body diagram builder

### Calculators
Quick, plug-in-the-numbers tools for the high-frequency calcs: gear ratio, motor/torque sizing, projectile trajectory, and pneumatic cylinder sizing.

### Quick reference
A formula cheat sheet for every module, built for grabbing fast answers in the pit.

---

## Highlights

- **Application-first.** Every lesson opens with the mechanism or problem the math solves.
- **Live math.** Formulas render cleanly (KaTeX) and update with real values as you adjust simulations.
- **Mobile-ready.** Designed to be usable on a phone at competition.
- **Accessible.** High contrast, keyboard navigation, alt text on diagrams, and a reduced-motion option.
- **Season-friendly.** Content is stored as data, so modules stay easy to update each game year.

---

## Tech stack

- **Frontend:** React
- **Math rendering:** KaTeX
- **Content:** MDX/JSON-driven lessons and simulation definitions
- **Simulations:** Self-contained, props-driven React components; physics logic kept separate from UI and unit-tested
- **Visualization:** Canvas/SVG for mechanism animation

---

## Data sources & attribution

VectorWorks uses only sanctioned, programmatic data sources and links out to authoritative references rather than copying them.

- **The Blue Alliance API** — team/match/event data
- **FIRST official APIs** — team/match/event data
- **WPILib documentation** — linked for controls concepts; any reuse stays within its license, with attribution
- **Community references** (Chief Delphi threads, the JVN Design Calculator, Ether's ballistics papers) — linked with context, never republished

All explanatory content is original. Formulas and physical facts are free to use; the wording is ours. Forum and third-party content is linked and credited, not mirrored.

---

## Contributing

Lessons and simulations follow shared templates so new content stays consistent:
- **Lesson template:** application hook → math/physics → specific calculations → worked example → common mistakes → simulation → outbound links.
- **Simulation template:** props-driven component with live inputs, a substituted live equation, a "why the math matters" failure mode, and an FRC-flavored mechanism visual.

Keep physics logic in `physics/` as pure, testable functions separate from rendering. Write all explanatory content originally and respect the data-sourcing rules above.

---

## License

MIT LICENSING. Code and original written content. Third-party data and documentation remain under their respective licenses and are used per their terms.
