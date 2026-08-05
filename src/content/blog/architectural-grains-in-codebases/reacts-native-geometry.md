---
title: React's Native Geometry
description: React thinks in trees, not layers.
pubDate: 2026-08-16
series:
  title: Architectural Grains in Codebases
  order: 2
---

## Premise

Consider this component:

```tsx
<ProjectPanel
  title={project.name}
  description={project.description}
  owner={project.owner}
  status={project.status}
  actions={actions}
  permissions={permissions}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  comments={comments}
  commentsLoading={commentsLoading}
  onAddComment={addComment}
  activity={activity}
  activityLoading={activityLoading}
  isEditing={isEditing}
  onEdit={startEditing}
  onCancelEdit={cancelEditing}
  onSave={saveProject}
  sidebarOpen={sidebarOpen}
  onSidebarToggle={toggleSidebar}
  error={error}
/>
```

There is nothing technically invalid about it.

The props are explicit. TypeScript can describe them precisely. The component might be tested, memoized, documented, and approved by SonarQube with the enthusiasm of a bureaucrat stamping a perfectly formatted request.

But step back and squint.

Is this really one component?

Or is it four components in a trench coat?

The prop list already hints at several separate ideas:

```text
title, description, owner, status
actions, permissions
activeTab, onTabChange
comments, commentsLoading, onAddComment
activity, activityLoading
isEditing, onEdit, onCancelEdit, onSave
sidebarOpen, onSidebarToggle
```

Those are not merely twenty configuration options. They are clusters of responsibility.

The component might be hiding a structure closer to this:

```tsx
<ProjectWorkspace>
  <ProjectHeader>
    <ProjectIdentity />
    <ProjectActions />
  </ProjectHeader>

  <ProjectNavigation />

  <ProjectContent>
    <ProjectActivity />
    <ProjectComments />
  </ProjectContent>

  <ProjectSidebar />
</ProjectWorkspace>
```

The first version compresses a tree into a flat API.

The second admits that the tree was there all along.

This is the native geometry of React.

React architecture is not primarily about arranging controllers, services, repositories, and views into horizontal layers. It is about discovering the components already hiding inside an interface, then composing them into a tree that reflects their relationships.

The central architectural question is therefore not:

> Which layer should contain this logic?

It is:

> What are the meaningful parts of this interface, how do they contain one another, and which responsibilities belong to each part?

That shift sounds modest. In practice, it changes almost everything.

In the first article of this series, we started debunking ["the false promise of universal architecture"](../the-false-promise-of-universal-architecture). Now, we will explore how React's architecture is shaped by the literal physical position of elements on the screen and how their composition affects behavior.


## React does not merely render a tree

Many descriptions of React begin with something like:

> React is a library for building user interfaces from components.

True, but almost too harmless to be useful.

It makes components sound like reusable HTML templates, little boxes of markup that can be placed on a page after the real architecture has already happened elsewhere.

A more revealing description would be:

> React lets us model an interface as a changing tree of independently meaningful regions.

The tree is not an incidental output format.

It influences:

- which state belongs to which part of the interface
- how long that state survives
- which descendants can access a context
- where loading and error boundaries apply
- which regions may render independently
- which pieces can be replaced or rearranged
- how data and behavior flow through the interface
- how the URL maps onto the visible application

The React documentation begins its own design process by asking developers to break a UI into a component hierarchy, identify the minimal state, and decide where that state belongs in the hierarchy. The hierarchy is not a cleanup step performed after the application has been designed. It is part of the design itself ([Thinking in React](https://react.dev/learn/thinking-in-react)).

Traditional layered architecture is often drawn like this:

```text
UI
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

React’s native architecture often looks more like this:

```text
Application
└── Project route
    ├── Project layout
    │   ├── Project header
    │   │   ├── Project identity
    │   │   └── Project actions
    │   ├── Project navigation
    │   └── Current project section
    │       ├── Activity
    │       ├── Comments
    │       └── Settings
    └── Loading and error boundaries
```

The first diagram organizes code by the kind of technical work it performs.

The second organizes the application by containment, ownership, and the shape of the user experience.

React applications may still contain API clients, domain functions, persistence adapters, and other horizontal concerns. The point is not that layers cease to exist.

The point is that the UI has an architectural dimension of its own.

It should not be forced to impersonate a backend.

## Composition is React’s fundamental operation

We often say that React favors composition over inheritance.

That phrase is correct, but years of repetition have polished it into office wallpaper. It is visible everywhere and examined almost nowhere.

Composition in React is not merely a technique for reusing code without creating a class hierarchy.

It is how we describe the structure of the application.

Consider:

```tsx
<ProjectLayout>
  <ProjectNavigation />

  <ProjectContent>
    <Outlet />
  </ProjectContent>
</ProjectLayout>
```

This code does more than reuse `ProjectLayout`.

It says:

- the navigation belongs inside the project experience
- the active route belongs inside the project content region
- the layout surrounds both
- the nested page may change while the project shell remains
- the project shell and its children form one visible scope

Containment is information.

The JSX tree tells us not just which components exist, but how they relate.

This is why React’s compositional tools are so varied:

- ordinary component nesting
- `children`
- named slots
- compound components
- layout components
- providers
- Suspense boundaries
- error boundaries
- nested routes
- render props
- conditional subtrees

These are not all interchangeable patterns, but they share a premise:

> Meaning can be expressed through where something appears inside a tree.

In React, wrapping is an architectural act.

A provider wrapped around a subtree changes what that subtree can access. An error boundary changes how failures inside that subtree are handled. A layout establishes persistent structure around changing children. A route boundary connects navigation to a visible region.

The outside surrounds the inside, both visually and behaviorally.

## Components are not only for reuse

A common rule for extracting components sounds suspiciously similar to the traditional rule for extracting helper functions:

> Wait until something is repeated.

This treats components primarily as a mechanism for eliminating duplication.

Reuse is certainly one reason to create a component. It is not the only one.

A component may deserve to exist because it establishes:

- a meaningful product concept
- a recognizable visual region
- a local state owner
- a separate data requirement
- an independent loading state
- an independent failure boundary
- a different rate of change
- a useful name in the parent’s outline
- a future route or extension point

`ProjectPermissions` may appear exactly once in the application.

It can still be a valuable component.

Its purpose may not be reuse. Its purpose may be recognition.

We recognize that permissions form a coherent part of the project experience, so we give them a place in the tree.

```tsx
function ProjectSettingsRoute() {
  return (
    <ProjectSettings>
      <ProjectDetailsForm />
      <ProjectPermissions />
      <ProjectDangerZone />
    </ProjectSettings>
  )
}
```

The parent now reads like an outline of the page.

That outline is useful even if every child appears only once.

Compare it with:

```tsx
function ProjectSettingsRoute() {
  const project = useProject()
  const permissions = useProjectPermissions()
  const form = useProjectDetailsForm(project)
  const dangerZone = useProjectDeletion(project)

  return (
    <div>
      <section>
        {/* 80 lines of form markup */}
      </section>

      <section>
        {/* 60 lines of permissions markup */}
      </section>

      <section>
        {/* 50 lines of deletion markup */}
      </section>
    </div>
  )
}
```

The second version may remain understandable. There is no law requiring every `<section>` to receive a passport and its own file.

But the first version makes the product structure explicit.

That is a genuine architectural benefit.

> Reuse is one reason to create a component. Recognition is another.

## Prop explosion is often flattened composition

Props are how React components communicate.

There is nothing inherently wrong with having many of them. Some components legitimately describe complex, highly configurable primitives:

- data grids
- charts
- editors
- generated form controls
- headless UI primitives
- integration components around external libraries

Counting props and declaring anything above seven illegal would merely replace one architectural dogma with another, now with better TypeScript support.

The more useful question is whether the props belong to one coherent vocabulary.

Consider:

```tsx
<UserCard
  name={user.name}
  avatarUrl={user.avatarUrl}
  subtitle={user.role}
  selected={selected}
  onSelect={onSelect}
/>
```

These props describe one concept: an interactive user card.

Now consider:

```tsx
<ProjectWorkspace
  project={project}
  comments={comments}
  commentDraft={commentDraft}
  onCommentDraftChange={setCommentDraft}
  onSubmitComment={submitComment}
  activity={activity}
  activityFilter={activityFilter}
  onActivityFilterChange={setActivityFilter}
  sidebarOpen={sidebarOpen}
  onSidebarOpenChange={setSidebarOpen}
  editingProject={editingProject}
  onEditingProjectChange={setEditingProject}
/>
```

This API describes several separate neighborhoods that happen to share one postal code.

The prop surface is telling us that the component owns:

- comments
- activity filtering
- sidebar interaction
- project editing
- project display

That may be correct. More often, it means several naturally independent subtrees have been flattened into one coordinator.

The hidden structure might be:

```tsx
<ProjectWorkspace>
  <ProjectEditor />
  <ProjectActivity />
  <ProjectComments />
  <ProjectSidebar />
</ProjectWorkspace>
```

The important distinction is not between “few props” and “many props.”

It is between:

- a component configured through a coherent API
- several components compressed into a single interface

Prop clusters are often embryonic components.

## Props communicate, composition structures

Suppose we are designing a reusable dialog.

A flat API might look like this:

```tsx
<Dialog
  title="Delete project"
  description="This action cannot be undone."
  content={<ProjectDeletionConsequences project={project} />}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  confirmVariant="destructive"
  onConfirm={deleteProject}
  onCancel={close}
/>
```

For a constrained confirmation dialog, this can be an excellent API.

It is concise, consistent, and difficult to misuse.

But as variation grows, the component often accumulates more ways to describe nested content:

```tsx
<Dialog
  title={title}
  titleIcon={icon}
  titleActions={actions}
  description={description}
  content={content}
  footerLeading={footerLeading}
  footerTrailing={footerTrailing}
  customCloseButton={closeButton}
  renderError={renderError}
/>
```

The API begins encoding a tree through a collection of named holes.

At some point, the natural interface may be compositional:

```tsx
<Dialog>
  <Dialog.Header>
    <Dialog.Title>Delete project</Dialog.Title>
    <Dialog.Description>
      This action cannot be undone.
    </Dialog.Description>
  </Dialog.Header>

  <Dialog.Body>
    <ProjectDeletionConsequences project={project} />
  </Dialog.Body>

  <Dialog.Footer>
    <Button variant="ghost" onClick={close}>
      Cancel
    </Button>

    <Button variant="destructive" onClick={deleteProject}>
      Delete
    </Button>
  </Dialog.Footer>
</Dialog>
```

The composed API preserves the hierarchy of the interface.

It does not describe the header, body, and footer as values passed into one central machine. It allows them to exist as parts of a visible structure.

Neither API is universally superior.

The flat API is often better when the variations are deliberately narrow. The composed API becomes valuable when consumers need meaningful structural freedom.

The architectural rule is not:

> Use compound components.

It is:

> When the interface is genuinely hierarchical, be cautious about flattening that hierarchy into configuration.

A tidy prop object can hide a false boundary just as effectively as a badly named class.

## Component extraction is not ordinary function extraction

Suppose a component has become difficult to read, so we extract some rendering helpers:

```tsx
function ProjectPage() {
  return (
    <div>
      {renderHeader()}
      {renderNavigation()}
      {renderActivity()}
      {renderComments()}
    </div>
  )
}
```

This may improve readability.

But structurally, very little has changed.

Those helpers do not create new positions in the React tree. They cannot independently own React state. They do not create Context scopes. They cannot become Suspense or error boundaries. React does not see them as separate components with separate identities.

Now compare:

```tsx
function ProjectPage() {
  return (
    <ProjectLayout>
      <ProjectHeader />
      <ProjectNavigation />
      <ProjectActivity />
      <ProjectComments />
    </ProjectLayout>
  )
}
```

These are actual nodes in React’s model.

A component extraction can therefore mean more than:

> Move some JSX into another function.

It can mean:

> Recognize a region with its own identity, responsibility, data needs, and lifetime.

That is a deeper decomposition.

It also explains why React component size cannot be judged by line count alone.

A 250-line component can represent one coherent, intricate widget.

A 40-line component can already contain three unrelated state machines glued together by proximity.

Line count may alert us to complexity, but it cannot tell us where the component boundaries are.

The useful signals are semantic:

- Does the component contain several recognizable visual regions?
- Do those regions have separate data needs?
- Do they maintain unrelated state?
- Could one load or fail independently from another?
- Do they change for different product reasons?
- Is the parent coordinating details that could be owned below?
- Do the props divide into several distinct vocabularies?

When visual containment, state ownership, data needs, and rate of change point toward the same seam, a component is usually trying to emerge.

## In React, position is behavior

The tree is not merely a nice way to organize source code.

Its geometry has runtime consequences.

React associates component state with a component’s position in the rendered tree. Keeping a component at the same position preserves its state. Replacing it, removing it, changing its type, or changing its key can reset that state ([Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)).

Consider a project editor:

```tsx
<ProjectEditor project={selectedProject} />
```

If the selected project changes while `ProjectEditor` remains at the same position, its local state may remain alive.

That may be desirable. It may also preserve a draft belonging to the previously selected project.

We can express a different identity:

```tsx
<ProjectEditor
  key={selectedProject.id}
  project={selectedProject}
/>
```

Now the editor subtree is recreated when the project changes.

The key is not merely an optimization for list reconciliation. It participates in identity.

Similarly, moving stateful content across conditional branches can affect whether React considers it the same component:

```tsx
{showPreview ? (
  <ProjectEditor mode="preview" />
) : (
  <ProjectEditor mode="edit" />
)}
```

The exact tree position, component type, and key contribute to whether state survives.

This gives React an unusual architectural property:

> Location is behavior.

Moving a C# class from one namespace to another usually does not change its runtime identity.

Moving, wrapping, replacing, or keying a React component may change the behavior of the application.

React architecture is therefore spatial in a very literal sense.

## Composition lets responsibility sink

A large React page often begins as an air traffic controller:

```tsx
function ProjectPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [activityFilter, setActivityFilter] = useState('all')
  const [editing, setEditing] = useState(false)

  const project = useProject()
  const comments = useComments(project.id)
  const activity = useActivity(project.id)

  function submitComment() {
    // ...
  }

  function saveProject() {
    // ...
  }

  return (
    <ProjectWorkspace
      project={project}
      comments={comments}
      commentDraft={commentDraft}
      onCommentDraftChange={setCommentDraft}
      onSubmitComment={submitComment}
      activity={activity}
      activityFilter={activityFilter}
      onActivityFilterChange={setActivityFilter}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      editing={editing}
      onEditingChange={setEditing}
      onSaveProject={saveProject}
    />
  )
}
```

The component knows every fact and coordinates every interaction.

This often feels safe because ownership appears centralized and explicit.

It is also how one component becomes the meeting room through which every decision must pass.

Composition allows responsibility to move toward the part of the tree that actually needs it:

```tsx
function ProjectPage() {
  return (
    <ProjectWorkspace>
      <ProjectHeader />
      <ProjectNavigation />

      <ProjectContent>
        <ProjectActivity />
        <ProjectComments />
      </ProjectContent>

      <ProjectSidebar />
    </ProjectWorkspace>
  )
}
```

Now:

- `ProjectSidebar` can own whether it is expanded
- `ProjectComments` can own its draft
- `ProjectActivity` can own its filter
- `ProjectEditor` can own its editing state
- each region can request the data it needs
- each region can define its own loading and error behavior

The parent becomes an outline instead of an operator console.

This does not mean that state should always move downward.

Two siblings may genuinely need shared state. A parent may coordinate a workflow spanning several children. Some interactions are domain-level interactions, not isolated widget details.

But React’s native instinct is to ask:

> What is the smallest meaningful owner of this responsibility?

Composition gives us places where responsibility can live.

Without those places, everything drifts upward.

## Every piece of state needs an address

Frontend discussions often begin with:

> Which state-management library should we use?

React-native design begins one step earlier:

> What kind of state is this, and who owns it?

A useful React application usually contains several different categories of changing information.

Treating all of them as “application state” and pouring them into one store removes important architectural distinctions.

### Local interaction state

Some state belongs to a specific part of the interface:

```tsx
function ProjectSidebar() {
  const [expanded, setExpanded] = useState(false)

  // ...
}
```

Examples include:

- an expanded panel
- an unfinished input
- an open menu
- the current step inside a local wizard
- temporary drag state
- a selected item meaningful only inside one widget

This state often belongs near the component that gives it meaning.

Moving it into a global store does not necessarily make it more architectural. It may simply give a local detail a longer commute.

### URL state

Some state belongs to navigation:

```text
/projects/42/activity?status=failed&page=3
```

Examples include:

- active page or section
- filters
- search terms
- pagination
- selected entities
- sort order
- view modes that should be linkable or restorable

If the user expects the browser’s Back button to understand a state change, the URL is a serious candidate for ownership.

A surprising amount of frontend code reimplements navigation through local booleans:

```tsx
const [showActivity, setShowActivity] = useState(false)
const [showSettings, setShowSettings] = useState(false)
const [selectedTab, setSelectedTab] = useState('overview')
```

Soon the component is maintaining a small, partially functional router behind the router.

### Server state

Remote data has different properties from local UI state.

It may be:

- stale
- shared by several components
- invalidated after mutations
- refetched in the background
- unavailable
- cached
- concurrently observed
- owned by another system

A server-state library such as TanStack Query explicitly treats this as a separate problem from synchronous client state. Its cache coordinates fetching, freshness, observers, invalidation, retries, and related asynchronous behavior ([Does TanStack Query replace client state?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state)).

Copying fetched data into a general-purpose store often means taking responsibility for all those behaviors manually.

The code acquires reducers, actions, synchronization Effects, loading flags, stale copies, and an increasingly ceremonial relationship with reality.

### External-system state

Some values are owned outside React entirely:

- a WebSocket connection
- a media player
- a browser API
- a map instance
- a third-party editor
- an analytics integration

React may need to synchronize with those systems, but it should not pretend to own them.

This is where Effects naturally appear. React’s documentation describes Effects as the mechanism for synchronizing a component with systems outside React, rather than as a general-purpose reaction engine for coordinating internal state ([Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)).

A useful map therefore looks something like this:

```text
URL
 │
Route tree
 │
Component tree ───── Server-state cache
 │
Effects
 │
External systems
```

The component tree sits in the middle, but it does not absorb every responsibility around it.

Good React architecture gives each kind of state an address.

Bad React architecture often creates one large building called `store` and forwards all mail there.

## Routing is composition extended into navigation

Routing is frequently described as infrastructure.

Install a router. Define some paths. Add a navigation bar. Plumbing complete.

But nested routing is deeply aligned with React’s compositional model.

A route tree might describe:

```text
/projects/:projectId
├── overview
├── activity
└── settings
```

The visible tree may then become:

```tsx
function ProjectLayout() {
  return (
    <ProjectWorkspace>
      <ProjectHeader />
      <ProjectNavigation />

      <ProjectContent>
        <Outlet />
      </ProjectContent>
    </ProjectWorkspace>
  )
}
```

The project shell remains while the nested child route changes.

The URL hierarchy and component hierarchy reinforce each other.

React Router’s nested routes, for example, render child routes through an `Outlet` inside the parent route, allowing route structure to become UI structure ([React Router: Routing](https://reactrouter.com/start/framework/routing)).

This is not merely a convenient API.

The router now understands:

- which section is active
- how browser history should behave
- which states can be bookmarked
- which layout surrounds the section
- which subtree can load independently
- which branch can be code-split
- which URL corresponds to the visible interface

Contrast that with:

```tsx
function ProjectPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      <ProjectTabs
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && <ProjectOverview />}
      {activeTab === 'activity' && <ProjectActivity />}
      {activeTab === 'settings' && <ProjectSettings />}
    </>
  )
}
```

This may be completely appropriate for a small, ephemeral tab control.

But when those tabs represent real application locations, local state flattens navigation into a widget detail.

The architecture loses URLs, history, deep links, route-level loading, and persistent layouts, then gradually rebuilds pieces of them by hand.

Routing is not separate from composition.

It is composition with addresses.

## Context is scoped ancestry, not a global drawer

Context is commonly introduced as the solution to prop drilling.

That description is practical, but incomplete.

Context means that a value is available to descendants inside a particular subtree. React’s own documentation describes it in those terms: a parent provides information to the tree below it, and nested providers may override the surrounding value ([Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)).

This makes Context an ancestry-based scoping mechanism.

```tsx
<ProjectProvider projectId={projectId}>
  <ProjectWorkspace />
</ProjectProvider>
```

The provider says:

> Everything below this point participates in the current project scope.

That can be an elegant expression of structure.

Examples of meaningful scopes include:

- current project
- current form
- authenticated account
- locale
- theme
- feature-level coordination
- a compound component’s shared state

The problem begins when Context is treated as dependency injection for the entire frontend:

```tsx
<AppProviders>
  <Everything />
</AppProviders>
```

Inside `AppProviders` live:

- API clients
- modal services
- notification services
- repositories
- feature stores
- analytics
- permissions
- mutable application state
- several values nobody remembers adding

Context stops expressing meaningful ancestry.

It becomes a global drawer whose handle happens to be `useContext`.

The React documentation itself suggests considering ordinary props and component composition before reaching for Context, including passing JSX through `children` to avoid intermediary components that exist only to forward data ([Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)).

The useful question is not:

> Can this value go into Context?

Almost anything can.

The better question is:

> Does this value describe a real scope in the rendered application?

A provider should usually correspond to a boundary we can explain.

## Hooks compose behavior, components compose structure

Custom Hooks are one of React’s strongest compositional tools.

They allow a component to reuse stateful, reactive behavior:

```tsx
function useProjectPresence(projectId: string) {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    const connection = connectToProjectPresence(projectId)

    connection.onMembersChanged(setMembers)

    return () => connection.disconnect()
  }, [projectId])

  return members
}
```

A component can then declare what it participates in:

```tsx
function ProjectPresence({ projectId }: Props) {
  const members = useProjectPresence(projectId)

  return <AvatarGroup members={members} />
}
```

This is excellent composition.

But extracting a custom Hook does not create a new component boundary.

Consider:

```tsx
function ProjectPage() {
  const controller = useProjectPageController()

  return <ProjectPageView {...controller} />
}
```

The calling component may now contain only two lines.

Yet `useProjectPageController` may still own:

- several unrelated state variables
- all project data fetching
- comment submission
- activity filtering
- navigation
- permissions
- notifications
- form state
- synchronization Effects

The responsibility has become less visible, but it has not been redistributed.

All Hook state still belongs to the component that calls the Hook. Each call gets its own independent state and Effects. React describes custom Hooks as a way to share stateful logic, not the state itself ([Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)).

That gives us a useful distinction:

| Tool | What it primarily composes |
|---|---|
| Plain function | Calculation or transformation |
| Custom Hook | Reactive, stateful behavior |
| Component | UI structure, identity, and ownership |

These categories overlap in practice, but they answer different problems.

A plain helper can simplify a calculation.

A custom Hook can give a name to a reactive capability.

A component creates a node in the interface.

This is why a Hook can hide responsibility without creating a boundary.

Sometimes that is exactly what we want. The component owns the responsibility, but should not expose its mechanics.

Other times the Hook is a very elegant rug under which an entire missing component tree has been swept.

## Effects belong at the edges

Effects are not merely an API that React developers tend to misuse.

They reveal where React touches systems that do not follow React’s declarative model.

```tsx
function ProjectPresence({ projectId }: Props) {
  useEffect(() => {
    const connection = connectToPresence(projectId)
    connection.connect()

    return () => connection.disconnect()
  }, [projectId])

  return <PresenceIndicator />
}
```

The connection is external.

React renders the presence region, then synchronizes that region with another system.

This is a clean border.

Trouble begins when Effects patrol the inside of the application:

```tsx
useEffect(() => {
  setFilteredProjects(
    projects.filter(project => project.status === selectedStatus),
  )
}, [projects, selectedStatus])

useEffect(() => {
  if (selectedProject) {
    setProjectForm(toProjectForm(selectedProject))
  }
}, [selectedProject])

useEffect(() => {
  if (activeTab === 'settings') {
    setSidebarOpen(false)
  }
}, [activeTab])
```

These Effects coordinate values already owned by React.

They often indicate:

- duplicated state
- derived values stored unnecessarily
- navigation represented as local state
- responsibilities owned too high in the tree
- several components fused into one controller
- an event that should be handled where it happens
- a missing reset boundary

A codebase full of coordination Effects may not have an Effect problem.

It may have a geometry problem.

The components and state are in the wrong places, so Effects become invisible cables stretched between them.

A useful rule is:

> An Effect should usually cross a border, not patrol the interior.

## What idiomatic React looks like from across the room

Return to the original experiment.

Step back from the code. Blur the syntax. Ignore whether the project uses semicolons.

What silhouette does healthy React tend to produce?

Often, we see:

- parent components that read like outlines
- nested structures that resemble the visible interface
- state colocated with its smallest meaningful owner
- route boundaries matching application locations
- server data requested near the regions that consume it
- Context providers around explainable scopes
- custom Hooks named after concrete reactive capabilities
- relatively few Effects coordinating internal values
- props that belong to coherent vocabularies
- related components colocated by feature
- component sizes emerging from responsibility rather than quotas

A feature might look like:

```text
features/
  projects/
    project-route.tsx
    project-layout.tsx
    project-header.tsx
    project-navigation.tsx
    project-activity.tsx
    project-comments.tsx
    project-query.ts
```

Not because every project must worship feature folders.

The important information is that the project experience remains recognizable in the source tree.

Contrast this with:

```text
components/
controllers/
hooks/
interfaces/
services/
state/
utils/
```

This structure groups files by technical noun.

To understand one feature, we must visit every district in the city.

The first organization says:

> These pieces change together because they form the project experience.

The second says:

> These pieces share the same grammatical category.

Either structure can work. But React’s compositional grain usually rewards colocation around the tree we are building.

## When other developers write React

Every experienced developer brings instincts from previous technologies.

Those instincts are not mistakes. They often represent years of lessons learned in an environment where they work extremely well.

The problem appears when the physical pattern crosses the border unchanged.

The principle may travel.

Its React implementation may need a new body.

### The C# or Java developer: flatten the tree into layers

A backend-oriented developer may recognize a familiar sequence:

```text
View
 ↓
Controller
 ↓
Service
 ↓
Repository
```

The React version becomes:

```tsx
function ProjectPage() {
  const controller = useProjectPageController()

  return <ProjectPageView {...controller} />
}
```

Elsewhere:

```tsx
function useProjectPageController() {
  const projectService = useProjectService()
  const commentService = useCommentService()
  const activityService = useActivityService()

  // state, orchestration, callbacks, mapping

  return {
    // one large view model
  }
}
```

The separation looks disciplined.

The view renders. The controller coordinates. Services perform operations.

But the component tree has been reduced to an output format.

`ProjectPageView` often becomes one large passive component with a huge prop surface, while the controller knows everything about every region.

This is a legitimate backend instinct applied to a medium where containment, state ownership, and visible composition matter.

The principle worth preserving is separation of responsibility.

The imported shape is the controller hierarchy.

The React translation may instead be:

```tsx
function ProjectPage() {
  return (
    <ProjectLayout>
      <ProjectHeader />
      <ProjectActivity />
      <ProjectComments />
    </ProjectLayout>
  )
}
```

Each subtree owns more of its own behavior.

The architecture is not less separated. It is separated along React’s native seams.

### The Python developer: keep the story in one place

Python often rewards readable, top-to-bottom orchestration.

A well-written function can tell the story of a business operation directly:

```python
invoice = await load_invoice(invoice_id)
validate_invoice(invoice)
calculate_totals(invoice)
document = await generate_document(invoice)
await send_document(document)
```

Transport that instinct directly into React and we may get:

```tsx
function ProjectPage() {
  // load project
  // determine permissions
  // manage editing
  // load activity
  // filter activity
  // load comments
  // manage comment draft
  // submit comments
  // render the page
}
```

The component may be surprisingly readable.

Everything happens in one narrative location.

But React is not only describing a sequence of operations. It is describing several regions that remain alive, update independently, and own different interactions.

The Python instinct says:

> Keep the workflow visible.

React asks:

> Are these actually parts of one workflow, or separate nodes that happen to appear on the same page?

The principle worth preserving is narrative clarity.

The React translation is often a parent that reads like an outline, with each child telling its own smaller story.

### The Rust developer: model every state before discovering every owner

Rust encourages developers to make possible states explicit.

That instinct can produce excellent TypeScript:

```tsx
type ProjectPageState =
  | { type: 'loading' }
  | { type: 'loaded'; project: Project }
  | { type: 'editing'; project: Project; draft: ProjectDraft }
  | { type: 'saving'; project: Project; draft: ProjectDraft }
  | { type: 'failed'; error: Error }
```

Sometimes this is exactly the right model.

But a React page may contain several independent state machines:

- project loading
- editor state
- comment submission
- activity filtering
- sidebar visibility
- live presence

Compressing them into one exhaustive page state can create combinations the type must now enumerate or forbid.

The page becomes a single machine because the type was designed before the component ownership was discovered.

The Rust instinct says:

> Make every state honest.

React adds another question:

> Are these states of the same thing?

Before building one perfect state machine, determine whether composition should divide it into several smaller owners.

The principle worth preserving is explicit state modelling.

The React translation is often several honest local machines rather than one sovereign machine governing the entire page.

### The TypeScript architect: design the API instead of composing the interface

TypeScript makes it deeply satisfying to describe flexible abstractions:

```tsx
type WorkspaceProps<
  THeader,
  TContent,
  TSidebar,
  TAction,
  TError,
> = {
  header: THeader
  content: TContent
  sidebar?: TSidebar
  actions: readonly TAction[]
  renderAction(action: TAction): ReactNode
  renderError?(error: TError): ReactNode
}
```

The types may be precise.

The generic relationships may be legitimate.

The API may autocomplete like a small miracle.

And yet the abstraction can still be wrong.

The interface may naturally want:

```tsx
<Workspace>
  <Workspace.Header />
  <Workspace.Content />
  <Workspace.Sidebar />
</Workspace>
```

The TypeScript developer has modelled all legal configurations of the flat API without questioning whether the API should be flat.

This is type-safe architecture around a false boundary.

The principle worth preserving is precision.

The React translation is to let the component tree represent hierarchy, then use TypeScript to make the relationships inside that tree safe.

Type precision cannot rescue a component model that contradicts the interface it describes.

### The React developer: wrappers all the way down

Foreign accents are easy to notice because they arrive wearing unfamiliar clothes.

React developers can overlearn React’s own idioms just as effectively.

Every three lines become a custom Hook.

Every visual fragment becomes a component.

Every shared value becomes Context.

Every layout becomes a provider.

Every primitive becomes a compound component.

Every callback becomes `useCallback`.

Every object becomes `useMemo`.

Every component is wrapped by six other components whose names end in `Provider`, `Boundary`, `Gate`, or `Container`.

The resulting JSX looks architecturally impressive:

```tsx
<ProjectBoundary>
  <ProjectProvider>
    <ProjectPermissionGate>
      <ProjectThemeScope>
        <ProjectLayoutProvider>
          <ProjectWorkspaceContainer>
            <ProjectWorkspace />
          </ProjectWorkspaceContainer>
        </ProjectLayoutProvider>
      </ProjectThemeScope>
    </ProjectPermissionGate>
  </ProjectProvider>
</ProjectBoundary>
```

Some of those boundaries may be justified.

Together, they may also be React performing an elaborate impersonation of onion architecture.

Composition is not automatically good merely because the code nests.

A component boundary should reveal something meaningful.

A provider should establish a real scope.

A Hook should name a coherent behavior.

A wrapper that cannot explain its existence is still indirection, even when written in JSX.

React can become a parody of React.

## Translate the principle, not the shape

Each foreign accent begins with a useful idea:

| Imported instinct | Native strength | React failure mode |
|---|---|---|
| Layered separation | C# and Java | The UI tree is hidden behind controllers |
| Narrative orchestration | Python | Independent regions remain fused |
| Exhaustive state modelling | Rust | Unrelated state becomes one global machine |
| Abstract type modelling | TypeScript | The API becomes more elaborate than the UI |
| Composition everywhere | React | Meaningless wrappers fragment local cohesion |

The lesson is not that developers should forget what they learned elsewhere.

It is that architectural principles must be translated.

“Separate responsibilities” survives the journey.

A controller and service hierarchy may not.

“Make state explicit” survives.

One page-wide discriminated union may not.

“Keep the workflow readable” survives.

One component containing the entire workflow may not.

“Design a precise API” survives.

A generic configuration object may not.

A virtue can become a defect when moved into a medium with different geometry.

## When not to split

Once we recognize composition as React’s native strength, it becomes tempting to carve every component into smaller components until the application resembles a bowl of alphabet cereal.

That is not the goal.

This:

```tsx
function ProjectTitle({ children }: PropsWithChildren) {
  return <h1>{children}</h1>
}
```

may be useful as part of a design system.

Inside one local feature, it may merely rename an element and send the reader on a file-system excursion.

Similarly:

```tsx
function ProjectHeader() {
  return (
    <HeaderContainer>
      <HeaderInner>
        <HeaderContent>
          <HeaderTitle />
        </HeaderContent>
      </HeaderInner>
    </HeaderContainer>
  )
}
```

is technically composed.

It is not necessarily more meaningful.

Do not split merely because:

- the component crossed an arbitrary line count
- a JSX block looks visually large
- a linter permits another file
- every function must do exactly one microscopic thing
- another codebase uses compound components
- a pattern has recently acquired a conference talk

Keep related code together when separation would destroy locality.

Small components can remain in the same file.

Markup that expresses one coherent widget can remain inline.

A private helper can remain private.

A component should earn its boundary by naming something, owning something, isolating something, or structuring something.

The goal is not maximum decomposition.

The goal is truthful decomposition.

## Think in trees, not layers

React architecture begins before state-management libraries, memoization strategies, folder conventions, and controller Hooks.

It begins by looking at an interface and asking:

- What are the things here?
- Which things contain other things?
- Which parts change independently?
- Which region owns each interaction?
- Which state belongs to the URL?
- Which data belongs to the server cache?
- Which behavior touches an external system?
- Which boundaries are real enough to deserve names?

A page is rarely one thing.

It is usually a tree hiding in a rectangle.

Idiomatic React makes that tree visible.

Its components correspond to recognizable regions. Its state settles near meaningful owners. Its routes extend the tree into navigation. Its providers establish understandable scopes. Its Hooks compose behavior without pretending to create structural boundaries. Its Effects sit near the edges, where React meets something outside itself.

When React code follows this grain, parent components begin to read like outlines:

```tsx
function ProjectRoute() {
  return (
    <ProjectLayout>
      <ProjectHeader />
      <ProjectNavigation />

      <ProjectContent>
        <Outlet />
      </ProjectContent>

      <ProjectSidebar />
    </ProjectLayout>
  )
}
```

That code is not empty ceremony.

It is an architectural map.

The map says what exists, what contains what, and where the application expects responsibility to live.

A layered backend asks which technical tier should perform the work.

React asks where in the living interface the work belongs.

The general principle still travels: separate responsibilities, preserve cohesion, make boundaries meaningful.

Its implementation does not.

In React, architecture has geometry.

And its native shape is a tree.

By contrast, in the next article, we will explore how good TypeScript can become almost invisible.


### Sources and further reading

- React: [Thinking in React](https://react.dev/learn/thinking-in-react).
- React: [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).
- TanStack Query: [Does This Replace Client State?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state).
- React: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).
- React Router: [Routing and nested routes](https://reactrouter.com/start/framework/routing).
- React: [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context).
- React: [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).
