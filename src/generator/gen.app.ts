import { exec } from 'child_process'
import axios from 'axios'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export type TemplateInputType = {
	name: string
	components_dir?: string
	git: boolean
	auth: {
		secret: string | null,
		exp_in: string
	},
	components: {
		list: string[],
		views: boolean
	}
}
const gist_urls = {
	files: 'https://api.github.com/gists/fa091189e1ddbd7128ed1d14c8e6fda3',
	cli: 'https://api.github.com/gists/55853e9865f162798903a59cb142c47e'
}

const get_setup_files = async (curr_dir: string, input: TemplateInputType) => {
	const request = await axios({
		url: gist_urls.files,
		method: 'get'
	})

	const files = request?.data?.files
	const entries_of_files: [string, any][] = Object.entries(files)
	const auth = input.auth.secret ? {
		auth: {
			secret: input.auth.secret,
			expires_in: input.auth.exp_in
		}
	} : {}

	const config = {
		...{
			port: 3300,
			provider_dir: ['./components'],
		}, ...auth
	}

	for (const item of entries_of_files) {
		if (item[0] == 'component.ts' || item[0] == 'view.ts') continue
		console.log(`✔ ${item[0]}`)
		const file_path = path.resolve(path.join(curr_dir, item[0]))
		const template = item[1].content
			.replaceAll('%NAME%', input.name)
			.replaceAll('%CONFIG%', JSON.stringify(config, null, 2))

		await writeFile(file_path, template)
	}

	if (input.components.list)
		for (let component of input.components.list) {
			component = component.toLowerCase()
			console.log(`   - ✔ ${component}.ts`)
			const component_path = path.join(curr_dir, 'components', component)
			try {
				await mkdir(path.resolve(component_path))
			} catch (error) {
				console.log(`[${error.message}]`)
			}

			const file_path = path.resolve(path.join(component_path, component + '.component.ts'))
			const template = files['component.ts'].content
				.replaceAll('%NAME%', input.name)
				.replaceAll('%COMPONENT_NAME%', component)
				.replaceAll('%_COMPONENT_NAME%', component.charAt(0).toUpperCase() + component.slice(1))
			try {
				await writeFile(file_path, template)
			} catch (error) {
				console.log(`[${error.message}]`)
			}
			if (input.components.views) {
				const file_path = path.resolve(component_path, component + '.view.ts')
				const template = files['view.ts'].content
					.replaceAll('%NAME%', input.name)
					.replaceAll('%COMPONENT_NAME%', component)
				try {
					await writeFile(file_path, template)
				} catch (error) {
					console.log(`[${error.message}]`)
				}
			}
		}
}

const set_structure = async (curr_dir: string, input: TemplateInputType) => {
	try {
		await mkdir(path.resolve(path.join(curr_dir)))
	} catch (error) {
		console.log(`[${error.message}]`)
	}
	try {
		await mkdir(path.resolve(path.join(curr_dir, input.components_dir || 'components')))
	} catch (error) {
		console.log(`[${error.message}]`)
	}
}

const spinner = (callback: (res, rej) => void, message = '') => {
	const promise = new Promise((res, rej) => {
		callback(res, rej)
	})
	const P = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
	let o = 0
	const loader = setInterval(() => {
		process.stdout.write(`\r${P[o++]}${message}`)
		o %= P.length
	}, 80)

	promise.then(() => {
		clearInterval(loader)
		process.stdout.write(`\r${message}`)
		process.stdout.write('\n')
	}).catch(() => {
		clearInterval(loader)
		process.stdout.write(`\r${message}`)
		process.stdout.write('\n')
	})
}

const set_commands = async (curr_dir:string, input: TemplateInputType) => {
	const request = await axios({
		url: gist_urls.cli,
		method: 'get'
	})
	const files = request?.data?.files
	const entries_of_files: [string, any][] = Object.entries(files)
	for (const item of entries_of_files) {
		process.stdout.write(`✔ ${item[0]}`)
		const command_raw: string = item[1].content
			.replaceAll('%CURR_DIR%', curr_dir)
		const description = command_raw.matchAll(/{{([\S\s]+)}}/gm).next().value[1]
		const command = command_raw.replaceAll(/{{([\S\s]+)}}/gm, '')
		if(item[0] == '.pinup-git' && !input.git) {
			process.stdout.write(`\r❌ ${item[0]}\n`)
			continue
		}else 
			process.stdout.write('\n')
		spinner((res) => {
			exec(command, () => {
				res(null)
			})
		}, description)
	}

}

export const app_gen = async (curr_dir: string, input: TemplateInputType) => {
	console.log(`Downloading template files...\nURL::${gist_urls.files}`)
	console.log(`Downloading commands...\nURL::${gist_urls.cli}`)
	await set_structure(curr_dir, input)
	await get_setup_files(curr_dir, input)
	console.log('Downloading complete')
	console.log('Setting commands...')
	await set_commands(curr_dir, input)
}
