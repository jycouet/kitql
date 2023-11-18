import { expect, it } from 'vitest'
import { color } from './index.js'

it('color NOT in browser', () => {
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
