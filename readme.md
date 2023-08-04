Pinup CLI
=========

![npm version](https://img.shields.io/npm/v/pinup-cli.svg) ![npm downloads](https://img.shields.io/npm/dw/pinup-cli.svg)

A command-line interface (CLI) tool for creating and managing Pinup API projects.

Installation
------------

To install the Pinup CLI, use npm:

    npm install -g pinup-cli

Usage
-----

    pinup create <name> [options]

Create a new project for Pinup API.

### Options

*   `-m, --mkdir`: Make a directory for the project.
*   `-h, --help`: Display help for command.

Getting Started
---------------

1.  Install the Pinup CLI globally using the above installation command.
2.  Create a new Pinup API project:

    pinup create my-api

3.  Follow the interactive prompts to configure your project. You can choose to initialize Git control, add JWT authentication, and initialize components.
4.  Once the setup is complete, the Pinup CLI will create the necessary project files and setup commands.

Project Structure
-----------------

The generated project will have the following structure:
```js
my-api
├── components
│   └── [component-name]
│       ├── [component-name].component.ts
│       └── [component-name].view.ts
├── package.json
└── ...other project files
```

Commands
--------
- `create [options] <name>` -   Create a new project for Pinup API 
- `help [command]`  -   display help for command

Contributing
------------

Contributions are welcome! Feel free to open issues and submit pull requests on the [GitHub repository](https://github.com/cnuebred/pinup-cli).