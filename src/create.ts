import { Command } from 'commander'
import inquirer from 'inquirer'
import { app_gen } from './generator/gen.app'
import path from 'path'



export const create_command = (program: Command) => {
	program.command('create')
		.description('Create a new project for Pinup API')
		.argument('<name>', 'project name')
		.option('-m, --mkdir', 'make dir for project')
		.action((name, options) => {
			inquirer.prompt([
				{
					type: 'confirm',
					name: 'git',
					message: 'Would you like to init git control version?',
				},
				{
					type: 'confirm',
					name: 'auth',
					message: 'Would you like to add jwt auth?',
				},
				{
					type: 'input',
					name: 'auth_secret',
					message: 'Set jwt auth secret key: ',
					default: 'secret',
					when: (answers) => answers.auth
				},	
				{
					type: 'list',
					name: 'auth_experience_in',
					message: 'Choose jwt auth experience time: ',
					choices: ['custom', '1m', '10m', '1h', '12h', '1d', '3d', '1w'],
					default: '1d',
					when: (answers) => answers.auth_secret
				},
				{
					type: 'input',
					name: 'auth_experience_in_custom',
					message: 'Set jwt auth experience time: ',
					default: '1d',
					when: (answers) => answers.auth_experience_in == 'custom'
				},
				{
					type: 'confirm',
					name: 'init_components',
					message: 'Would you like to add init components?',
					default: false
				},
				{
					type: 'input',
					name: 'init_components_list',
					message: 'Type base components (space as separator):',
					when: (answers) => answers.init_components,
				},
				{
					type: 'confirm',
					name: 'init_components_views',
					message: 'Would you like to apply views to components',
					when: (answers) => answers.init_components_list,
				},
				

			]).then((answers) => {
				app_gen(path.join(process.cwd(), options.mkdir ? name : ''), {
					name,
					components_dir: `./${'components'}`,
					git: answers.git,
					auth: {
						secret: answers.auth_secret || null,
						exp_in: answers.auth_experience_in == 'custom' ? answers.auth_experience_in_custom : answers.auth_experience_in,
					},
					components: {
						list: answers.init_components_list ? answers.init_components_list?.split(' ') : null,
						views: answers.init_components_views
					}
				})
			})
		})
}