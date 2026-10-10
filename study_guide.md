# Analog & Digital Electronics (ADE): Comprehensive Compendium & Study Guide

## Vol. I — Complete 380-Proposition Reference Manual

---

## ⚡ Core Formula & Analytical Reference by Topic

### 1. Half & Full Adders (Chap. I & II)
- **Half Adder (HA):**
  - Inputs: $A, B$
  - Sum: $S = A \oplus B = \Sigma m(1, 2)$
  - Carry: $C = AB = \Sigma m(3)$
  - Gate counts: Minimum 5 NAND gates, 5 NOR gates.
- **Full Adder (FA):**
  - Inputs: $A, B, C_{in}$
  - Sum: $S = A \oplus B \oplus C_{in} = \Sigma m(1, 2, 4, 7)$ (Odd-parity function)
  - Carry-out: $C_{out} = AB + BC_{in} + AC_{in} = AB + (A \oplus B)C_{in} = \Sigma m(3, 5, 6, 7)$ (Majority function)
  - Construction: 2 Half Adders + 1 OR gate.
  - Universal gates: 9 NAND gates (3 $\times$ 7400 ICs), 9 NOR gates.

---

### 2. Half & Full Subtractors (Chap. III & IV)
- **Half Subtractor (HS):**
  - Inputs: Minuend $A$, Subtrahend $B$
  - Difference: $D = A \oplus B = \Sigma m(1, 2)$ (Identical equation to HA Sum)
  - Borrow: $B_{out} = A'B = \Sigma m(1)$
  - Gate counts: 5 NAND gates, 5 NOR gates.
- **Full Subtractor (FS):**
  - Inputs: Minuend $A$, Subtrahend $B$, Borrow-in $B_{in}$
  - Difference: $D = A \oplus B \oplus B_{in} = \Sigma m(1, 2, 4, 7)$
  - Borrow-out: $B_{out} = A'B + B B_{in} + A' B_{in} = A'B + (A \oplus B)' B_{in} = \Sigma m(1, 2, 3, 7)$
  - Construction: 2 Half Subtractors + 1 OR gate.
  - Gate counts: 9 NAND gates, 9 NOR gates.

---

### 3. Latches & Flip-Flops (Chap. V to VIII)
- **SR Flip-Flop:**
  - Characteristic Equation: $Q_{next} = S + R'Q$ with forbidden constraint $SR = 0$.
  - NOR Latch: $S=R=0 \implies$ Hold, $S=1, R=0 \implies$ Set (1), $S=0, R=1 \implies$ Reset (0), $S=R=1 \implies$ Invalid/Indeterminate.
  - NAND Latch: Active-LOW inputs ($S'=R'=0$ is invalid).
  - Excitation: $0 \to 0: S=0, R=X$; $0 \to 1: S=1, R=0$; $1 \to 0: S=0, R=1$; $1 \to 1: S=X, R=0$.
- **JK Flip-Flop:**
  - Characteristic Equation: $Q_{next} = J Q' + K' Q$.
  - Resolves SR ambiguity: $J=K=1 \implies$ Toggle ($Q_{next} = Q'$).
  - Race-Around Condition: Occurs in level-triggered JK when $J=K=1$ and clock pulse width $t_p > t_{pd}$.
  - Remedies: Master-Slave JK architecture or edge-triggering.
  - Excitation: $0 \to 0: J=0, K=X$; $0 \to 1: J=1, K=X$; $1 \to 0: J=X, K=1$; $1 \to 1: J=X, K=0$.
- **T (Toggle) Flip-Flop:**
  - Characteristic Equation: $Q_{next} = T \oplus Q$.
  - $T=0 \implies$ Hold; $T=1 \implies$ Toggle.
  - Frequency division: A single T FF with $T=1$ divides clock frequency by 2 ($f_{out} = f_{in} / 2$, 50% duty cycle).
  - Excitation: $0 \to 0: T=0$; $0 \to 1: T=1$; $1 \to 0: T=1$; $1 \to 1: T=0$.
- **D (Data / Delay) Flip-Flop:**
  - Characteristic Equation: $Q_{next} = D$.
  - Conversion to Toggle: Connect $D = Q'$.
  - Maximum operating frequency: $f_{max} = 1 / (t_{su} + t_{pd})$.
  - Conversion to JK: $D = J Q' + K' Q$.

---

### 4. Sequential Counters (Chap. IX & X)
- **Ring Counter:**
  - $n$ flip-flops $\implies n$ distinct valid states.
  - Circulates single logic '1': e.g., $1000 \to 0100 \to 0010 \to 0001$.
  - Unused states: $2^n - n$.
  - Duty cycle: $1/n$ ($100/n\%$).
  - Self-starting feedback: $D_0 = (Q_0 + Q_1 + \dots + Q_{n-2})'$.
- **Johnson (Twisted Ring / Moebius) Counter:**
  - $n$ flip-flops $\implies 2n$ distinct valid states.
  - Inverted feedback: $D_0 = Q_{n-1}'$.
  - Frequency division: $f_{out} = f_{in} / (2n)$, 50% duty cycle.
  - Unused states: $2^n - 2n$. Decoding requires only a 2-input AND gate per state.
- **Asynchronous (Ripple) Counters:**
  - Clock cascades sequentially through flip-flop outputs $\implies$ propagation delays accumulate linearly: $t_{total} = n \cdot t_{pd}$.
  - Maximum frequency: $f_{max} \le 1 / (n \cdot t_{pd})$.
  - MOD number: $N = 2^n$ (or truncated with feedback reset gate).
  - Up/Down configurations:
    - -ve edge triggered, Clock from $Q \implies$ UP counter.
    - -ve edge triggered, Clock from $Q' \implies$ DOWN counter.
    - +ve edge triggered, Clock from $Q \implies$ DOWN counter.
    - +ve edge triggered, Clock from $Q' \implies$ UP counter.
  - MOD-10 (Decade) reset: Detects count 10 ($1010_2$, $Q_3 Q_1$) via NAND gate to clear pins.

---

### 5. Operational Amplifiers (Chap. XI)
- **Inverting Amplifier:**
  - Closed-loop gain: $A_v = -R_f / R_1$
  - Virtual Ground: Inverting terminal held at 0V because open-loop gain $A_{ol} \to \infty$ and $V^+ = 0\text{V}$.
  - Input impedance: $Z_{in} = R_1$.
  - Phase shift: $180^\circ$.
- **Non-Inverting Amplifier:**
  - Closed-loop gain: $A_v = 1 + (R_f / R_1) \ge 1$.
  - Input impedance: Extremely high ($Z_{in} \to \infty$).
  - Phase shift: $0^\circ$ (in-phase).
  - Voltage Follower (Unity-Gain Buffer): $R_f = 0, R_1 = \infty \implies A_v = 1$, maximum impedance isolation.
- **Op-Amp Parameters:**
  - Bias compensation resistor: $R_{comp} = R_1 \parallel R_f$.
  - Slew rate limitation: $f_{max} = \frac{SR}{2 \pi V_p}$.
  - Summing amplifier: $V_{out} = -\frac{R_f}{R}(V_1 + V_2 + V_3)$.

---

### 6. 555 Timer Multivibrators (Chap. XII & XIII)
- **555 Astable Multivibrator (Free-Running Oscillator):**
  - Charging path: $R_A + R_B \implies T_{HIGH} = 0.693(R_A + R_B)C$.
  - Discharging path: $R_B \implies T_{LOW} = 0.693 R_B C$.
  - Total Period: $T = 0.693(R_A + 2R_B)C$.
  - Frequency: $f = \frac{1.44}{(R_A + 2R_B)C}$.
  - Duty Cycle: $D = \frac{R_A + R_B}{R_A + 2R_B} \times 100\% > 50\%$.
  - 50% Duty Cycle modification: Diode across $R_B$ (anode to pin 7, cathode to pins 6/2).
- **555 Monostable Multivibrator (One-Shot):**
  - Stable state: Output LOW, capacitor discharged via pin 7.
  - Triggering: Negative-going pulse on pin 2 ($< \frac{1}{3}V_{cc}$).
  - Output pulse width: $t_w = 1.1 R C = RC \ln(3)$.
  - Independence of $V_{cc}$: Comparator thresholds scale with supply, canceling $V_{cc}$.

---

### 7. Harmonic Oscillators (Chap. XIV & XV)
- **Barkhausen Criteria:**
  - Total loop phase shift: $\angle A\beta = 0^\circ$ (or $360^\circ$).
  - Loop gain magnitude: $|A\beta| \ge 1$.
- **RC Phase Shift Oscillator (Inverting Op-Amp):**
  - Inverting op-amp phase shift: $180^\circ$.
  - 3-stage RC ladder phase shift: $180^\circ$ (nominal $60^\circ$ per section).
  - Attenuation at resonance: $|\beta| = \frac{1}{29}$.
  - Required amplifier gain: $|A_v| = \frac{R_f}{R_1} \ge 29$.
  - Oscillation frequency: $f_o = \frac{1}{2 \pi R C \sqrt{6}}$.
- **Wien Bridge Oscillator (Non-Inverting Op-Amp):**
  - Lead-Lag feedback network phase shift at resonance: $0^\circ$.
  - Non-inverting op-amp phase shift: $0^\circ$.
  - Attenuation at resonance: $|\beta| = \frac{1}{3}$.
  - Required amplifier gain: $A_v = 1 + \frac{R_f}{R_1} \ge 3 \implies R_f \ge 2 R_1$.
  - Resonant frequency: $f_o = \frac{1}{2 \pi R C}$.
  - Tuning: 2-gang potentiometer (varying both resistors simultaneously).
  - Amplitude stabilization: Tungsten lamp (Hewlett HP 200A) or JFET in feedback.

---

*Compiled for the Analog & Digital Electronics (ADE) Interactive Review Portal.*
