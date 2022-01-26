import minimatch from 'minimatch';
import path from 'path';
import { spawn } from 'child_process';

function getGreen(str) {
	return '\x1b[32m' + str + '\x1b[0m';
}

function getRed(str) {
	return '\u001B[31m' + str + '\x1b[0m';
}

export default function watchAndRun(
	{ watch, run, delay }: { watch: string | null; run: string | null; delay: number | null } = {
		watch: null,
		run: null,
		delay: 1000
	}
) {
	if (!watch) {
		throw new Error('plugin watchAndRun, `watch` is missing.');
	}
	if (!run) {
		throw new Error('plugin watchAndRun, `run` is missing.');
	}

	delay = delay || 1000;

	return {
		name: 'watch-and-run', // this name will show up in warnings and errors

		configureServer(server) {
			let isRunning = false;

			const watcher = async absolutePath => {
				// Do we need to run?
				let pathToWatch = watch.startsWith('*') ? watch : path.join(server.config.root, watch);
				if (!minimatch(absolutePath, pathToWatch, { matchBase: true })) {
					isRunning = false;
					return;
				}

				// Let's say that we are running even if it's not true yet!
				if (isRunning) {
					return;
				}
				isRunning = true;
				// Run after a delay
				setTimeout(() => {
					let pathToWatch = watch.startsWith('*') ? watch : path.join(server.config.root, watch);
					if (!minimatch(absolutePath, pathToWatch, { matchBase: true })) {
						isRunning = false;
						return;
					}

					var child = spawn(run, [], { shell: true });

					//spit stdout to screen
					child.stdout.on('data', function(data) {
						process.stdout.write(data.toString());
					});

					//spit stderr to screen
					child.stderr.on('data', function(data) {
						process.stdout.write(data.toString());
					});

					child.on('close', function(code) {
						console.log('');
						if (code === 0) {
							console.log(`  ${getGreen('✔')} watch-and-run finished ${getGreen('successfully')}`);
						} else {
							console.log(`  ${'❌'} watch-and-run finished with some ${getRed('errors')}`);
						}
						isRunning = false;
					});

					return;
				}, delay);
			};

			// Vite file watcher
			server.watcher.on('add', watcher);
			server.watcher.on('change', watcher);
			server.watcher.on('delete', watcher);
		}
	};
}
