import { expect, it } from 'vitest'

import { color, colorBrowserProcess } from '../src/colors'

const msg = (isBrowser: boolean) => `with all options: 
    ${color('reset', 'reset', isBrowser)}
    ${color('bold', 'bold', isBrowser)}
    ${color('dim', 'dim', isBrowser)}
    ${color('italic', 'italic', isBrowser)}
    ${color('underline', 'underline', isBrowser)}
    ${color('inverse', 'inverse', isBrowser)}
    ${color('hidden', 'hidden', isBrowser)}
    ${color('strikethrough', 'strikethrough', isBrowser)}
    ${color('black', 'black', isBrowser)}
    ${color('red', 'red', isBrowser)}
    ${color('green', 'green', isBrowser)}
    ${color('yellow', 'yellow', isBrowser)}
    ${color('blue', 'blue', isBrowser)}
    ${color('magenta', 'magenta', isBrowser)}
    ${color('cyan', 'cyan', isBrowser)}
    ${color('white', 'white', isBrowser)}
    ${color('gray', 'gray', isBrowser)}
    ${color('bgBlack', 'bgBlack', isBrowser)}
    ${color('bgRed', 'bgRed', isBrowser)}
    ${color('bgGreen', 'bgGreen', isBrowser)}
    ${color('bgYellow', 'bgYellow', isBrowser)}
    ${color('bgBlue', 'bgBlue', isBrowser)}
    ${color('bgMagenta', 'bgMagenta', isBrowser)}
    ${color('bgCyan', 'bgCyan', isBrowser)}
    ${color('bgWhite', 'bgWhite', isBrowser)}
    ${color('blackBright', 'blackBright', isBrowser)}
    ${color('redBright', 'redBright', isBrowser)}
    ${color('greenBright', 'greenBright', isBrowser)}
    ${color('yellowBright', 'yellowBright', isBrowser)}
    ${color('blueBright', 'blueBright', isBrowser)}
    ${color('magentaBright', 'magentaBright', isBrowser)}
    ${color('cyanBright', 'cyanBright', isBrowser)}
    ${color('whiteBright', 'whiteBright', isBrowser)}
    ${color('bgBlackBright', 'bgBlackBright', isBrowser)}
    ${color('bgRedBright', 'bgRedBright', isBrowser)}
    ${color('bgGreenBright', 'bgGreenBright', isBrowser)}
    ${color('bgYellowBright', 'bgYellowBright', isBrowser)}
    ${color('bgBlueBright', 'bgBlueBright', isBrowser)}
    ${color('bgMagentaBright', 'bgMagentaBright', isBrowser)}
    ${color('bgCyanBright', 'bgCyanBright', isBrowser)}
    ${color('bgWhiteBright', 'bgWhiteBright', isBrowser)}
`
it('yop', () => {
  const message = msg(false)
  console.log(`msg`, message)
  expect(message).toMatchInlineSnapshot(`
    "with all options: 
        [0mreset[0m
        [1mbold[22m
        [2mdim[22m
        [3mitalic[23m
        [4munderline[24m
        [7minverse[27m
        [8mhidden[28m
        [9mstrikethrough[29m
        [30mblack[39m
        [31mred[39m
        [32mgreen[39m
        [33myellow[39m
        [34mblue[39m
        [35mmagenta[39m
        [36mcyan[39m
        [37mwhite[39m
        [90mgray[39m
        [40mbgBlack[49m
        [41mbgRed[49m
        [42mbgGreen[49m
        [43mbgYellow[49m
        [44mbgBlue[49m
        [45mbgMagenta[49m
        [46mbgCyan[49m
        [47mbgWhite[49m
        [90mblackBright[39m
        [91mredBright[39m
        [92mgreenBright[39m
        [93myellowBright[39m
        [94mblueBright[39m
        [95mmagentaBright[39m
        [96mcyanBright[39m
        [97mwhiteBright[39m
        [100mbgBlackBright[49m
        [101mbgRedBright[49m
        [102mbgGreenBright[49m
        [103mbgYellowBright[49m
        [104mbgBlueBright[49m
        [105mbgMagentaBright[49m
        [106mbgCyanBright[49m
        [107mbgWhiteBright[49m
    "
  `)
})

it('yop', () => {
  const message = msg(true)
  console.log(`msg`, message)
  expect(message).toMatchInlineSnapshot(`
    "with all options: 
        $$KitQL_reset$$KitQL_reset$$KitQLEND$$
        $$KitQL_bold$$KitQL_bold$$KitQLEND$$
        $$KitQL_dim$$KitQL_dim$$KitQLEND$$
        $$KitQL_italic$$KitQL_italic$$KitQLEND$$
        $$KitQL_underline$$KitQL_underline$$KitQLEND$$
        $$KitQL_inverse$$KitQL_inverse$$KitQLEND$$
        $$KitQL_hidden$$KitQL_hidden$$KitQLEND$$
        $$KitQL_strikethrough$$KitQL_strikethrough$$KitQLEND$$
        $$KitQL_black$$KitQL_black$$KitQLEND$$
        $$KitQL_red$$KitQL_red$$KitQLEND$$
        $$KitQL_green$$KitQL_green$$KitQLEND$$
        $$KitQL_yellow$$KitQL_yellow$$KitQLEND$$
        $$KitQL_blue$$KitQL_blue$$KitQLEND$$
        $$KitQL_magenta$$KitQL_magenta$$KitQLEND$$
        $$KitQL_cyan$$KitQL_cyan$$KitQLEND$$
        $$KitQL_white$$KitQL_white$$KitQLEND$$
        $$KitQL_gray$$KitQL_gray$$KitQLEND$$
        $$KitQL_bgBlack$$KitQL_bgBlack$$KitQLEND$$
        $$KitQL_bgRed$$KitQL_bgRed$$KitQLEND$$
        $$KitQL_bgGreen$$KitQL_bgGreen$$KitQLEND$$
        $$KitQL_bgYellow$$KitQL_bgYellow$$KitQLEND$$
        $$KitQL_bgBlue$$KitQL_bgBlue$$KitQLEND$$
        $$KitQL_bgMagenta$$KitQL_bgMagenta$$KitQLEND$$
        $$KitQL_bgCyan$$KitQL_bgCyan$$KitQLEND$$
        $$KitQL_bgWhite$$KitQL_bgWhite$$KitQLEND$$
        $$KitQL_blackBright$$KitQL_blackBright$$KitQLEND$$
        $$KitQL_redBright$$KitQL_redBright$$KitQLEND$$
        $$KitQL_greenBright$$KitQL_greenBright$$KitQLEND$$
        $$KitQL_yellowBright$$KitQL_yellowBright$$KitQLEND$$
        $$KitQL_blueBright$$KitQL_blueBright$$KitQLEND$$
        $$KitQL_magentaBright$$KitQL_magentaBright$$KitQLEND$$
        $$KitQL_cyanBright$$KitQL_cyanBright$$KitQLEND$$
        $$KitQL_whiteBright$$KitQL_whiteBright$$KitQLEND$$
        $$KitQL_bgBlackBright$$KitQL_bgBlackBright$$KitQLEND$$
        $$KitQL_bgRedBright$$KitQL_bgRedBright$$KitQLEND$$
        $$KitQL_bgGreenBright$$KitQL_bgGreenBright$$KitQLEND$$
        $$KitQL_bgYellowBright$$KitQL_bgYellowBright$$KitQLEND$$
        $$KitQL_bgBlueBright$$KitQL_bgBlueBright$$KitQLEND$$
        $$KitQL_bgMagentaBright$$KitQL_bgMagentaBright$$KitQLEND$$
        $$KitQL_bgCyanBright$$KitQL_bgCyanBright$$KitQLEND$$
        $$KitQL_bgWhiteBright$$KitQL_bgWhiteBright$$KitQLEND$$
    "
  `)

  expect(colorBrowserProcess(message)).toMatchInlineSnapshot(`
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
