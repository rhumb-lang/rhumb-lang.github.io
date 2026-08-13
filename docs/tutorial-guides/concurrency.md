---
sidebar_position: 5
---

# Concurrency

Rhumb replaces the traditional Call Stack with a **Hierarchical Tuplespace** based on the _Syndicated Actor Model (SAM)_. This system unifies Concurrency, Event Handling, and State Management into a single spatial metaphor.

## The Conceptual Model

- **The Ether:** Every executing process (Green Thread) possesses a **Local Realm**.
- **Hierarchy:** Realms are arranged in a tree. Every Realm has a reference to its **Parent Realm** (who spawned it).
- **Zombie Contexts:** When a process yields or pauses (e.g., waiting for a signal), its Context object is not destroyed. It remains in memory as a "Zombie," allowing deeper Contexts (Children) to "Drill Down" and reply to it later.

## Operator Taxonomy

The syntax distinguishes between ephemeral events and persistent state to prevent race conditions.

| Feature          | Symbol  | Type  | Direction        | Semantics                                                                                                       |
| :--------------- | :------ | :---- | :--------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Signal**       | **`#`** | Event | **Up** (Bubble)  | **Request.** Pauses execution. Bubbles up. Resumes with result of `^Reply` (or `___` if unhandled).             |
| **Reply**        | **`^`** | Event | **Down** (Drill) | **Response.** Targets a paused Zombie Context. Injects a payload and resumes that Context.                      |
| **Proclamation** | **`$`** | State | **Static** (Pin) | **Persistent.** Sticks to the Local Realm. To **Retract** (delete), assert the Empty Value: `realm$state(___)`. |

## Realm Syntax & Lifecycle

Realms can be instantiated as a **Child** or **Detached** Realm.

- **Child Realm `<$>`**: Creates a standard Realm.
  - _Behavior:_ Signals uncaught in this realm bubble up to the creator's current realm.
  - _Use Case:_ Workers, sub-components.
- **Detached Realm `<|>`**: Creates a Sandboxed Realm.
  - _Behavior:_ `Parent` is set to `World` (Root). Signals hitting the ceiling are discarded/logged.
  - _Use Case:_ Top-level servers, sandboxed plugins.
- **Opcode:**
  - `OUTER _<$>_` (Parent = CurrentSpace)
  - `OUTER _<|>_` (Parent = World)

## Signal Propagation (The "Helium Balloon" Algorithm)

To prevent memory leaks in long-running servers, Signals (`#`) are active agents of transport.

1.  **Post & Pause:** Instruction `POST` suspends the `CurrentContext` (marking it Zombie).
2.  **Bubble:** The signal bubbles up looking for a listener.
3.  **Outcome A (Replied):** A listener traps it and executes `INJECT ^val`. The Zombie resumes with `val` on the stack.
4.  **Outcome B (Unhandled):** The signal hits `World`. The Zombie resumes with `___` on the stack.
5.  **Garbage Collection:** If the Signal reaches `World` (Root) and is still uncaught, it is **discarded**. This ensures that "fire-and-forget" events do not accumulate in memory.

## The "Zombie Walk" Algorithm (Reply Injection)

Replies (`^`) allow a helper process to inject data back into a paused requestor.

1.  **Trigger:** Instruction `INJECT ^ack` is executed in a shallow Context (e.g., an error handler).
2.  **Scan:** The VM retrieves the **Stack Trace** of the current process.
3.  **Descend:** It iterates _forward_ (deeper) into the stack, checking each paused "Zombie Context."
4.  **Match:** It checks if the Zombie Context has a `TRAP_REPLY` table entry matching `^ack`.
5.  **Resume:** If found, the VM transfers execution control **back** to that Zombie Context's Instruction Pointer (IP), passing the data arguments.

## Reactive Realms & Subscriptions

Realms are event subscription and state containers that can be assigned to variables.

- **Realms as Maps:** A Realm is fundamentally a **Map**.
  - It has a **Legend** and supports the standard **Prototype Model**.
  - You can access fields (`realm\config`), delegate to subfields (`realm@parent`), and attach methods directly to the Realm object.
  - _Distinction:_ While it acts as a Map for storage/lookup, it _also_ is treated specially by the VM for the purposes of concurrency operations (`#`, `$`, `<>`).
- **Child Realm `<$>`**: Creates a standard Realm. Signals uncaught in this realm bubble up to the creator's current realm.
- **Detached Realm `<|>`**: Creates a Sandboxed Realm. `Parent` is set to `World` (Root). Signals hitting the ceiling are discarded/logged.
- **Opcode:** `NEW_REALM <flags>` (Flag 0: Child, Flag 1: Detached)

The syntax `realm <> [ pattern ] -> { body }` acts as a generic lifecycle manager.

- **Initialization:** The `OUTER _<>->_` operation registers a handler for the target Realm.
- **Arrival (Spawn):** When a Tuple (Signal/Proclamation) matches `pattern`, a
  new Green Thread is spawned.
  - **Implicit Pinning:** Variables defined in `pattern` (e.g., `who`) act
    as **Filters**. The thread only wakes for tuples matching that specific
    value.
- **Departure (Teardown):** When a Proclamation is updated to **`___`
  (Empty)**, it is considered **Retracted**. The VM removes the tuple from
  storage and injects a special `$empty` signal into any active subscriber
  threads to trigger their cleanup handlers.

## Vassals (Facets & Attenuation)

Vassals (`<{}>`) are **Bi-Directional Proxies** used to secure a Realm or a
Library. They enforce the _Principle of Least Privilege_ by acting as a membrane
between a Subject and the World.

**Syntax:**

```rhumb
ReadOnly .= <{
    #allow .. #allow         % Pass-through (Consume)
    .#allow                  % if no changes, use prefix
    #peek :: #peek           % Pass-through (Non-destructive)
    :#peek                   % if no changes, use prefix
    #secret .. empty         % Block (Drop)
    #shout(x) .. #whisper(x) % Transform
}>
```

**Semantics:**

- **Take (`..`):** The Vassal **consumes** the event. It stops bubbling in the Raw Realm. (Use for Admin/Overrides).
- **Peek (`::`):** The Vassal **copies** the event to the user but lets it continue bubbling in the Raw Realm. (Use for Logging/Monitoring).

For Proclamations (`$`), `..` (Take) hides the value from subsequent rules in the Vassal but **does not** remove it from the underlying Realm. To delete a Proclamation from the underlying Realm, the Vassal must explicitly emit an
`$empty` signal to the Target.

**Implementation:** A `Vassal` object is a specialized `Realm` object that delegates storage to a `Target`.

### Capabilities as Ranges

When securing a library, capabilities are defined as **IO Ranges** using the pipe operator `|`.

- **Operator:** `|` (Range) creates a generic `Range` object holding `{Start: Value, End: Value}`.
- **Vassal Interpretation:** When a Vassal encounters a Range in a pattern match, it interprets it as `Ingress | Egress`.

| Side      | Term        | Direction           | Meaning                                                                 |
| :-------- | :---------- | :------------------ | :---------------------------------------------------------------------- |
| **Left**  | **Ingress** | `Inside <- Outside` | Data flowing _into_ the library. (Read File, Listen Port, Get Env).     |
| **Right** | **Egress**  | `Inside -> Outside` | Data flowing _out_ of the library. (Write File, Connect Port, Set Env). |

#### Common Policy Patterns

1.  **Read-Only:** Block Egress with `___`.
    ```rhumb
    #💾( "data/*.txt" | ___ )
    ```
2.  **Write-Only:** Block Ingress with `___`.
    ```rhumb
    #💾( ___ | "/var/logs/app.log" )
    ```
3.  **Full Access:** Allow matching patterns on both sides.
    ```rhumb
    #📡( 8080 | "api.stripe.com" )
    ```
4.  **Reusable Policies:** Since Ranges are first-class Values, they can be defined once and applied to many libraries.
    ```rhumb
    web_safe := ___ | ["google.com"; "stripe.com"]
    lib_a := {git|...|-} || <{ #📡(web_safe) }>
    lib_b := {git|...|-} || <{ #📡(web_safe) }>
    ```

## Implementation Strategy

### The Realm Object

A Realm is fundamentally just a `MASK_MAP`. It has a specific Legend that defines internal VM-recognized fields:

Fields:

- **Parent**: Pointer to Parent Realm (or World)
- **Proclamations**: Pointer to a Map of Proclamations (`$`)
- **Subscriptions**: Pointer to an Array of Subscriptions (`<>`)

### The Tuple Object

A tuple is a first-class concurrency primitive in Rhumb (used for signals, replies, and proclamations).

Fields:

- **Realm**: Pointer to the Realm/Map this tuple is attached to
- **Topic**: The topic of this tuple
- **Arguments**: The arguments of this tuple

## Distributed Rhumb (Network Transparency)

Rhumb treats the network as just another Realm boundary. Concurrency primitives
(`#`, `$`, `->`) work identically across local and remote Routes.

### Networked Realms

A Realm can be bound to a Transport Layer (TCP/WebSockets).

**Syntax**: Configuration via Proclamation.

```rhumb
node := <$>;
node$connect("tcp://192.168.1.5:8080");
```

**Behavior**:

- **Signal (`node#msg`):** Serializes `msg` and sends it over the socket.
- **Proclamation (`node$state`):** Syncs state to the remote node (CRDT-like consistency).
- **Subscription (`node <> ...`):** deserializes incoming packets into local Tuples.

### The Freezer (Serialization Engine)

The VM employs a unified serialization engine called **The Freezer** to flatten
the object graph into a binary format. It operates in two modes:

1.  **Migration Mode (Network):**
    - **Scope:** Serializes a specific Closure or Process.
    - **Sanitization:** **Strict.** If the graph contains non-transferable local
      resources (File Handles, Window Pointers), the freeze **fails** with an
      error. This prevents "It works on my machine" bugs in distributed code.
2.  **Snapshot Mode (Disk):**
    - **Scope:** Serializes the entire VM Heap and Tuplespace.
    - **Sanitization:** **Permissive.** Local resources are serialized as
      **Rehydration Instructions** (e.g., "Open file X at offset Y"). On reload,
      the VM attempts to restore them; if impossible (file missing), the handle
      becomes `___` or an error.

### The Dependency Check

Before accepting a migrated process, the Remote Node validates the **Resolver
Headers**.

- **Check:** "Do I have `{!|math|1.2.0}`?"
- **Result:**
  - **Yes:** Accept and run.
  - **No:** Reject (or optionally request the missing library blob).

## Syntactic Symmetries

The Concurrency primitives exhibit powerful symmetries that allow developers to
choose between **Inline Logic** (Subscriptions) and **Reusable Logic**
(Vassals).

### The Monitor Symmetry (`<>` vs `{}`)

Listening to a Realm via an empty subscription is identical to attaching a
Selector directly to the Realm (Attachment Mode).

- **Syntax A:** `realm <> [] -> { ... }`
  - _Meaning:_ "Subscribe to `realm`. Filter nothing (`[]`). Execute block for every event."
- **Syntax B:** `realm { ... }`
  - _Meaning:_ "Attach monitor to `realm`. Trap all signals bubbling up."
- **Equivalence:** `realm <> []` is equivalent to `realm` (as a Monitor Source).

### The Filter Symmetry (Vassals vs Patterns)

Applying a Vassal to a Realm is identical to Subscribing with a Pattern. Both
act as filters on the event stream.

- **Scenario:** We want to listen only for `#sig`.
- **Approach A (Inline Pattern):**

  ```rhumb
  realm <> [#sig] -> { ... }
  ```

  - _Mechanism:_ The **Pattern** inside the subscription performs the filtering.

- **Approach B (Applied Vassal):**

  ```rhumb
  v .= <{ .#sig }>   % Define Vassal (Allow #sig)
  v(realm) { ... }   % Apply Vassal -> Attach Monitor
  ```

  - _Mechanism:_ The **Vassal** performs the filtering before the Monitor sees it.

- **Conclusion:** **Submaps are ephemeral Vassals.** When you write `[#sig]`,
  you are defining a temporary attenuation strategy for that specific
  subscription.
