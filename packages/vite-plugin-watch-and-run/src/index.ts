import micromatch from 'micromatch';
import { spawn } from 'child_process';

type FileOperation = 'add' | 'change' | 'delete';

function getGreen(str) {
	return '\x1b[32m' + str + '\x1b[0m';
}

function getRed(str) {
	return '\u001B[31m' + str + '\x1b[0m';
}

function getBlue(str) {
	return '\u001B[34m' + str + '\x1b[0m';
}

function log(str) {
	console.log(`${getBlue('[vite-plugin-watch-and-run]')} ${str}`);
}

export type Options = {
	/**
	 * watch files to trigger the run action (glob format)
	 */
	watch: string;
	/**
	 * run command (yarn gen for example!)
	 */
	run: string;
	/**
	 * Delay before running the run command (in ms) (default to 500ms if not set)
	 */
	delay?: number | null;
	/**
	 * Operations for which the command should run (default to all - add, change, delete)
	 */
	operations?: FileOperation[];
};

export type StateDetail = {
	run: string;
	delay: number;
	isRunnig: boolean;
	operations: FileOperation[];
};

function checkConf(params: Options[]) {
	if (!Array.isArray(params)) {
		throw new Error('plugin watchAndRun, `params` needs to be an array.');
	}

	let paramsChecked: Record<string, StateDetail> = {};

	for (let i = 0; i < params.length; i++) {
		const param = params[i];
		if (!param.watch) {
			throw new Error('plugin watch-and-run, `watch` is missing.');
		}
		if (!param.run) {
			throw new Error('plugin watch-and-run, `run` is missing.');
		}

		paramsChecked[param.watch] = {
			run: param.run,
			delay: param.delay ?? 500,
			isRunnig: false,
			operations: param.operations
		};
	}

	return paramsChecked;
}

export default function watchAndRun(params: Options[]) {
	// check params, throw Errors if not valid and return a new object representing the state of the plugin
	let watchAndRunConf = checkConf(params);

	return {
		name: 'watch-and-run', // this name will show up in warnings and errors

		watchAndRunConf,

		configureServer(server) {
			const watcher = async (absolutePath: string, operation: FileOperation) => {
				for (const globToWatch in watchAndRunConf) {
					const param = watchAndRunConf[globToWatch];
					if (!param.operations?.includes(operation)) return;
					if (!param.isRunnig && micromatch.isMatch(absolutePath, globToWatch)) {
						watchAndRunConf[globToWatch].isRunnig = true;

						log(
							`${getGreen('✔')} Thx to ${getGreen(globToWatch)}, ` +
								`triggered by ${getGreen(absolutePath)}, ` +
								`we will wait ${param.delay}ms and run ${getGreen(param.run)}.`
						);

						// Run after a delay
						setTimeout(() => {
							var child = spawn(param.run, [], { shell: true });

							//spit stdout to screen
							child.stdout.on('data', function (data) {
								process.stdout.write(data.toString());
							});

							//spit stderr to screen
							child.stderr.on('data', function (data) {
								process.stdout.write(data.toString());
							});

							child.on('close', function (code) {
								if (code === 0) {
									log(`${getGreen('✔')} finished ${getGreen('successfully')}`);
								} else {
									log(`${'❌'} finished with some ${getRed('errors')}`);
								}
								param.isRunnig = false;
							});

							return;
						}, param.delay);
					}
				}

				return;
			};

			// Vite file watcher
			server.watcher.on('add', (absolutePath: string) => watcher(absolutePath, 'add'));
			server.watcher.on('change', (absolutePath: string) => watcher(absolutePath, 'change'));
			server.watcher.on('delete', (absolutePath: string) => watcher(absolutePath, 'delete'));
		}
	};
}
