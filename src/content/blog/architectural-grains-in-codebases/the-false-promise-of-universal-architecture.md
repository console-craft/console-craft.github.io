---
title: The False Promise of Universal Architecture
description: Why great React code does not look like great Python code.
pubDate: 2026-08-07
series:
  title: Architectural Grains in Codebases
  order: 1
---

## Premise

Consider this perfectly plausible React component:

```tsx
function ProductsPage({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(products)

  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value)
    },
    [],
  )

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()),
      ),
    )
  }, [products, query])

  const productRows = useMemo(
    () =>
      filteredProducts.map(product => (
        <ProductRow key={product.id} product={product} />
      )),
    [filteredProducts],
  )

  return (
    <section>
      <SearchInput value={query} onChange={handleQueryChange} />
      <ProductTable>{productRows}</ProductTable>
    </section>
  )
}
```

It compiles.

The types are fine. The hooks are legal. The dependency array is correct. Tests can pass. SonarQube may have nothing particularly dramatic to say about it.

And yet an experienced React developer will probably feel a small disturbance in the component tree.

The filtered products do not need to be state. They are derived from `products` and `query`. The Effect is coordinating values already controlled by React. The memoized callback does not seem to buy us anything. The memoized rows may be optimizing a problem we have not measured.

The component can probably be written as:

```tsx
function ProductsPage({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <section>
      <SearchInput
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      <ProductTable>
        {filteredProducts.map(product => (
          <ProductRow key={product.id} product={product} />
        ))}
      </ProductTable>
    </section>
  )
}
```

Perhaps `query` should not even be component state. If it represents a searchable page that users can bookmark, share, navigate back to, or restore after refreshing, it may belong in the URL.

That is not a syntax correction. It is not even a normal refactor in the classic "extract method" sense.

It is a change in how the application is being modelled.

The official React guidance teaches developers to identify the minimal representation of state, calculate derived data rather than duplicating it, and treat Effects primarily as synchronization with systems outside React ([Thinking in React](https://react.dev/learn/thinking-in-react), [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)).

Now consider this Python:

```python
class InvoiceProcessingServiceInterface(ABC):
    @abstractmethod
    async def process(self, invoice_id: UUID) -> None:
        ...


class InvoiceProcessingService(
    InvoiceProcessingServiceInterface,
):
    def __init__(
        self,
        invoice_repository: InvoiceRepositoryInterface,
        customer_repository: CustomerRepositoryInterface,
        document_generator: DocumentGeneratorInterface,
        notification_service: NotificationServiceInterface,
    ) -> None:
        self._invoice_repository = invoice_repository
        self._customer_repository = customer_repository
        self._document_generator = document_generator
        self._notification_service = notification_service

    async def process(self, invoice_id: UUID) -> None:
        invoice = await self._invoice_repository.get(invoice_id)
        customer = await self._customer_repository.get(
            invoice.customer_id,
        )

        document = await self._document_generator.generate(
            invoice,
            customer,
        )

        await self._notification_service.send(
            customer,
            document,
        )
```

Nothing here is inherently wrong either.

There may be a real need for those boundaries. There may be multiple implementations. The code may live in a large system where explicit interfaces carry their weight.

But in many Python applications, the entire operation could naturally be a module-level function:

```python
async def process_invoice(invoice_id: UUID) -> None:
    invoice = await invoice_repository.get(invoice_id)
    customer = await customer_repository.get(invoice.customer_id)

    document = await generate_document(invoice, customer)

    await send_document(customer, document)
```

Dependencies might be passed directly, imported from cohesive modules, or provided through the framework at a meaningful boundary. The correct choice depends on the application.

The important observation is not that the first example is always bad and the second is always good.

The observation is this:

> Great React code and great Python code do not merely use different syntax. They often have different shapes.

Once you notice that, a lot of universal architecture advice starts to feel slightly suspicious.

Not necessarily wrong. Just suspicious.

## You can recognize a codebase from across the room

After working across several languages and frameworks, I started noticing that good codebases have different silhouettes.

I am not talking about semicolons, indentation, decorators, JSX, or curly braces. Those are the obvious differences.

Step back and squint at the codebase.

Look at:

- the average file size
- how many helper functions live together
- the ratio of executable code to type declarations
- whether behavior is grouped into classes, functions, modules, or components
- where state is stored
- whether control flow reads vertically or jumps across abstractions
- how many files exist purely to connect other files
- how deep the directory tree is
- how close related data and behavior remain
- what the code considers a natural boundary

A healthy React feature may be composed from several relatively small components, a route, a query definition, and a custom hook that owns one coherent piece of reactive behavior.

A healthy Python module may contain 200 lines of related functions and a readable orchestration flow.

A healthy Rust module may place a few substantial enums, structs, and `impl` blocks together because the types form one conceptual unit.

A healthy Lua module may be a table returned from a file containing a cluster of local functions and closures.

Apply one ecosystem’s preferred measurements mechanically to another and you quickly get strange results.

A 250-line React component may be hiding several UI and state boundaries.

A 250-line Python module may simply tell one coherent operational story.

Five classes may express a useful domain model in C#.

The same five classes in Python may amount to an elaborate reenactment of a dictionary and three functions.

The difference becomes visible before we read the implementation.

Consider these directory trees:

```text
src/
├── controllers/
├── services/
├── interfaces/
├── repositories/
├── factories/
├── models/
└── mappers/
```

And:

```text
src/
└── features/
    └── invoices/
        ├── invoice-route.tsx
        ├── invoice-query.ts
        ├── invoice-form.tsx
        ├── invoice-table.tsx
        └── invoice-schema.ts
```

And:

```text
app/
├── invoices.py
├── customers.py
├── documents.py
└── notifications.py
```

None of these layouts proves anything on its own.

A feature-oriented React structure can still contain terrible React. A layered architecture can be exactly what a large application needs. A flat Python package can become an unstructured swamp with excellent line-of-sight across all the mud.

> However, directory structures are not neutral. They are fossils of the team’s mental model. They tell us what the authors consider important enough to become a category. They reveal whether the team primarily sees the system as features, layers, processes, types, resources, components, or technical roles.

The silhouette is evidence, not a verdict.

It is still useful evidence.

## Architecture has two layers

The tension becomes easier to understand when we separate architecture into two layers.

### Layer one: portable principles

Some ideas travel quite well between languages:

- keep related things together
- make important dependencies visible
- hide unstable implementation details
- avoid unnecessary shared mutation
- keep change local where possible
- reduce the amount of state a system must synchronize
- model important constraints explicitly
- make code readable by the humans who must change it
- create boundaries where genuine variation or risk exists

These are architectural forces.

They help us reason about software regardless of whether we are writing TypeScript, Python, Rust, C#, Lua, or something that was invented last Tuesday and already has three competing package managers.

### Layer two: local expressions

The physical structures used to satisfy those principles are not universal.

"Keep related things together" could mean:

| Ecosystem | A plausible local expression |
|---|---|
| React | Colocate a component with its state, query, and route boundary |
| TypeScript | Use a module containing functions and discriminated unions |
| Python | Keep a readable set of related functions in one module |
| Rust | Group an enum, its associated data, and its `impl` blocks |
| C# | Place behavior behind an object or service boundary |

"Depend on capabilities rather than concrete implementations" could become:

```ts
type Clock = {
  now(): Date
}
```

Because TypeScript is structurally typed, a value does not need a declared nominal relationship with `Clock`. It only needs the required shape. That design follows how JavaScript objects are normally created and passed around ([TypeScript for Java/C# Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html#co-learning-javascript)).

The same principle in Python might use a protocol:

```python
class Clock(Protocol):
    def now(self) -> datetime:
        ...
```

Or it might simply accept a callable:

```python
def create_invoice(now: Callable[[], datetime]) -> Invoice:
    return Invoice(created_at=now())
```

In Rust, the same idea might use a trait:

```rust
trait Clock {
    fn now(&self) -> DateTime<Utc>;
}
```

Unless the possible clocks form a small, closed set, in which case an enum may be the simpler and more honest model.

> The principle crosses the border. Its physical form changes clothes.

This is where many architecture discussions go wrong. We correctly discover a useful principle, then accidentally canonize the structure that expressed it in one particular ecosystem.

The interface was useful, therefore every dependency needs an interface.

The repository boundary was useful, therefore all persistence needs a repository.

The custom hook was useful, therefore all behavior should live in hooks.

The trait was useful, therefore every variation needs dynamic polymorphism.

The original reasoning disappears. The shape survives.

Architecture becomes cargo cult with better diagrams.

## Principles, patterns, and idioms are not the same thing

It helps to distinguish three levels.

### A principle is a goal

For example:

> Keep policy separate from mechanisms likely to change independently.

### A pattern is a recurring structural response

For example:

> Use the Strategy pattern to make an algorithm replaceable.

### An idiom is the ecosystem-native expression of the idea

In classic object-oriented form, Strategy might look like this:

```csharp
public interface IDiscountStrategy
{
    decimal Apply(Cart cart);
}

public sealed class LoyaltyDiscount : IDiscountStrategy
{
    public decimal Apply(Cart cart)
    {
        return cart.Total * 0.9m;
    }
}
```

In TypeScript, the same variation may only need a function:

```ts
type Discount = (cart: Cart) => Money

function checkout(cart: Cart, discount: Discount) {
  return discount(cart)
}
```

In Python:

```python
def checkout(
    cart: Cart,
    discount: Callable[[Cart], Money],
) -> Money:
    return discount(cart)
```

In Rust, the appropriate form depends on the domain.

For an open extension point, we might use a trait:

```rust
trait Discount {
    fn apply(&self, cart: &Cart) -> Money;
}
```

For a fixed set of known business rules, an enum may be more natural:

```rust
enum Discount {
    None,
    Loyalty { percentage: u8 },
    Voucher { amount: Money },
}
```

Rust enums can carry data for each variant, and pattern matching lets callers handle the alternatives explicitly. `Result<T, E>` applies the same model to success and failure ([Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html), [`Result` enum](https://doc.rust-lang.org/stable/core/result/enum.Result.html)).

The architectural principle remains recognizable across every example.

The amount and type of machinery differ substantially.

Some famous design patterns are deep, recurring solutions to real problems. Others exist partly because their original languages lacked a smaller primitive.

A first-class function can erase a family of strategy classes.

A module can erase a static utility class.

A discriminated union can erase an inheritance hierarchy.

A component tree can erase a controller-view coordination layer.

A context manager can erase repeated setup and cleanup ceremony.

> Learning patterns without learning local idioms can therefore make us worse for a while. We start seeing the named machinery everywhere, even when the host language has already compressed the idea into something smaller.

## Architecture has a grain

Wood has a grain.

> You can cut against it. Sometimes you need to. But it requires more force, damages the surface more easily, and tends to produce extra work for everyone holding the tools.

Languages and frameworks have a grain too.

That grain emerges from several forces.

### Language primitives

What does the language make cheap and expressive?

TypeScript offers functions, closures, object literals, structural typing, unions, and control-flow narrowing.

Python offers modules, functions, iterators, exceptions, context managers, dynamic dispatch, and optional gradual typing. Python’s own guidance repeatedly emphasizes readability, judgment, and consistency with the surrounding project rather than blind compliance with mechanical rules ([PEP 8](https://peps.python.org/pep-0008/)).

Rust offers ownership, borrowing, enums, pattern matching, traits, iterators, and explicit `Result` values. Ownership is not just a memory-management implementation detail. It affects how values move through APIs and which parts of a program may mutate or share them ([The Rust Programming Language: ownership](https://doc.rust-lang.org/book/?search=ownership)).

React offers components, state ownership, one-way data flow, composition, and a UI tree whose structure persists and changes over time. React’s official model starts from a component hierarchy and the minimal state required to produce it ([Thinking in React](https://react.dev/learn/thinking-in-react)).

Those primitives are not passive vocabulary. They exert architectural pressure.

### Runtime model

A garbage-collected runtime encourages different ownership decisions from Rust.

An event loop encourages different orchestration from a thread-per-request environment.

A browser UI that continuously re-renders from state creates different boundaries from a Python command that runs top-to-bottom and exits.

A runtime changes what is expensive, what is dangerous, what is implicit, and what must be made explicit.

Architecture that ignores those costs may still be beautiful on a whiteboard. Whiteboards have famously generous latency budgets.

### Framework model

Frameworks also arrive with architecture already inside them.

React is not merely a rendering library into which we pour an independently designed object model. Components, routes, state, and rendering boundaries shape the application.

A query library is not merely an HTTP helper if it owns caching, retries, invalidation, deduplication, and server-state lifecycles.

A router is not merely a switch statement if URLs represent navigable application state.

FastAPI’s request lifecycle, dependency system, validation model, and OpenAPI integration affect sensible application boundaries.

The more powerful the framework, the less credible it becomes to call it an implementation detail while designing the "real architecture" somewhere above it.

At some point, the detail starts voting.

### Tooling

Compilers, language servers, formatters, test frameworks, and refactoring tools all make some designs easier to sustain than others.

Rust’s compiler can enforce ownership and exhaustive matching.

TypeScript can narrow a discriminated union through ordinary control flow.

React’s hooks linter can check reactive dependencies.

Python’s lightweight module system makes creating a file containing related functions almost frictionless.

When a tool can enforce an invariant directly, rebuilding that invariant through a custom architecture may add more noise than safety.

### Ecosystem history

> Communities accumulate scar tissue.
> - React developers learn that unnecessary Effects create synchronized-state problems.
> - Python developers become wary of class hierarchies that hide simple control flow.
> - Rust developers discover that cloning values until the borrow checker becomes quiet may compile while avoiding the actual ownership question.
> - TypeScript developers learn that enough generic parameters can summon a local weather system above the type declaration.

Idioms are not arbitrary fashion. They are the ecosystem’s accumulated response to its own primitives, costs, mistakes, and discoveries.

They change over time, of course. Yesterday’s best practice may become today’s migration guide. But that does not make idioms irrelevant. It means architectural fluency includes understanding the current local terrain rather than memorizing one eternal blueprint.

## The foreign-accent phenomenon

This leads to the most interesting part.

> Good developers often write bad code when they enter an unfamiliar ecosystem. Not because they forgot how to program. Because they did not forget.

An experienced developer arrives with deeply trained instincts:

- what deserves a class
- when a function is too long
- where state belongs
- how dependencies should be injected
- what kind of duplication is dangerous
- what "separation of concerns" looks like
- which abstractions signal a serious codebase
- how many files a respectable feature ought to require

Those instincts were learned through real work. They solved real problems. They may have prevented production incidents and rescued genuinely ugly systems.

They are still local knowledge.

A developer fluent in C# may enter React and see:

- components as views
- hooks as service containers
- Effects as lifecycle methods
- Context as dependency injection
- memoization as defensive performance engineering
- routing as infrastructure to attach later

The resulting React may be technically competent and conceptually foreign.

```tsx
function useCustomerService() {
  const api = useApiClient()

  const getCustomer = useCallback(
    (id: string) => api.get(`/customers/${id}`),
    [api],
  )

  const updateCustomer = useCallback(
    (id: string, input: UpdateCustomerInput) =>
      api.put(`/customers/${id}`, input),
    [api],
  )

  return useMemo(
    () => ({
      getCustomer,
      updateCustomer,
    }),
    [getCustomer, updateCustomer],
  )
}
```

Maybe this abstraction is justified.

Maybe the application already has an established client layer, several transports, complex authentication, or meaningful substitution requirements.

But frequently it is an object-oriented service translated into hooks because hooks are the React-shaped place where non-visual things appear to go.

The code speaks React with a C# accent.

The reverse migration has its own problems.

A developer steeped in small React components may enter Python and decompose a readable orchestration flow into a cloud of tiny functions because 40 lines in one place feels irresponsible.

A Python developer may enter Rust and initially experience every explicit ownership boundary as ceremony that should be hidden.

A Rust developer may enter TypeScript and model every possible invalid state, including states the product could harmlessly tolerate and the runtime will receive from JavaScript anyway.

A React developer may turn ordinary backend operations into "hooks" in spirit, with tiny wrappers around tiny wrappers until the request path resembles a component tree nobody can render.

> None of these developers is foolish. Their expertise has a native accent.

## Why experienced developers may be more vulnerable

Beginners usually know they are learning something new.

Experienced developers are tempted to believe they are learning new syntax for concepts they already understand.

That belief is partly correct. Data structures, control flow, cohesion, testing, failure handling, and decomposition all transfer.

But the transferable layer creates confidence before the local layer has been learned.

A beginner asks:

> How do React applications normally model this?

An expert may ask:

> Where should I put my service layer in React?

The second question already contains an architectural decision smuggled in as vocabulary.

A beginner asks:

> How do Python projects organize related behavior?

An expert may ask:

> How do I implement dependency inversion and repository abstractions in Python?

Again, the question may be valid. But it may also begin three abstractions too late.

This creates a peculiar paradox:

> Beginners struggle because they lack experience. Experienced developers struggle because they bring too much of the wrong experience.

The most dangerous code is not always visibly amateurish.

It may be well named, fully tested, statically analyzed, thoroughly documented, and assembled from individually respectable patterns.

It can still be globally alien to the ecosystem.

That is why native fluency cannot be reduced to correctness.

Correct code works.

Clear code can be understood locally.

Idiomatic code uses the medium’s shared vocabulary and sense of proportion.

## The private dialect problem

An idiom is a form of compression.

When experienced React developers see a component boundary, it carries expectations about composition, state identity, rendering, and ownership in the tree.

When Rust developers see:

```rust
Result<Project, LoadProjectError>
```

they immediately understand that failure is recoverable, explicit, and part of the caller’s contract.

When Python developers see:

```python
with transaction():
    save_invoice(invoice)
```

they understand that entry, exit, and cleanup form one managed scope.

The ecosystem supplies part of the explanation.

A custom architecture often expands these compressed meanings back into private machinery.

Instead of using the query library’s cache and invalidation model, the team builds a service, store, event bus, and synchronization Effect around it.

Instead of accepting a callable, the project introduces an interface, implementation, factory, registration mechanism, and test double.

Instead of using a closed enum, the project creates a trait hierarchy with dynamic dispatch because "we may add more implementations later."

This private dialect can still be internally consistent.

But every reader must learn it.

The code becomes longer culturally, even when the line count looks disciplined.

> Good idiomatic code benefits from thousands of developers having already agreed on what common shapes mean. Custom architecture spends that cultural capital and replaces it with onboarding documentation.

Sometimes the trade is worth it.

It should still be recognized as a trade.

## Why universal architecture books feel slightly wrong

Language-independent architecture books are not the enemy.

They have to abstract away from syntax and frameworks to discuss broader forces:

- coupling
- cohesion
- boundaries
- complexity
- information hiding
- policy
- dependency direction
- change over time

That abstraction is useful.

The problem begins when a book’s preferred response to those forces starts looking universal.

A book may recommend separating business logic from presentation.

Reasonable.

But a React component often naturally combines markup, interaction behavior, accessibility, and state ownership. Extracting all "logic" into controller-like hooks can leave the component tree as an anaemic projection of an architecture designed somewhere else.

A book may recommend depending on abstractions rather than implementations.

Also reasonable.

But creating an interface for every TypeScript service or every Python class does not automatically create useful substitutability. In a structurally typed language, the caller may already describe the small capability it needs. In Python, a function, module, protocol, or callable may express the boundary more naturally.

A book may recommend small functions.

Useful again.

But a readable 40-line Python orchestration function may be easier to maintain than eight microscopic helpers that hide the business sequence across a module.

The principle is not wrong.

Its translation can be.

Architecture books often describe forces accurately, then accidentally make their preferred response look like physics.

> The map may be useful. It was still drawn in someone else’s country.

## Architecture is not above implementation

A common architectural story places "high-level design" above languages and frameworks.

The architecture contains the important decisions. Programming languages, libraries, databases, transports, and UI frameworks are implementation details underneath it.

There is truth in that distinction. We should not let a transient library decide the entire shape of a business domain.

But the distinction becomes misleading when treated as a one-way hierarchy.

Languages and frameworks shape:

- how state is represented
- how concurrency works
- how failures propagate
- what modularity costs
- how values are shared
- how behavior composes
- what the compiler can guarantee
- what the runtime makes expensive
- which abstractions readers already understand

Rust ownership affects APIs and concurrency. That is architecture.

React routing can determine whether application state is navigable, bookmarkable, and restorable. That is architecture.

Python modules can eliminate several classes used only as namespaces. That changes architecture.

TypeScript’s structural types can move interface ownership from implementation packages to callers that describe the capabilities they actually need. That is architectural pressure.

Implementation technologies are not passive containers.

> The architecture may think it owns the language, but the language has been quietly rearranging the furniture.

## SonarQube cannot save you

This distinction also explains the limits of static analysis.

SonarQube evaluates source code against language-specific rules and categorizes findings around security, reliability, and maintainability. That is valuable. Static analysis can detect real bugs, suspicious constructs, vulnerabilities, and maintainability hazards that humans routinely miss ([SonarQube rules documentation](https://docs.sonarsource.com/sonarqube/latest/user-guide/rules)).

But static analysis works best when a concern can be expressed as a reasonably local, repeatable rule.

It can ask questions such as:

- Is this value unused?
- Is this branch unreachable?
- Is this condition always true?
- Is this operation unsafe?
- Is this function excessively difficult to follow?
- Does this code match a known vulnerability pattern?
- Is a hook dependency missing?

Those questions matter.

It is much harder to ask:

- Should this React state have been derived during rendering?
- Should this filter live in the URL?
- Does this Effect exist because the component boundary is wrong?
- Is this Python class merely pretending to be a module?
- Does this TypeScript interface describe a real capability?
- Should these Rust implementations be variants of one enum?
- Is this service layer adding a boundary, or obscuring one the framework already provides?

Return to the first React component:

```tsx
useEffect(() => {
  setFilteredProducts(
    products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()),
    ),
  )
}, [products, query])
```

A tool can verify that the dependencies are present.

React’s own linter can help ensure that reactive values referenced by an Effect are declared correctly ([Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)).

But the deeper question is whether the Effect should exist.

The dependency array can be flawless while the state model is wrong.

Static analysis usually evaluates the structure we supplied. It is less capable of challenging why that structure exists in the first place.

> SonarQube can count the branches. It cannot reliably tell us that the tree should have been a route.

This is not a criticism of SonarQube failing to be an omniscient architect. No useful tool should be dismissed because it does not solve every category of software design.

It is a criticism of us when we confuse a clean report with native design.

A codebase can have:

- no critical findings
- excellent coverage
- limited duplication
- small functions
- strict linting
- immaculate formatting

And still be built in the wrong architectural language.

Metrics help us inspect a design.

They cannot certify the premise of the design.

## The AI twist: Are we teaching models our bad accents?

This question becomes more interesting now that coding agents write an increasing amount of the implementation.

Modern language models have been trained across enormous amounts of code from many ecosystems. A capable model may have encountered more idiomatic Rust, React, TypeScript, and Python than any individual developer could read in a career.

That does not make the model a better architect than the team.

It does create an unusual possibility:

> The model may know the ecosystem better than it knows our project, while we know the project better than we know the ecosystem.

The useful division of responsibility seems obvious.

We should teach the model what it cannot know:

```md
- The frontend is embedded inside a broader business application.
- The build must emit an IIFE bundle.
- Use the existing TanStack Query client.
- Python 3.13 is the production runtime.
- Run the integration tests after changing the API contract.
```

These are project facts and hard constraints.

Instead, many repositories are accumulating instructions like:

```md
- Always use Clean Architecture.
- Every service must implement an interface.
- Components must contain presentation only.
- Functions must not exceed 20 lines.
- All persistence must use repositories.
- Prefer reusable abstractions.
- Apply SOLID principles everywhere.
```

These are not facts.

They are architectural preferences, often inherited from another language, transformed into standing orders.

The model may begin with broad ecosystem knowledge. We then narrow it into our private dialect.

Are we accidentally teaching the model our foreign accent?

This is not an argument for giving agents no guidance and hoping they commune directly with the open-source zeitgeist.

Agents need local context. They need security constraints, domain vocabulary, canonical commands, compatibility requirements, intentional deviations, and concrete verification steps.

But context is finite, and more instruction is not automatically more control.

Current OpenAI guidance recommends leaner prompts and reports that removing repeated instructions and simplifying coding-agent configurations improved scores by roughly 10 to 15 percent in a sample of internal evaluations, while also reducing token use. OpenAI explicitly describes those figures as directional and recommends validating changes against representative tasks ([OpenAI guidance on newer models and leaner prompting](https://developers.openai.com/api/docs/guides/latest-model)).

Anthropic similarly describes context as a finite attention budget and recommends finding the smallest set of high-signal tokens that fully describes the desired behavior. It warns against both brittle, over-specified logic and vague guidance that assumes context the model does not have ([Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

A recent 2026 benchmark offers another warning. In agentic tasks governed by handbooks ranging from 20 to 124 pages, the best evaluated configuration passed only 36.2 percent of trials under strict grading. That benchmark is not specifically a study of idiomatic code generation, so it does not prove that long `AGENTS.md` files produce worse architecture. It does show that placing a large instruction bureaucracy in context does not mean an agent will apply it perfectly over a long task ([HANDBOOK.md benchmark](https://arxiv.org/abs/2607.25398)).

The irony is fairly efficient:

> We complain that coding agents generate unnecessary abstractions, then surround them with an enterprise architecture department made entirely of Markdown.

The full implications deserve their own chapter later in this series.

For now, it is enough to notice that architectural accents no longer spread only through code review, onboarding, and copied implementations.

They can be encoded once and reproduced automatically.

The old bias has acquired a robot arm.

## Idioms are defaults, not commandments

There is an obvious trap on the other side of this argument.

"Write idiomatic code" can become another universal commandment.

> Idioms can turn into fashion, tribal signalling, or cargo cult just as easily as design patterns.

A React component can genuinely need memoization.

A Python application can genuinely benefit from explicit interfaces and dependency injection.

A TypeScript class can be the clearest representation of identity, mutable state, or lifecycle.

A Rust application can need dynamic dispatch and shared ownership.

A layered architecture can be the correct choice.

An enterprise pattern may carry every gram of its weight and save the team from very real complexity.

The goal is not to ban imported structures.

The goal is to make them pass customs.

When we introduce a pattern that cuts against the local grain, we should know why:

- What problem does it solve here?
- What local primitive was insufficient?
- Which future change does the abstraction make cheaper?
- What complexity does it remove?
- What complexity does it add?
- Will developers fluent in this ecosystem recognize the boundary?
- Is the project intentionally deviating from convention?
- Is that decision documented as a local constraint rather than presented as universal truth?

Idioms are starting points.

Architecture still requires judgment.

The difference is that judgment begins by understanding the medium rather than declaring independence from it.

## Toward idiomatic architecture

Great engineers are sometimes described as people who can work in any language.

That is true in one sense.

They carry transferable reasoning:

- how to break down problems
- how to model change
- how to test assumptions
- how to control risk
- how to debug systems
- how to read unfamiliar code
- how to recognize coupling and hidden state

But fluency is local.

Entering a new ecosystem means reacquiring its sense of proportion:

- what deserves a name
- what deserves a file
- how much indirection is normal
- what kind of repetition is harmless
- where mutation belongs
- how failure is represented
- what the runtime makes cheap
- what the community already knows how to read
- which abstractions the framework supplies before we write any code

The best developers do not impose the same architecture everywhere.

They translate durable principles into the local vocabulary.

That is what the rest of this series will explore.

React thinks in component trees, state ownership, routes, and composition.

TypeScript combines JavaScript’s lightweight runtime model with structural types, unions, and control-flow analysis.

Python often values readable orchestration, modules, protocols, and direct execution.

Rust moves ownership, failure, and possible states into the type system, asking the compiler to participate in the design.

Later, we will return to the foreign-accent problem directly, examine why quality tools cannot measure everything we mean by "good code" and ask whether our increasingly elaborate coding-agent instructions are preserving valuable project knowledge or mass-producing architectural baggage.

The central claim is simple:

> Software architecture has two layers.

The principles may travel.

Their implementations do not.

### Sources and further reading

- React: [Thinking in React](https://react.dev/learn/thinking-in-react) and [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects).
- TypeScript: [TypeScript for Java/C# Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html#co-learning-javascript).
- Python: [PEP 8: Style Guide for Python Code](https://peps.python.org/pep-0008/).
- Rust: [ownership](https://doc.rust-lang.org/book/?search=ownership), [Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html), and the [`Result` enum](https://doc.rust-lang.org/stable/core/result/enum.Result.html).
- SonarQube: [rules documentation](https://docs.sonarsource.com/sonarqube/latest/user-guide/rules).
- OpenAI: [guidance on newer models and leaner prompting](https://developers.openai.com/api/docs/guides/latest-model).
- Anthropic: [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
- [HANDBOOK.md: A Benchmark for Long-Context Agentic Instruction Following](https://arxiv.org/abs/2607.25398).
