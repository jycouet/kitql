import { beforeEach, describe, expect, it, vi } from 'vitest'

import { color, colorProcess, red } from './index.js'

describe('browser', () => {
	beforeEach(() => {
		vi.mock('esm-env', () => ({
			BROWSER: true,
		}))
	})

	it('color in browser', () => {
		import.meta.env.SSR = false

		const message = `with all options:
${color('reset', 'reset')}
${color('bold', 'bold')}
${color('dim', 'dim')}
${color('italic', 'italic')}
${color('underline', 'underline')}
${color('inverse', 'inverse')}
${color('hidden', 'hidden')}
${color('strikethrough', 'strikethrough')}
${color('black', 'black')}
${color('red', 'red')}
${color('green', 'green')}
${color('yellow', 'yellow')}
${color('blue', 'blue')}
${color('magenta', 'magenta')}
${color('cyan', 'cyan')}
${color('white', 'white')}
${color('gray', 'gray')}
${color('bgBlack', 'bgBlack')}
${color('bgRed', 'bgRed')}
${color('bgGreen', 'bgGreen')}
${color('bgYellow', 'bgYellow')}
${color('bgBlue', 'bgBlue')}
${color('bgMagenta', 'bgMagenta')}
${color('bgCyan', 'bgCyan')}
${color('bgWhite', 'bgWhite')}
${color('blackBright', 'blackBright')}
${color('redBright', 'redBright')}
${color('greenBright', 'greenBright')}
${color('yellowBright', 'yellowBright')}
${color('blueBright', 'blueBright')}
${color('magentaBright', 'magentaBright')}
${color('cyanBright', 'cyanBright')}
${color('whiteBright', 'whiteBright')}
${color('bgBlackBright', 'bgBlackBright')}
${color('bgRedBright', 'bgRedBright')}
${color('bgGreenBright', 'bgGreenBright')}
${color('bgYellowBright', 'bgYellowBright')}
${color('bgBlueBright', 'bgBlueBright')}
${color('bgMagentaBright', 'bgMagentaBright')}
${color('bgCyanBright', 'bgCyanBright')}
${color('bgWhiteBright', 'bgWhiteBright')}
`
		// console.log(`msg`, message)
		expect(message).toMatchInlineSnapshot(`
    "with all options:
    $$KitQL_reset_KitQL$$reset$$KitQLEND$$
    $$KitQL_bold_KitQL$$bold$$KitQLEND$$
    $$KitQL_dim_KitQL$$dim$$KitQLEND$$
    $$KitQL_italic_KitQL$$italic$$KitQLEND$$
    $$KitQL_underline_KitQL$$underline$$KitQLEND$$
    $$KitQL_inverse_KitQL$$inverse$$KitQLEND$$
    $$KitQL_hidden_KitQL$$hidden$$KitQLEND$$
    $$KitQL_strikethrough_KitQL$$strikethrough$$KitQLEND$$
    $$KitQL_black_KitQL$$black$$KitQLEND$$
    $$KitQL_red_KitQL$$red$$KitQLEND$$
    $$KitQL_green_KitQL$$green$$KitQLEND$$
    $$KitQL_yellow_KitQL$$yellow$$KitQLEND$$
    $$KitQL_blue_KitQL$$blue$$KitQLEND$$
    $$KitQL_magenta_KitQL$$magenta$$KitQLEND$$
    $$KitQL_cyan_KitQL$$cyan$$KitQLEND$$
    $$KitQL_white_KitQL$$white$$KitQLEND$$
    $$KitQL_gray_KitQL$$gray$$KitQLEND$$
    $$KitQL_bgBlack_KitQL$$bgBlack$$KitQLEND$$
    $$KitQL_bgRed_KitQL$$bgRed$$KitQLEND$$
    $$KitQL_bgGreen_KitQL$$bgGreen$$KitQLEND$$
    $$KitQL_bgYellow_KitQL$$bgYellow$$KitQLEND$$
    $$KitQL_bgBlue_KitQL$$bgBlue$$KitQLEND$$
    $$KitQL_bgMagenta_KitQL$$bgMagenta$$KitQLEND$$
    $$KitQL_bgCyan_KitQL$$bgCyan$$KitQLEND$$
    $$KitQL_bgWhite_KitQL$$bgWhite$$KitQLEND$$
    $$KitQL_blackBright_KitQL$$blackBright$$KitQLEND$$
    $$KitQL_redBright_KitQL$$redBright$$KitQLEND$$
    $$KitQL_greenBright_KitQL$$greenBright$$KitQLEND$$
    $$KitQL_yellowBright_KitQL$$yellowBright$$KitQLEND$$
    $$KitQL_blueBright_KitQL$$blueBright$$KitQLEND$$
    $$KitQL_magentaBright_KitQL$$magentaBright$$KitQLEND$$
    $$KitQL_cyanBright_KitQL$$cyanBright$$KitQLEND$$
    $$KitQL_whiteBright_KitQL$$whiteBright$$KitQLEND$$
    $$KitQL_bgBlackBright_KitQL$$bgBlackBright$$KitQLEND$$
    $$KitQL_bgRedBright_KitQL$$bgRedBright$$KitQLEND$$
    $$KitQL_bgGreenBright_KitQL$$bgGreenBright$$KitQLEND$$
    $$KitQL_bgYellowBright_KitQL$$bgYellowBright$$KitQLEND$$
    $$KitQL_bgBlueBright_KitQL$$bgBlueBright$$KitQLEND$$
    $$KitQL_bgMagentaBright_KitQL$$bgMagentaBright$$KitQLEND$$
    $$KitQL_bgCyanBright_KitQL$$bgCyanBright$$KitQLEND$$
    $$KitQL_bgWhiteBright_KitQL$$bgWhiteBright$$KitQLEND$$
    "
  `)

		expect(colorProcess(message)).toMatchInlineSnapshot(`
    [
      "with all options:
    %creset%c
    %cbold%c
    %cdim%c
    %citalic%c
    %cunderline%c
    %cinverse%c
    %chidden%c
    %cstrikethrough%c
    %cblack%c
    %cred%c
    %cgreen%c
    %cyellow%c
    %cblue%c
    %cmagenta%c
    %ccyan%c
    %cwhite%c
    %cgray%c
    %cbgBlack%c
    %cbgRed%c
    %cbgGreen%c
    %cbgYellow%c
    %cbgBlue%c
    %cbgMagenta%c
    %cbgCyan%c
    %cbgWhite%c
    %cblackBright%c
    %credBright%c
    %cgreenBright%c
    %cyellowBright%c
    %cblueBright%c
    %cmagentaBright%c
    %ccyanBright%c
    %cwhiteBright%c
    %cbgBlackBright%c
    %cbgRedBright%c
    %cbgGreenBright%c
    %cbgYellowBright%c
    %cbgBlueBright%c
    %cbgMagentaBright%c
    %cbgCyanBright%c
    %cbgWhiteBright%c
    ",
      "",
      "",
      "font-weight: bold",
      "",
      "opacity: 0.5",
      "",
      "font-style: italic",
      "",
      "text-decoration: underline",
      "",
      "filter: invert(1)",
      "",
      "visibility: hidden",
      "",
      "text-decoration: line-through",
      "",
      "color: black",
      "",
      "color: red",
      "",
      "color: green",
      "",
      "color: yellow",
      "",
      "color: blue",
      "",
      "color: #ff00ff",
      "",
      "color: cyan",
      "",
      "color: white",
      "",
      "color: gray",
      "",
      "background-color: black",
      "",
      "background-color: red",
      "",
      "background-color: green",
      "",
      "background-color: yellow",
      "",
      "background-color: blue",
      "",
      "background-color: #ff00ff",
      "",
      "background-color: cyan",
      "",
      "background-color: white",
      "",
      "color: #a9a9a9",
      "",
      "color: #ff4500",
      "",
      "color: #7fff00",
      "",
      "color: #ffd700",
      "",
      "color: #1e90ff",
      "",
      "color: #ff69b4",
      "",
      "color: #00ffff",
      "",
      "color: #ffffff",
      "",
      "background-color: #a9a9a9",
      "",
      "background-color: #ff4500",
      "",
      "background-color: #7fff00",
      "",
      "background-color: #ffd700",
      "",
      "background-color: #1e90ff",
      "",
      "background-color: #ff69b4",
      "",
      "background-color: #00ffff",
      "",
      "background-color: #ffffff",
      "",
    ]
  `)
	})

	it('2 color red browser', () => {
		const msg = `with red: ${red('red')} and another ${red('red2')}`

		expect(msg).toMatchInlineSnapshot(
			'"with red: $$KitQL_red_KitQL$$red$$KitQLEND$$ and another $$KitQL_red_KitQL$$red2$$KitQLEND$$"',
		)

		expect(colorProcess(msg)).toMatchInlineSnapshot(`
      [
        "with red: %cred%c and another %cred2%c",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
	})
})
