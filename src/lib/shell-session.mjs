import {
  clearScreenDown,
  cursorTo,
  emitKeypressEvents,
  moveCursor,
} from 'node:readline'
import { executeShellCommand } from './shell.mjs'
import {
  filterShellMenuCommands,
  moveShellMenuSelection,
  renderShellMenu,
} from './shell-menu.mjs'

function visibleLength(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, '').length
}

function insertAt(value, cursor, addition) {
  return `${value.slice(0, cursor)}${addition}${value.slice(cursor)}`
}

export function runInteractiveShellSession({
  input,
  output,
  target,
  configPath = null,
  color = false,
  language = 'en',
  env = process.env,
  prompt,
}) {
  emitKeypressEvents(input)
  const wasRaw = Boolean(input.isRaw)
  input.setRawMode(true)
  input.resume()

  let buffer = ''
  let cursor = 0
  let selectedIndex = 0
  let menuSuppressed = false
  let submenuParent = null
  const promptLength = visibleLength(prompt)

  return new Promise((resolve) => {
    function candidates() {
      return filterShellMenuCommands(buffer, submenuParent)
    }

    function menuVisible() {
      return buffer.startsWith('/') && !menuSuppressed
    }

    function clearFrame() {
      cursorTo(output, 0)
      clearScreenDown(output)
    }

    function redraw() {
      clearFrame()
      output.write(`${prompt}${buffer}`)

      if (!menuVisible()) {
        cursorTo(output, promptLength + cursor)
        return
      }

      const menu = renderShellMenu(buffer, selectedIndex, { color, language, parentName: submenuParent })
      const lineCount = menu.split('\n').length
      output.write(`\n${menu}`)
      moveCursor(output, 0, -lineCount)
      cursorTo(output, promptLength + cursor)
    }

    function resetInput() {
      buffer = ''
      cursor = 0
      selectedIndex = 0
      menuSuppressed = false
      submenuParent = null
    }

    function cleanup() {
      input.removeListener('keypress', onKeypress)
      input.removeListener('end', onEnd)
      input.setRawMode(wasRaw)
      input.pause()
    }

    function closeSession(message = 'Riscala shell closed.') {
      clearFrame()
      output.write(`${message}\n`)
      cleanup()
      resolve({ exitCode: 0 })
    }

    function executeCurrent() {
      const matches = candidates()
      if (menuVisible() && matches.length > 0) {
        const selected = matches[Math.min(selectedIndex, matches.length - 1)]
        if (selected.children) {
          submenuParent = selected.name
          buffer = `${selected.name} `
          cursor = buffer.length
          selectedIndex = 0
          redraw()
          return
        }
        buffer = selected.name
        cursor = buffer.length
        if (submenuParent && !selected.execute) {
          submenuParent = null
          menuSuppressed = true
          redraw()
          return
        }
      }

      clearFrame()
      output.write(`${prompt}${buffer}\n`)
      const result = executeShellCommand(buffer, {
        target,
        configPath,
        color,
        language,
        env,
      })
      if (result.language) language = result.language

      if (result.output) {
        output.write(`${result.output}\n`)
      }

      if (result.exit) {
        cleanup()
        resolve({ exitCode: 0 })
        return
      }

      resetInput()
      output.write(`\n${prompt}`)
    }

    function changeBuffer(nextBuffer, nextCursor) {
      buffer = nextBuffer
      cursor = nextCursor
      selectedIndex = 0
      menuSuppressed = false
      redraw()
    }

    function onKeypress(text, key = {}) {
      if (key.ctrl && key.name === 'c') {
        closeSession('^C\nRiscala shell closed.')
        return
      }

      if (key.ctrl && key.name === 'd' && buffer.length === 0) {
        closeSession()
        return
      }

      if (key.name === 'return' || key.name === 'enter') {
        executeCurrent()
        return
      }

      if (key.name === 'escape') {
        if (submenuParent) {
          buffer = '/'
          cursor = 1
          selectedIndex = 0
          submenuParent = null
          redraw()
          return
        }
        resetInput()
        redraw()
        return
      }

      if (key.name === 'up' && menuVisible()) {
        selectedIndex = moveShellMenuSelection(selectedIndex, 'previous', candidates().length)
        redraw()
        return
      }

      if (key.name === 'down' && menuVisible()) {
        selectedIndex = moveShellMenuSelection(selectedIndex, 'next', candidates().length)
        redraw()
        return
      }

      if (key.name === 'tab' && menuVisible()) {
        const matches = candidates()
        if (matches.length > 0) {
          const selected = matches[Math.min(selectedIndex, matches.length - 1)].name
          buffer = selected
          cursor = selected.length
          selectedIndex = 0
          submenuParent = null
          menuSuppressed = true
          redraw()
        }
        return
      }

      if (key.name === 'right' && menuVisible()) {
        const selected = candidates()[Math.min(selectedIndex, candidates().length - 1)]
        if (selected?.children) {
          submenuParent = selected.name
          buffer = `${selected.name} `
          cursor = buffer.length
          selectedIndex = 0
          redraw()
          return
        }
      }

      if (key.name === 'left' && submenuParent) {
        buffer = '/'
        cursor = 1
        selectedIndex = 0
        submenuParent = null
        redraw()
        return
      }

      if (key.name === 'backspace' && cursor > 0) {
        changeBuffer(`${buffer.slice(0, cursor - 1)}${buffer.slice(cursor)}`, cursor - 1)
        return
      }

      if (key.name === 'delete' && cursor < buffer.length) {
        changeBuffer(`${buffer.slice(0, cursor)}${buffer.slice(cursor + 1)}`, cursor)
        return
      }

      if (key.name === 'left') {
        cursor = Math.max(0, cursor - 1)
        redraw()
        return
      }

      if (key.name === 'right') {
        cursor = Math.min(buffer.length, cursor + 1)
        redraw()
        return
      }

      if (key.name === 'home') {
        cursor = 0
        redraw()
        return
      }

      if (key.name === 'end') {
        cursor = buffer.length
        redraw()
        return
      }

      const printableText = typeof text === 'string'
        && text.length > 0
        && !/[\u0000-\u001F\u007F]/u.test(text)
      if (!key.ctrl && !key.meta && printableText) {
        submenuParent = null
        changeBuffer(insertAt(buffer, cursor, text), cursor + text.length)
      }
    }

    function onEnd() {
      closeSession()
    }

    input.on('keypress', onKeypress)
    input.once('end', onEnd)
  })
}
