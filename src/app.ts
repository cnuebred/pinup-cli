#! /usr/bin/env node

import { Command } from 'commander'
import figlet from 'figlet'
import { create_command } from './create'


const app = () => {
	console.log(figlet.textSync('|| Pinup CLI ||', 'Pagga'))
	console.log()
	const program = new Command()
	program.description('Pinup API creator - CLI tool')
		.version('1.0.0')

	create_command(program)
	program.parse(process.argv)
}

app()

