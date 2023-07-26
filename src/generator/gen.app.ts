import {exec} from 'child_process'
import axios from 'axios'
import { mkdir, rm, writeFile } from 'fs/promises'
import path from 'path'

export type TemplateInputType = {
    name: string
    components_dir?: string
    git:boolean
    auth: {
        secret: string | null,
        exp_in: string
    },
    components: {
        list: string[],
        views: boolean
    }
}
const gist_url = 'https://api.github.com/gists/fa091189e1ddbd7128ed1d14c8e6fda3'

const get_setup_files = async (curr_dir:string, input: TemplateInputType) => {
	const request = await axios({
		url: gist_url,
		method: 'get'
	})

	const files = request?.data?.files
	const entries_of_files: [string, any][] = Object.entries(files)
	const auth = input.auth.secret ? {auth: {
		secret: input.auth.secret,
		expires_in: input.auth.exp_in
	}} : {}

	const config = {...{
		port: 3300,
		provider_dir: ['./components'],
	}, ...auth}    

	for(const item of entries_of_files) {
		if(item[0] == 'component.ts' || item[0] == 'view.ts') continue
		console.log(`✔ ${item[0]}`)
		const file_path = path.resolve(path.join(curr_dir, item[0]))
		const template = item[1].content
			.replaceAll('%NAME%', input.name)
			.replaceAll('%CONFIG%', JSON.stringify(config, null, 2))
            
		await writeFile(file_path, template)
	}
        
	if(input.components.list)
		for(let component of input.components.list) {
			component = component.toLowerCase()
			console.log(`   - ✔ ${component}.ts`)
			const component_path = path.join(curr_dir, 'components', component)
			try{
				await mkdir(path.resolve(component_path))
			} catch (error){
				console.log(`[${error.message}]`)
			}
            
			const file_path = path.resolve(path.join(component_path, component + '.component.ts'))
			const template = files['component.ts'].content
				.replaceAll('%NAME%', input.name)
				.replaceAll('%COMPONENT_NAME%', component)
				.replaceAll('%_COMPONENT_NAME%', component.charAt(0).toUpperCase() + component.slice(1))
			try{
				await writeFile(file_path, template)
			} catch (error){
				console.log(`[${error.message}]`)
			}
			if(input.components.views){
				const file_path = path.resolve(component_path, component + '.view.ts')
				const template = files['view.ts'].content
					.replaceAll('%NAME%', input.name)
					.replaceAll('%COMPONENT_NAME%', component)
				try{
					await writeFile(file_path, template)
				} catch (error){
					console.log(`[${error.message}]`)
				}
			}
		}
}

const set_structure = async(curr_dir: string, input: TemplateInputType) => {
	try{
		await mkdir(path.resolve(path.join(curr_dir)))
	} catch (error){
		console.log(`[${error.message}]`)
	}
	try{
		await mkdir(path.resolve(path.join(curr_dir, input.components_dir || 'components')))
	} catch (error){
		console.log(`[${error.message}]`)
	}
}


const spinner = ( callback: (res, rej) => any, message = '') => {
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

export const app_gen = async (curr_dir: string, input: TemplateInputType) => {
	console.log(`Downloading template files...\nURL::${gist_url}`)
	await set_structure(curr_dir, input)
	await get_setup_files(curr_dir, input)
	console.log('Downloading complete')

	spinner((res) => {
		exec(`cd ${curr_dir} && npm i`, (error, stdout, stderr) => {
			res(null)
		})
	}, ' Installing dependencies...')

	if(input.git)
		spinner((res) => {
			exec(`cd ${curr_dir} && git init`, (error, stdout, stderr) => {
				res(null)
			})
		}, ' Initializing git repository...')
}
