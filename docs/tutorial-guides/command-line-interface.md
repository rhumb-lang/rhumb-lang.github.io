---
sidebar_position: 2
draft: true
---

# Command Line Interface

Create your own CLI in Rhumb.

Taking inspiration from Next.js and SvelteKit, Rhumb can create a CLI for you. By treating the file system itself as the configuration layer, Rhumb provides a flexible and intuitive way to build powerful command-line tools.

## Starting Simple

First we need to make our CLI project.

```bash
mkdir my-cli
cd my-cli
mkdir command-name
touch +index.rh  # The entrypoint for a folder is +filename
touch config.rh  # Sub-commands are determined by the filename
mkdir user       # Sub-commands can be nested
touch +index.rh  # The entrypoint for a folder is +filename
touch create.rh  # Sub-sub-command
touch delete.rh  # Sub-sub-command

rho command-name # Runs +index.rh
rho command-name --help # Auto-generated help
rho command-name user --help # Auto-generated help for sub-commands
rho command-name user create --help # Auto-generated help for sub-sub-commands
rho command-name user delete --help # Auto-generated help for sub-sub-commands
```

## Adding Arguments

To handle positional arguments, surround a folder name with [square brackets].

```bash
mkdir command-name
cd command-name
mkdir -p user/[id]
touch user/[id]/+index.rh
touch user/[id]/update.rh
touch user/[id]/profile.rh
```

If a user executes `rho command-name user 123 profile`, the `id` label will be set to `"123"` and the `profile` file will be executed. The default is the file prefixed with `+` in a folder, so if a user executes `rho command-name user 123`, the `+index.rh` file will be executed.

## Adding Options

To handle command-line options, you add a file named with square brackets surrounding the label and inside the file is where you can handle that option. If the file just contains a block comment, it will be used as the help text for that option.

```bash
mkdir -p command-name/[id]
touch command-name/[id]/+command.rh
touch command-name/[id]/[role].rh
touch command-name/[id]/[force].rh
```

```rhumb title="command-name/[id]/[role].rh"
?role[^] == ""[^] /\ ~(
  ?role == "admin"
  \/ ?role == "user"
  \/ ?role == "support"
) => ***("Invalid role")

```

```rhumb title="command-name/[id]/[force].rh"
?force[?] =>
  ?force[^] ~~ yes[^] =>
    ***("Force must be yes or no")

```

```rhumb title="command-name/[id]/+command.rh"
?role == "admin"
  && (?force[?] ~> ?force ~~ yes) =>
    ***("You muse use --force when acting as an admin")

```

Options are available to all sub-folders in the directory tree under the folder where the option file is located. Add your global options to the root and local options to the deepest folder that needs them.

## Generating Documentation

The first comment block in a file is used to generate documentation for that command or option. For example, consider this file:

```rhumb title="command-name/[id]/+index.rh"
%(
  This command will list the users in the system.
%)
...
```
