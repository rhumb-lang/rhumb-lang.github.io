---
sidebar_position: 2
---

# Virtual Machine

Architecture & Implementation Guide

## The Complete NaN-Boxed Taxonomy

In Odin, the VM operates on a strict 64-bit IEEE-754 NaN-boxing architecture. Every piece of data circulating in the VM is a Value.Core Masks & PrimitivesNote: Standard IEEE-754 floats are represented by any bit pattern where the exponent bits are not fully saturated. Boxed objects exist in the NaN space.Value :: distinct u64

```odin
// --- Core Markers & Pointers ---
MASK_ADDRESS    :: 0xFF_FC_00_00_00_00_00_00 // Generic Tenured Object / GC Forwarding Pointer
MASK_SENTINEL   :: 0x7F_FE_00_00_00_00_00_00 // Stack boundary marker

// --- Inline Primitives (Passed by Value) ---
MASK_FAILURE    :: 0x7F_FC_00_00_00_00_00_00 // Base Failure Mask
  MASK_PROG_FAIL  :: 0x7F_FC_00_02_00_00_00_00
  MASK_MATH_FAIL  :: 0x7F_FC_00_04_00_00_00_00
MASK_TRUTH      :: 0x7F_FC_40_00_00_00_00_00 // Truth Value
  MASK_TRUE       :: 0x7F_FC_40_10_00_00_00_00
  MASK_FALSE      :: 0x7F_FC_40_20_00_00_00_00
MASK_EMPTY      :: 0x7F_FC_80_00_00_00_00_00 // Null/Nil
MASK_INTEGER    :: 0x7F_FC_C0_00_00_00_00_00 // 32-bit Whole Number
MASK_DATE       :: 0x7F_FC_10_00_00_00_00_00 // 45-bit Millisecond Epoch Timestamp
MASK_RUNE       :: 0x7F_FD_00_00_00_00_00_00 // Unicode Character
MASK_SYMBOL     :: 0x7F_FC_08_00_00_00_00_00 // Interned String ID

// --- The Word Flag (Contextual Modifiers) ---
// Bit 37: A single bit reused across different primitive types to alter behavior without allocating space
WORD_FLAG             :: 0x00_00_00_20_00_00_00_00
  FLAG_SUB_FIELD      :: 0x00_00_00_20_00_00_00_00 // Applied to Fields: Used in INNER traversal
  FLAG_HANDLED_BRANCH :: 0x00_00_00_20_00_00_00_00 // Applied to Booleans: Protects falsy successes in => ~> chains
  FLAG_MEGAMORPHIC    :: 0x00_00_00_20_00_00_00_00 // Applied to Symbols: Disables PIC caching for highly dynamic sites
  FLAG_ZOMBIE_PROC    :: 0x00_00_00_20_00_00_00_00 // Applied to Processes: Indicates it is paused/yielding

// --- Execution & Structural Objects (Eden Heap) ---
// WHY DISTINCT MASKS? "Zero-Dereference Type Checking".
// By encoding the object type in the pointer, the VM avoids a RAM lookup (cache miss) just to check types during dynamic dispatch.

// Literal Boxes (Places)
MASK_PLACE          :: 0x7F_FC_40_00_00_00_00_00 // Boxed Primitive / Reference Slot
  MASK_PLACE_FLOAT  :: 0x7F_FC_40_02_00_00_00_00 // 64-bit IEEE-754 Float in a Box
  MASK_PLACE_FAIL   :: 0x7F_FC_40_04_00_00_00_00 // Failure in a Box
  MASK_PLACE_TRUTH  :: 0x7F_FC_40_06_00_00_00_00 // Boolean in a Box
  MASK_PLACE_EMPTY  :: 0x7F_FC_40_08_00_00_00_00 // Empty in a Box
  MASK_PLACE_INT    :: 0x7F_FC_40_0A_00_00_00_00 // 32-bit Whole Number in a Box
  MASK_PLACE_RUNE   :: 0x7F_FC_40_0C_00_00_00_00 // Unicode Character in a Box
  MASK_PLACE_SYMBOL :: 0x7F_FC_40_0E_00_00_00_00 // Interned String ID in a Box
  MASK_PLACE_VERS   :: 0x7F_FC_40_10_00_00_00_00 // Version in a Box
  MASK_PLACE_DATE   :: 0x7F_FC_40_12_00_00_00_00 // 45-bit Millisecond Epoch Timestamp in a Box

// Standard Heap Objects
MASK_OBJECT         :: 0x7F_FE_80_00_00_00_00_00 // Base Category
  MASK_MAP          :: 0x7F_FE_80_02_00_00_00_00 // Pure object: No positional elements
  MASK_MAP_LIST     :: 0x7F_FE_80_04_00_00_00_00 // Hybrid Map with positional backing list
  MASK_ROUTINE      :: 0x7F_FE_80_06_00_00_00_00 // Executable Code
  MASK_SELECTOR     :: 0x7F_FE_80_08_00_00_00_00 // Pattern-Matching Block / Switch
  MASK_SUBMAP       :: 0x7F_FE_80_0A_00_00_00_00 // Parameter Set / Data Constructor

// Array Data Objects
MASK_ARRAY          :: 0x7F_FE_80_00_00_00_00_00 // Base Category
  MASK_LIST         :: 0x7F_FE_80_02_00_00_00_00 // Used strictly in Chunks and MapLists
  MASK_TEXT         :: 0x7F_FE_80_04_00_00_00_00 // User-facing String type
  MASK_SEQUENCE     :: 0x7F_FE_80_06_00_00_00_00 // Used exclusively in Chunks
  MASK_CACHE        :: 0x7F_FE_80_08_00_00_00_00 // Polymorphic Inline Cache

// Metadata & Control Objects
MASK_LEGEND         :: 0x7F_FF_00_00_00_00_00_00
  MASK_MAP_LEGEND   :: 0x7F_FF_00_02_00_00_00_00 // Map Metadata/Class descriptor)
  MASK_TEXT_LEGEND  :: 0x7F_FF_00_04_00_00_00_00 // Text Metadata, delegates to backing map
MASK_FIELD          :: 0x7F_FF_40_00_00_00_00_00 // Map Field descriptor

// First-Class Tuplespace Objects
MASK_TUPLE          :: 0x7F_FF_80_00_00_00_00_00
  MASK_TUPLE_SIGNAL :: 0x7F_FF_80_02_00_00_00_00 // `#` (Bubble Up Request)
  MASK_TUPLE_REPLY  :: 0x7F_FF_80_04_00_00_00_00 // `^` (Drill Down Response)
  MASK_TUPLE_PROCL  :: 0x7F_FF_80_06_00_00_00_00 // `$` (Static State / Assertion)

// Virtual Machine State Objects
MASK_VIRTUAL      :: 0x7F_FF_C0_00_00_00_00_00
  MASK_CHUNK        :: 0x7F_FF_C0_02_00_00_00_00 // Code Coordinator
  MASK_CONTEXT      :: 0x7F_FF_C0_04_00_00_00_00 // Execution Frame Object
  MASK_PROCESS      :: 0x7F_FF_C0_06_00_00_00_00 // Green Thread (Actor)
```

## Object Topologies & Memory Layouts

All objects allocate contiguous 64-bit word arrays in the Eden heap. Logic is dispatched using explicit integer offsets.

### Metadata & Control Objects

```odin
// THE LEGEND (Standard Map Hidden Class / Dependency Graph)
MAP_LEGEND_OFFSET_MARK        :: 0 // Value(MASK_LEGEND)
MAP_LEGEND_OFFSET_GC_LINK     :: 1 // Forwarding address / List Traversal
MAP_LEGEND_OFFSET_FIELD_COUNT :: 2
MAP_LEGEND_OFFSET_SUPPLY_LINK :: 3 // JIT invalidation tracking
MAP_LEGEND_OFFSET_DEMAND_LINK :: 4 // JIT invalidation tracking
MAP_LEGEND_OFFSET_FIELDS      :: 5 // Inline absolute offset field definitions

// THE TEXT LEGEND (Metadata for Texts)
// Texts do not store fields. They delegate to a backing Map for OUTER ops.
TEXT_LEGEND_OFFSET_MARK       :: 0 // Value(MASK_LEGEND)
TEXT_LEGEND_OFFSET_GC_LINK    :: 1 // Forwarding address during Scavenge
TEXT_LEGEND_OFFSET_PARENT     :: 2 // Pointer to a backing map containing wrappers for OUTER array ops

// THE CHUNK (JIT Coordinator - NO LEGEND)
CHUNK_OFFSET_MARK             :: 0 // Value(MASK_CHUNK)
CHUNK_OFFSET_SEQUENCE         :: 1 // Pointer to Executable Bytes
CHUNK_OFFSET_LIST             :: 2 // Pointer to GC-tracked Word Array

// THE PIC ARRAY (Polymorphic Inline Cache)
PIC_OFFSET_MARK               :: 0 // Value(MASK_ARRAY)
PIC_OFFSET_LEGEND             :: 1 // Pointer to standard Array Legend
PIC_OFFSET_LENGTH             :: 2 // Boxed Integer: Number of words in payload
PIC_OFFSET_ORIGINAL_SYM       :: 3 // The original MASK_SYMBOL being looked up
PIC_OFFSET_PAIRS              :: 4 // [Legend_A, Offset_A, Legend_B, Offset_B...]
```

### Base Objects & Execution

```odin
// THE MAP, SUBMAP, AND REALM
// Note: Submaps and Realms share the exact same structural memory layout as a Map.
// The distinct Mark dictates VM execution behavior.
MAP_OFFSET_MARK   :: 0 // Value(MASK_MAP) or MASK_SUBMAP
MAP_OFFSET_LEGEND :: 1 // Includes a delegate/parent pointer field for scope chaining
MAP_OFFSET_VALUES :: 2 // Field Values start here

// THE MAPLIST (The Hybrid Layout)
// Used when an object dynamically receives positional elements (a[0] := "foo").
MAPLIST_OFFSET_MARK   :: 0 // Value(MASK_MAP_LIST)
MAPLIST_OFFSET_LEGEND :: 1 // Pointer to the exact same Legend used by the pure Map
MAPLIST_OFFSET_LIST   :: 2 // Pointer to a MASK_LIST containing the positional elements
MAPLIST_OFFSET_VALUES :: 3 // Dynamic Field Values shift down to start here

// THE PLACE (Boxed Primitive / Reference Slot)
PLACE_OFFSET_MARK   :: 0 // Value(MASK_PLACE)
PLACE_OFFSET_LEGEND :: 1
PLACE_OFFSET_WORD   :: 2 // Boxed primitive payload
PLACE_OFFSET_VALUES :: 3 // Field Values start here

// THE ROUTINE AND SELECTOR (Executable Closures)
// Selectors are fundamentally executable code blocks. They share the exact memory layout
// as Routines, possessing executable Chunks and lexical Scopes.
ROUTINE_OFFSET_MARK   :: 0 // Value(MASK_ROUTINE) or MASK_SELECTOR
ROUTINE_OFFSET_LEGEND :: 1
ROUTINE_OFFSET_CHUNK  :: 2 // Pointer to Chunk (Executable code)
ROUTINE_OFFSET_SCOPE  :: 3 // Pointer to Captured Lexical Map (Environment)
ROUTINE_OFFSET_VALUES :: 4 // Field Values start here

// THE CONTEXT (Execution Frame - 38 Words)
CTX_OFFSET_MARK    :: 0 // Value(MASK_CONTEXT)
CTX_OFFSET_ROUTINE :: 1 // Pointer to executing Routine/Selector
CTX_OFFSET_CALLER  :: 2 // Pointer to parent Context (Call stack)
CTX_OFFSET_LOCALS  :: 3 // Pointer to current Map of local variables
CTX_OFFSET_PC      :: 4 // ABSOLUTE pointer to current instruction
CTX_OFFSET_SP      :: 5 // Stack pointer index (0-32)
CTX_OFFSET_STACK   :: 6 // Isolated operand stack (Index 6 to 37)

// THE PROCESS (Green Thread)
PROC_OFFSET_MARK    :: 0 // Value(MASK_PROCESS) | FLAG_ZOMBIE_PROC (if paused)
PROC_OFFSET_GC_LINK :: 1 // Forwarding address during Scavenge
PROC_OFFSET_SPACE   :: 2 // Pointer to Current Space (Realm)
PROC_OFFSET_CONTEXT :: 3 // Pointer to the currently executing Context frame

// THE TUPLE (Signals, Replies, Proclamations)
TUPLE_OFFSET_MARK   :: 0 // MASK_TUPLE_SIGNAL, \_REPLY, or \_PROCL
TUPLE_OFFSET_GC_LINK :: 1 // Forwarding address during Scavenge
TUPLE_OFFSET_REALM :: 2 // Pointer to the Realm/Map this tuple is attached to
TUPLE_OFFSET_TOPIC :: 3 // A MASK_SYMBOL literal (e.g., 'foo')
TUPLE_OFFSET_COUNT :: 4 // Boxed integer: Number of arguments (used to navigate Tuple lists)
TUPLE_OFFSET_ARGS :: 5 // 64-bit argument Values start here...
```

### Array Objects (Lists & Sequences)

```odin
// THE LIST (Standard Word Array)
LIST_OFFSET_MARK :: 0 // Value(MASK_ARRAY)
LIST_OFFSET_LEGEND :: 1 // Pointer to an Array Legend
LIST_OFFSET_WORD_COUNT :: 2 // Boxed integer length
LIST_OFFSET_DATA :: 3 // 64-bit Values start here

// THE TEXT (Unicode String)
TEXT_OFFSET_MARK :: 0 // Value(MASK_ARRAY)
TEXT_OFFSET_LEGEND :: 1 // Pointer to an Array Legend
TEXT_OFFSET_RUNE_COUNT :: 2 // Boxed integer length
TEXT_OFFSET_DATA :: 3 // Packed 32-bit Runes (Rune x 2) start here

// THE SEQUENCE (Read-Only Code Array - NO LEGEND)
SEQ_OFFSET_MARK :: 0 // Value(MASK_SEQUENCE)
SEQ_OFFSET_GC_LINK :: 1 // Pointer to what it's connected to
SEQ_OFFSET_CODE_COUNT :: 2 // Boxed integer length
SEQ_OFFSET_DATA :: 3 // Packed 8-bit opcodes (Code x 8) start here
```

### D. Raw Array Packing (Dense Reads)

- Sequence (Code x 8): Packs exactly eight 8-bit opcodes into one 64-bit word.
- Text (Rune x 2): Packs exactly two 32-bit Unicode Runes into one 64-bit word.

```odin
@inline
fetch_instruction :: proc(seq_ptr: [^]Value, absolute_pc: int) -> u8 {
word_index := SEQ_OFFSET_DATA + (absolute_pc / 8)
byte_shift := (absolute_pc % 8) \* 8
return u8((u64(seq_ptr[word_index]) >> byte_shift) & 0xFF)
}
```

## The Tripartite Execution Architecture (JIT & W^X)

Executable code is segregated into three distinct objects to satisfy modern OS W^X (Write XOR Execute) policies and protect CPU cache locality.

1. **Chunk (Coordinator):** Lightweight struct linking the code, literals, and local frame layout.
2. **Sequence (I-Cache):** Pure 8-bit opcodes. Can be moved to **Executable / Read-Only** memory upon JIT compilation. Traced but NOT scanned by the GC.
3. **List (D-Cache):** NaN-boxed GC pointers and literals. Exists in **Writable / Non-Executable** memory. Traced and aggressively updated by the GC.

## FFI, Caching & Polymorphic Inline Caches (PIC)

To support deep OOP semantics without hardcoding operations, the VM converts slow symbol lookups into blisteringly fast jumps using the Chunk's writable List.

### The Extension Accumulator

Because opcodes are 8-bit (3 bits opcode, 5 bits payload), indexing into large List arrays requires an accumulator.

```odin
// Inside VM Loop
opcode := instruction >> 5
payload := u32(instruction & 0x1F)

switch opcode {
case OP_EXT:
vm.index_accumulator += (payload \* 32)
case OP_OUTER:
final_index := vm.index_accumulator + payload
vm.index_accumulator = 0
execute_outer(vm, ctx_ptr, final_index)
}
```

### The PIC Lifecycle

1. Uninitialized: List[index] holds a `MASK_SYMBOL`. The VM does a slow string lookup.
2. Monomorphic: Overwrites the Symbol with an Integer FFI ID (for OUTER) or the exact Value Offset (for INNER).
3. Polymorphic (PIC): If a new Receiver type arrives, the VM allocates a MASK_ARRAY (PIC Array). It stores the original Symbol at PIC_OFFSET_ORIGINAL_SYM, then appends [Legend, Offset] pairs. Future calls linearly scan this short array.
4. Megamorphic: If the PIC Array exceeds 4 pairs, the site is too dynamic. The VM reads the original symbol, applies the `FLAG_MEGAMORPHIC` bit, and overwrites the List pointer with this flagged symbol. The VM now permanently falls back to a hash lookup.

## Dates & The Millisecond Epoch

Dates are aggressively optimized as primitive inline values using a 45-bit Millisecond Epoch approach.

- The Math: The 45-bit payload acts as a signed integer tracking the total milliseconds elapsed since the Unix Epoch (January 1, 1970).
- The Window: This comfortably covers a ~1,115-year span (~1412 AD to ~2527 AD), providing instant CPU-level addition (e.g., adding days as milliseconds) and timezone-agnostic (UTC) storage without memory allocations.
- The `DatePlace` Fallback: If a date operation exceeds this 1,115-year window, the VM automatically boxes the primitive into a DatePlace (a standard Place object on the heap). Instead of milliseconds, the DatePlace utilizes a single integer field representing an offset of years from 1/1/1970.

## Maps, Scopes, and Lexical Environments

Maps are the universal workhorse of the Rhumb VM. They act as standard dictionaries, parameter sets, and execution environments simultaneously.

### The Lexical Scope Lifecycle (Routines & Contexts)

Local labels are directly compiled into Map fields. The connection between closures and their execution environment relies on Map delegation:

1. Closure Capture (`OP_CLOSURE`): When the VM encounters a function definition, it allocates a new Routine object. To capture the environment, the VM takes the currently executing Context's `CTX_OFFSET_LOCALS` map pointer and assigns it to the new Routine's `ROUTINE_OFFSET_SCOPE`.
2. Context Instantiation: When an OUTER opcode invokes the Odin function responsible for handling execution, a new Context frame is instantiated. The Odin FFI handler prepares the `CTX_OFFSET_LOCALS` Map.
   - If a submap is provided, it is invoked to generate the new locals Map.
   - Otherwise, a blank Map is generated.
   - In both cases, the instantiated Map inherently possesses a Legend that correctly describes its fields.
3. The Delegate Link: The VM wires this new local Map's internal delegate pointer to the `ROUTINE_OFFSET_SCOPE`. When the VM attempts to resolve a local label, it checks the current context's Map. If the field is missing, the Map automatically delegates the lookup up the lexical scope chain.

### Submaps & Parameter Spreading

Submaps are first-class `MASK_SUBMAP` objects delineated by `<[]>`. They are a hybrid between a routine and a map. You build them literally like maps, but bare symbols are treated as empty fields, and assignments are treated as default values.

- Label Limbo: Elements within a Submap exist in a suspended state awaiting assignment. If a label is marked as immutable, the VM assigns it a special Write-Once mutability flag (transitioning from `MASK_EMPTY` to a value exactly once).
- Named Data Constructors: You can call a submap later like a function, and it will accept arguments and place them into the fields that were defined during its construction.
- Invocation vs. Application:
  - When a Submap is invoked like a function, the VM creates a standard `MASK_MAP`, pulling arguments into the corresponding label positions.
  - When supplied to the applicative operator (`->`), it defines parameters. The Submap layout dictates the precise structure of the `CTX_OFFSET_LOCALS` Map initialized during invocation.
- To effectively "spread" labels into another Submap:
  - Wrap the Submap in reference brackets and use the void label field access syntax (`<foo>\*`), the VM flattens the labels directly into the target Submap
  - If you leave off the `\*`, the Submap structure will be nested inside of the target Submap.
  - You cannot use the standard `&` operator because that acts as a "slurp" operator inside of Submaps.

## Control Flow & Algebraic Effects

### The Auto-Boxing Mutation Contract

Primitives like `MASK_INTEGER` are strictly pass-by-value. However, they can be dynamically upgraded into heap-allocated `Place` objects when fields are added or mutated. Because there are no distinct "set" opcodes, the VM relies on `MASK_ADDRESS` pointers on the operand stack.

When the user executes a mutating operation like `a\foo := 10` (where `a` currently holds an Integer), the VM handles this seamlessly:

1. `OP_LOCAL a` performs a map lookup in `CTX_OFFSET_LOCALS` and pushes a `MASK_ADDRESS` pointing directly to the memory slot of the local variable.
2. `OP_INNER foo` pops that `MASK_ADDRESS`. It dereferences it and sees the primitive integer. It allocates a new `Place` object on the heap, writes the new `Place` pointer directly back into the local variable's `MASK_ADDRESS` (updating `a` in-place!), and pushes a new `MASK_ADDRESS` pointing to the `foo` field inside the new `Place`.
3. `OP_VALUE 10` pushes the literal 10.
4. `OP_OUTER _:=_` pops the 10 and the `MASK_ADDRESS`, writing the value directly to the memory slot.

Because locals and heap properties both yield `MASK_ADDRESS` pointers on the stack, `OUTER _:=_` acts as a universal, polymorphic assignment operator. `MASK_PLACE` is exclusively utilized when a primitive needs to gain properties or cross reference boundaries while maintaining shared mutability.

### Ternary Branching & Handled Success (`=>` and `~>`)

Ternary logic utilizes the `FLAG_HANDLED_BRANCH` bit. This solves the edge case where a standalone fallback (e.g., `a ~> b`) must trigger on a standard false, but a chained ternary (a => false ~> c) must bypass c.

- `=>` (Then): If false, yields a standard Falsy value. If true, evaluates its block. If that block results in a Falsy value, the VM tags it with `FLAG_HANDLED_BRANCH`, marking it as a "Protected Success."
- `~>` (Else): Triggers only if the stack holds a standard, unprotected Falsy value. If it sees a Truthy value OR a Falsy value carrying the `FLAG_HANDLED_BRANCH` bit, it bypasses its fallback block and passes the value forward.
  **Note**: The VM scrubs the `FLAG_HANDLED_BRANCH` bit on assignments (`_:=_`) and returns (bare signals `#()`) to prevent "poisoning" variables downstream.

### Selectors & Pattern Matching (`MASK_SELECTOR`)

Selectors are first-class `MASK_SELECTOR` objects delineated by `{}` (or `<{}>` for realms). Because they evaluate expressions and manage control flow, they are structurally stored as executable Routines, possessing a Chunk and lexical Scope.

The distinction between `..` (Take/Break) and `::` (Peek/Fallthrough) does not require any special Virtual Machine state. It is handled entirely by the Compiler through Static Analysis and standard `OUTER _JMP_F_` (Jump If False) conditional branching.

- `..` (Take / Break): The compiler generates the Right-Hand Side (RHS) execution bytecode, and then artificially appends an `OP_OUTER _#_` (Return) instruction to force the execution frame to exit.
- `::` (Peek / Fallthrough): The compiler generates the RHS bytecode, but does not append a return. The Program Counter (PC) naturally falls through to evaluate the next case.
- Else Clause: The compiler enforces (via static analysis) that exactly one expression exists without a `..` or `::` operator, ensuring a guaranteed return path for the Routine block.

#### Reverse Compilation & Signal Handlers

When a selector is attached directly to an expression (e.g., function calls), the compiler cannot simply compile the expression from left to right. If the compiler generates bytecode for the `foo(bar)` expression before setting up the selector block, any `#error` signals emitted inside `foo` will bypass the handler because the execution context hasn't been wrapped in the handler logic yet.

To solve this, the code generator must carefully compile these structures in reverse:

1. **Handler First:** It must first generate the bytecode that sets up the selector block and registers its handlers in the current execution frame.
2. **Expression Second:** Only after the handler block is established can it weave in the bytecode to evaluate the attached expression (`foo(bar)`).

This ensures that by the time the VM passes execution into the body of `foo`, the surrounding context is fully prepared to catch and handle any signals it emits.

#### Compiler Backpatching for Branch Offsets

Because the Rhumb compiler is strictly single-pass to maintain blisteringly fast JIT speeds, it encounters a "Forward Reference Problem" when generating \_JMP\*F\* offsets: it doesn't yet know how large the Right-Hand Side (RHS) block will be.

To solve this, the compiler utilizes Backpatching leveraging the Tripartite Architecture (Chunk, Sequence, List):

- Emit Dummy: When the compiler emits the conditional jump, it pushes a dummy offset (e.g., 0) into the Chunk's writable List (D-Cache) and emits a % VALUE opcode pointing to that index.
- Patch Stack: It pushes that List index onto a temporary "Patch Stack" within the compiler.
- Compile RHS: It compiles the entire RHS block normally, advancing its internal Program Counter (PC).
- Backpatch: Once the RHS block is fully generated, the compiler pops the index off the Patch Stack, calculates the true byte offset (Current_PC - Jump_PC), and simply overwrites the dummy slot in the List with the exact MASK_INTEGER.

This enables JMP_F to execute at runtime as an instantaneous $O(1)$ `PC += pop(stack)` math addition without the VM ever needing to scan memory for sentinels.

## Algebraic Effects (EVENT / REPLY)

The Context object acts as a zero-cost continuation.

- EVENT (`#`): Marks the active Context as suspended. Traverses up the `CTX_OFFSET_CALLER` chain until it finds a handler. Evaluates the handler, pushing the suspended Context pointer as an implicit argument to the handler routine.
- REPLY (`^`): The handler uses the received Context pointer as the target for REPLY. The VM locates this suspended frame, pushes the resolved Value into its isolated stack array, and wakes it up.

## Garbage Collection (Generation & Mark/Sweep)

The Rhumb VM utilizes a dual-generation memory model. Because Context frames are standard Eden objects, there is no custom "Call Stack" GC traversal. The GC simply treats the active Context as the root.

### Generational Memory Spaces

1. Eden Space (Young): Rapid bump-allocation.
2. Survivor Spaces (From/To): When Eden fills up, the Generation Scavenger runs. Live objects are traced and copied. CRITICAL: When an object is moved from Eden to Survivor, the GC overwrites its Mark word (Offset 0) with a MASK_ADDRESS pointing to the new location. Any subsequent traces instantly recognize the object as forwarded.
3. Tenured Space (Old): Promoted objects are managed via a Tri-Color Mark/Sweep algorithm to reclaim memory in place.

### The GC Flags Memory Map (Bits 37 - 49)

Every heap object embeds metadata flags directly into its 64-bit Mark word. The bits map exactly as follows:

- **Bits 49 - 46**: Type Bits (`0x00_3C_00_00_00_00_00_00`)
- **Bits 45 - 44**: JIT Flags (`0x00_00_30_00_00_00_00_00`)
- **Bits 43 - 42**: Mutability Flags (`0x00_00_0C_00_00_00_00_00`)
- **Bits 41 - 40**: GC Sweep Flags (`0x00_00_03_00_00_00_00_00`)
- **Bits 39 - 38**: GC State Flags (`0x00_00_00_C0_00_00_00_00`)

#### GC Sweep Flags (Bits 41-40)

```odin
GC_SWEEP_WHITE  :: 0x00_00_00_00_00_00_00_00 // Unvisited
GC_SWEEP_GREY   :: 0x00_00_01_00_00_00_00_00 // Visited, pending children
GC_SWEEP_BLACK  :: 0x00_00_02_00_00_00_00_00 // Visited, children scanned
GC_SWEEP_DEAD   :: 0x00_00_03_00_00_00_00_00 // Reclaimed
```

#### GC State Modifiers (Bits 39-38)

```odin
GC_STATE_STD :: 0x00_00_00_00_00_00_00_00
GC_STATE_WEAK :: 0x00_00_00_40_00_00_00_00
GC_STATE_PINNED :: 0x00_00_00_80_00_00_00_00 // Immovable (FFI pointers)
GC_STATE_GLOBAL :: 0x00_00_00_C0_00_00_00_00 // Immortal Singleton (e.g. Core Legends)
```

#### Mutability Flags & Mutex Locks (Bits 43-42)

```odin
FLAG_MUT_MUTABLE :: 0x00_00_00_00_00_00_00_00 // 00: Standard Mutable Object
FLAG_MUT_ONCE :: 0x00_00_04_00_00_00_00_00 // 01: Write-Once (Submap parameter initialization)
FLAG_MUT_IMMUT :: 0x00_00_08_00_00_00_00_00 // 10: Fully Immutable / Read-Only
FLAG_LOCKED :: 0x00_00_0C_00_00_00_00_00 // 11: VM Mutex Spinlock (Actively locked by an OS Thread)
```

### The Fast-Path Tracing Optimizations

When the GC traces a Context frame, it filters out values that don't need tracing.

```odin
@inline
needs_tracing :: proc(v: Value) -> bool {
    val := u64(v)
    if (val & MASK_FLOAT) != 0 do return false
    if (val & MASK_ADDRESS) == MASK_ADDRESS do return true

    // Checks for 0x7F_FE or 0x7F_FF prefix (Eden Objects)
    if (val & 0x7F_FE_00_00_00_00_00_00) == 0x7F_FE_00_00_00_00_00_00 do return true

    return false // Inline Primitive

}
```

- Partial Stack Scanning: The Scavenger reads `CTX_OFFSET_SP` and only traces the Context stack up to that exact index.
- Absolute PC Race Condition Prevention: When tracing the Context's PC, the GC must traverse to the Sequence. If multiple Contexts point to the same Sequence, it might have already been moved. The GC must check the Sequence's `GC_LINK` forwarding pointer first, and apply the Absolute PC offset math to the forwarded base address, ensuring JIT-compiled CPU registers remain perfectly mapped.

## Dynamic Deoptimization & Selective Invalidation

A high-productivity programming environment requires that programming changes take effect instantly. The Rhumb VM accomplishes this by selectively invalidating only affected compiled methods.

### The Four Rules of Dependency Linking

All dependency links are securely confined to Legends using the `LEGEND_OFFSET_SUPPLY_LINK` and `LEGEND_OFFSET_DEMAND_LINK` fields (doubly-linked circular lists).

1. Routine Compilation: A link between the legend field description containing the routine and the compiled code.
2. Inlining: A link between the matching field description and the compiled code.
3. Parent/Subfield Traversal: A link between the field description containing the subfield and the compiled code.
4. Failed Lookups (Misses): A link between the legend of the object searched and the compiled code (in case a matching field is added later).

### Handling Executing Routines (Deoptimization/OSR)

Routines that are currently executing cannot simply be flushed. The VM utilizes On-Stack Replacement (OSR). Because every execution frame is an explicitly allocated Context object in Eden, the VM safely pauses execution, maps the JIT-compiled native hardware registers back into the Context's absolute PC and Operand Stack offsets, discards the invalidated machine code, and seamlessly reconstructs the execution state in the slow-path bytecode Interpreter.

## Concurrency, Tuplespace & Proclamations

Rhumb replaces the traditional Call Stack with a Hierarchical Tuplespace driven by the Syndicated Actor Model. Concurrency is handled entirely through `MASK_TUPLE` objects (Signals, Replies, and Proclamations) traversing between `MASK_PROCESS` Green Threads.

### Atomic Tuple Allocation

Tuples are variable-length heap objects. To avoid GC Traps caused by uninitialized memory slots during argument evaluation, the VM utilizes the Context's operand stack as an atomic accumulator.

The VM evaluates the Realm, the Topic, pushes a `MASK_SENTINEL`, and then evaluates all arguments. Only when the final `OUTER _$*_` (or `_*#_`) opcode is executed does the VM pop the entire block, scanning back to the Sentinel to determine the exact `COUNT`. It then bump-allocates the `MASK_TUPLE` in Eden in one atomic, memory-safe operation.

### Proclamation Lists & Virtual Deduplication

Proclamations ($) are declarative assertions of state, not imperative subroutine calls.

When an actor asserts a Proclamation (e.g., `supply\run$status('active')`), it attaches to a Realm.

- The Proclamation List: Realms treat Proclamations as a list. The VM navigates this collection by consuming the Topic and using the Tuple's `TUPLE_OFFSET_COUNT` to skip to the next object in memory.
- Virtual Deduplication: Deduplication does not happen physically in memory. Identical proclamations are added to the list, but the deduplication happens virtually when the Realm processes signals. A subscriber is notified of a proclamation's presence exactly once; subsequent equivalent assertions do not trigger new notifications.
- The Zero-Cost Equivalence Check: To deduplicate virtually, the Realm must check if a Tuple matches an existing one. Because of Rhumb's NaN-boxing architecture, equality is evaluated instantly. A single u64 bitwise equality check simultaneously validates exact literal matching (for `Integer`, `Symbol`, `Rune`) AND exact instance matching (comparing `MASK_ADDRESS` memory pointers for heap objects).

### Reference Operators, Retraction & Partial Application

Because Tuples represent state rather than logic, they cannot be partially applied or invoked like a Routine.

- References (`p := supply_run$status`): This saves a direct pointer to the `MASK_TUPLE_PROCL` object in memory. You cannot change its arguments or invoke it.
- Retraction (`p := ___`): The only way to retract a proclamation is to have a reference to its memory location and set it to Empty. The Realm detects the retraction. A notification of removal is only sent to subscribers if the last equivalent proclamation has been removed from the virtual set.
- Invocation Errors (`p(1)`): This will throw a runtime error, because a `MASK_TUPLE` is not a `MASK_ROUTINE`. It has no executable Sequence.
- Assertion (`p := supply_run$status(1)`): This evaluates the arguments, creates an entirely new `MASK_TUPLE_PROCL` atomically, asserts it to the supply_run realm, and saves the new reference to p.
- Deferred Subroutines (`f := <(supply_run$status(?1))`): If a developer wants the behavior of partial application, they use a standard Routine (macro/closure). Executing `f(2)` invokes the routine, which internally asserts a brand new proclamation, `status(2)`.

## VM-Level Concurrency Control & Object Locking

In a system utilizing Green Threads and the Syndicated Actor Model (SAM), there is a natural tension between Actor-based state isolation and low-level memory pointers. At the application layer, state should never be shared across thread boundaries, relying on Idiomatic SAM message passing to coordinate processes.

However, at the Virtual Machine Implementation Layer, physical thread safety is unavoidable. Because the Odin backend leverages multiple OS worker threads concurrently scheduling execution, Rhumb's internal operations (such as dynamically appending to a List or traversing a Realm) must be protected from race conditions where two threads mutate the same MASK_ADDRESS simultaneously.

### The Mark Word Spinlock (Low-Level VM Mutex)

To solve this efficiently, the VM leverages the perfectly saturated 2-bit Mutability Flags (Bits 43-42) found in the Mark word of every heap object.

We introduce two internal FFI operations (OUTER \_lock\* and OUTER \_unlock\*) that OS threads use to acquire exclusive write access to a specific object.

#### Acquiring the Lock

```odin
proc acquire_lock(vm: ^VM, active_proc: Value, target_addr: Value) -> u64 {
    target_ptr := deref(target_addr)

          for {
              old_mark := target_ptr[0]

              // Extract the current 2-bit mutability state
              mut_state := old_mark & 0x00_00_0C_00_00_00_00_00

              if mut_state == FLAG_LOCKED {
                  // ALREADY LOCKED! Yield the green thread back to the scheduler.
                  active_proc[PROC_OFFSET_MARK] |= FLAG_ZOMBIE_PROC
                  enqueue_wait_list(target_addr, active_proc)
                  return YIELD_TO_SCHEDULER
              }

              if mut_state == FLAG_MUT_IMMUT {
                  panic("Cannot lock an immutable object!")
              }

              // CAS: Swap the current mutability state to FLAG_LOCKED
              new_mark := (old_mark & ~0x00_00_0C_00_00_00_00_00) | FLAG_LOCKED
              if atomic_cas(&target_ptr[0], old_mark, new_mark) {
                  // SUCCESS! Return the original state so the OS thread can restore it later.
                  return mut_state
              }
          }

}
```

#### Releasing the Lock

When the OS thread finishes updating the object and all necessary dependents, it restores the original mutability state seamlessly.

```odin
proc release_lock(vm: ^VM, target_addr: Value, original_mut_state: u64) {
target_ptr := deref(target_addr)

    for {
        old_mark := target_ptr[0]

        // CAS: Restore the original mutability state (e.g., FLAG_MUT_MUTABLE)
        new_mark := (old_mark & ~0x00_00_0C_00_00_00_00_00) | original_mut_state
        if atomic_cas(&target_ptr[0], old_mark, new_mark) {
            break
        }
    }

    // Wake up the next ZOMBIE process in the waiting queue
    if has_waiters(target_addr) {
        next_proc := dequeue_wait_list(target_addr)
        next_proc[PROC_OFFSET_MARK] &= ~FLAG_ZOMBIE_PROC
        enqueue_runqueue(vm.scheduler, next_proc)
    }

}
```

Why this fits the architecture perfectly:

- **Zero Extra Memory**: The Mutex state is fully encapsulated in a pre-existing 64-bit word that every heap object already has.
- **Perfect Saturation**: By mapping Mutable (`00`), Write-Once (`01`), and Immutable (`10`), the final `11` bit-state perfectly acts as the temporary lock flag.
- **Safe Halting**: Instead of blocking the actual OS Thread in an infinite spinloop, a locked object gracefully forces the Green Thread to yield as a `FLAG_ZOMBIE_PROC`, ensuring the OS thread remains free to execute other runnable processes while the lock is held.
