# FieldMath — Curriculum Build Checklist

A complete checklist of everything to build for the FRC robotics math learning site. Each lesson follows the standard format: **application hook → governing math/physics → specific calculations → worked example → common mistakes → interactive simulation (where applicable)**.

---

## Module 0 — Foundations: Generic Math for Robotics
- [ ] Algebra & solving equations (gear ratios, unit conversions)
- [ ] Trigonometry (linkage geometry, vision targeting, arm angles)
- [ ] 2D vectors (force resolution, robot velocity)
- [ ] Coordinate systems & basic geometry (field coordinates, robot pose)
- [ ] Intro linear algebra (matrices, transformations — why robots use them)
- [ ] Intro calculus concepts (rates of change = velocity/acceleration; area under a curve = distance/impulse)
- [ ] Statistics basics (scouting data, sensor noise)
- [ ] Module 0 formula quick-reference / cheat sheet

## Module 1 — Physics for Robotics
- [ ] Kinematics equations (v² = 2aΔx, projectile motion)
- [ ] Forces, Newton's laws, free-body diagrams (FBDs)
- [ ] Statics & torque (τ = rF), levers, mechanical advantage
- [ ] Work, energy, power (P = Fv = τω) — emphasize power as the key FRC tradeoff
- [ ] Rotational kinetic energy & moment of inertia (flywheels, shooters)
- [ ] Electromagnetism & electrical basics:
  - [ ] Voltage, current, resistance (Ohm's law)
  - [ ] DC motor physics (torque-speed curves, stall vs. free speed)
  - [ ] Back-EMF
  - [ ] Motor controllers
  - [ ] Battery behavior under load (voltage sag, brownout)
  - [ ] Basic circuit analysis
- [ ] Module 1 formula quick-reference / cheat sheet

## Module 2+ — Mechanisms & Their Specific Math
*Each mechanism section: what it does → governing physics → specific calculations → worked example → common mistakes → interactive simulation.*

- [x] **Drivetrains** (gear ratios, top speed vs. acceleration, traction limits, odometry math, swerve kinematics)
- [x] **Arms & pivots** (torque from gravity at angle, gear/motor sizing, FBDs, center of mass)
- [ ] **Elevators & linear motion** (carriage mass, gear ratio for speed/response, v²=2aΔx for travel)
- [ ] **Shooters / launchers** (projectile trajectory, ballistics with optional air drag & Magnus/spin, exit velocity ↔ wheel speed ↔ gear ratio, rotational KE)
- [ ] **Intakes & rollers** (surface speed, compression, torque)
- [ ] **Pneumatics** (cylinder bore sizing, force = pressure × area, air consumption per cycle, tank/volume estimation)
- [ ] **Linkages** (4-bar geometry, trig for motion paths, pivot placement)
- [ ] Per-mechanism formula quick-reference / cheat sheets

## Module N — Controls & Programming Math
- [ ] PID control (intuition + tuning math)
- [ ] Feedforward & basic state-space (link to WPILib controls concepts)
- [ ] Motion profiling / trajectory following
- [ ] Sensor math (encoders, gyros, unit conversions, basic filtering)
- [ ] Module N formula quick-reference / cheat sheet

---

## Interactive Simulations
*Core feature. Each: live adjustable inputs, live equation with values substituted, a "why the math matters" failure mode, and FRC-flavored mechanism visuals.*

- [x] Gear ratio explorer (top speed vs. acceleration; too much torque = slow / too little = stalls) — **reference implementation, build first**
- [x] Arm torque vs. angle (τ = mgL·cosθ; flag when motor/gearing can't hold position)
- [ ] Projectile shooter (angle, velocity, optional spin/drag; arc hits/misses target; map to wheel RPM + gear ratio)
- [ ] Elevator response (mass + gear ratio; travel time, overshoot; tie to v² = 2aΔx)
- [x] DC motor torque-speed curve (adjust load; operating point, current draw, battery sag, brownout warning)
- [ ] PID tuning playground (adjust P, I, D; settle vs. oscillate vs. unstable)
- [ ] Free-body diagram builder (add/resolve force vectors; equilibrium vs. tipping)

## Interactive Calculators
- [x] Gear ratio calculator
- [x] Motor / torque sizing calculator
- [ ] Projectile trajectory calculator
- [ ] Pneumatic cylinder sizing calculator

---

## Per-Lesson Content Components (apply to every lesson)
- [x] Application hook (the mechanism/problem this math solves)
- [x] Math/physics explanation written originally (no copied text)
- [x] Specific calculations shown step by step
- [x] Worked example with collapsible step-by-step solution
- [x] "Common mistakes" callout
- [x] LaTeX-rendered formulas (KaTeX)
- [x] Interactive simulation embedded (where applicable)
- [x] Links out to authoritative sources with context (WPILib, JVN calculator, etc.)

---

## Platform & Infrastructure
- [ ] Site architecture + content data model proposed and approved
- [ ] React-based tech stack chosen with rationale
- [ ] Reusable lesson template
- [ ] Reusable simulation component template (props-driven, self-contained)
- [ ] Physics functions kept separate from UI and unit-tested
- [ ] Content stored as data (MDX or JSON) for easy seasonal updates
- [ ] Navigation: progressive curriculum path + quick-reference lookup
- [ ] Mobile-friendly / responsive (usable in the pit on a phone)
- [ ] Accessibility (contrast, keyboard nav, alt text, reduced-motion option)
- [ ] KaTeX math rendering integrated

## Content Sourcing Compliance (verify before publishing)
- [ ] All explanatory content written originally
- [ ] Team/match/event data pulled only from sanctioned APIs (Blue Alliance, FIRST)
- [ ] External sources linked, not copied; quotes minimal and attributed
- [ ] Licenses checked for any reused open-source docs (e.g., WPILib)
- [ ] No scraping/republishing of Chief Delphi or other forum content
- [ ] robots.txt and Terms of Service respected for any automated fetching
- [ ] Approved data-source list documented (source, usage, license/attribution)

---

## Deliverables (build-order milestones)
- [ ] 1. Architecture, content data model, and simulation component pattern
- [ ] 2. Page/route structure and navigation design
- [ ] 3. Module 0 fully built as reference implementation (tone, depth, format) with LaTeX formulas, ≥1 working simulation (gear ratio explorer), and ≥1 calculator
- [ ] 4. Reusable lesson template + reusable simulation component template
- [ ] 5. Documented approved external data sources list
