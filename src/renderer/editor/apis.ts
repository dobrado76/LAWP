export type EditorApi = 'player-v1' | 'dom-v1'

export type DomMember = {
  args?: string
  info: string
  sample: string
  apply?: string
  type?: 'function' | 'property' | 'class'
}

export const PLAYER_DIRS = ['north', 'south', 'east', 'west'] as const

/** `python` overrides the blurb where the two languages genuinely differ. */
export type PlayerMethod = { args: string; info: string; sample: string; python?: { info?: string; sample?: string } }

export const PLAYER_METHODS: Record<string, PlayerMethod> = {
  move: {
    args: '"north" | "south" | "east" | "west"',
    info: 'Walk one cell. Rocks block. The edge clamps.',
    sample: 'Player.move("east")'
  },
  rotate: {
    args: '90',
    info: 'Turn in 90° steps.',
    sample: 'Player.rotate(90)'
  },
  scale: {
    args: '1 | 2',
    info: 'Set size. Only values the lesson allows.',
    sample: 'Player.scale(2)'
  },
  say: {
    args: '"…"',
    info: 'Show a label on the stage.',
    sample: 'Player.say("ready")'
  },
  wait: {
    args: 'ticks',
    info: 'Pause replay that many ticks. Returns a Promise. The fox does not move.',
    sample: 'await Player.wait(2)',
    python: { info: 'Pause replay that many ticks. The fox does not move.', sample: 'Player.wait(2)' }
  }
}

export type PlayerLanguage = 'javascript' | 'python'

export function playerMethodFor(name: string, language: PlayerLanguage): PlayerMethod | undefined {
  const spec = PLAYER_METHODS[name]
  if (!spec || language !== 'python' || !spec.python) return spec
  return { ...spec, info: spec.python.info ?? spec.info, sample: spec.python.sample ?? spec.sample }
}

export const DOM_DOCUMENT: Record<string, DomMember> = {
  querySelector: {
    args: 'selector',
    info: 'Find the first node that matches a CSS selector. Returns an element or null.',
    sample: 'document.querySelector("#beacon-name")',
    apply: 'querySelector(',
    type: 'function'
  },
  querySelectorAll: {
    args: 'selector',
    info: 'Find every matching node. Returns a NodeList, not an array.',
    sample: 'document.querySelectorAll("li")',
    apply: 'querySelectorAll(',
    type: 'function'
  },
  getElementById: {
    args: 'id',
    info: 'Find one node by its id. No # in the argument.',
    sample: 'document.getElementById("beacon-name")',
    apply: 'getElementById(',
    type: 'function'
  },
  createElement: {
    args: 'tag',
    info: 'Make a new element. It is not on the page until you append it.',
    sample: 'document.createElement("li")',
    apply: 'createElement(',
    type: 'function'
  },
  createTextNode: {
    args: 'text',
    info: 'Make a text node. Safer than stuffing HTML into innerHTML.',
    sample: 'document.createTextNode("North")',
    apply: 'createTextNode(',
    type: 'function'
  },
  body: {
    info: 'The <body> element. The page tree starts here.',
    sample: 'document.body',
    type: 'property'
  },
  documentElement: {
    info: 'The <html> root element.',
    sample: 'document.documentElement',
    type: 'property'
  },
  head: {
    info: 'The <head> element — titles, styles, meta.',
    sample: 'document.head',
    type: 'property'
  },
  addEventListener: {
    args: 'type, handler',
    info: 'Listen for a browser event on the document.',
    sample: 'document.addEventListener("click", handler)',
    apply: 'addEventListener(',
    type: 'function'
  },
  removeEventListener: {
    args: 'type, handler',
    info: 'Stop listening. The handler must be the same function you added.',
    sample: 'document.removeEventListener("click", handler)',
    apply: 'removeEventListener(',
    type: 'function'
  }
}

export const DOM_ELEMENT: Record<string, DomMember> = {
  textContent: {
    info: 'The plain text inside this node. Prefer this for words the learner types.',
    sample: 'el.textContent = "North"',
    type: 'property'
  },
  innerHTML: {
    info: 'HTML markup inside this node. Use only when you mean to add tags.',
    sample: 'el.innerHTML = "<strong>North</strong>"',
    type: 'property'
  },
  innerText: {
    info: 'Visible text, layout-aware. Prefer textContent unless you need what the user sees.',
    sample: 'el.innerText',
    type: 'property'
  },
  id: {
    info: 'The id attribute. Select it later with #id.',
    sample: 'el.id = "beacon-name"',
    type: 'property'
  },
  className: {
    info: 'The class attribute as one string. classList is easier for add/remove.',
    sample: 'el.className = "desk"',
    type: 'property'
  },
  classList: {
    info: 'The set of classes. After the dot: add, remove, toggle, contains.',
    sample: 'el.classList.add("on")',
    type: 'property'
  },
  style: {
    info: 'Inline CSS. After the dot: display, color, and other properties.',
    sample: 'el.style.display = "none"',
    type: 'property'
  },
  value: {
    info: 'The current value of an input, textarea, or select.',
    sample: 'input.value',
    type: 'property'
  },
  checked: {
    info: 'Whether a checkbox or radio is on.',
    sample: 'input.checked',
    type: 'property'
  },
  hidden: {
    info: 'Hide or show the node without deleting it.',
    sample: 'el.hidden = true',
    type: 'property'
  },
  disabled: {
    info: 'Whether a control can be used.',
    sample: 'button.disabled = true',
    type: 'property'
  },
  getAttribute: {
    args: 'name',
    info: 'Read one HTML attribute as a string, or null if missing.',
    sample: 'el.getAttribute("id")',
    apply: 'getAttribute(',
    type: 'function'
  },
  setAttribute: {
    args: 'name, value',
    info: 'Write one HTML attribute.',
    sample: 'el.setAttribute("id", "beacon-name")',
    apply: 'setAttribute(',
    type: 'function'
  },
  removeAttribute: {
    args: 'name',
    info: 'Remove one HTML attribute.',
    sample: 'el.removeAttribute("hidden")',
    apply: 'removeAttribute(',
    type: 'function'
  },
  hasAttribute: {
    args: 'name',
    info: 'True if that attribute is present.',
    sample: 'el.hasAttribute("hidden")',
    apply: 'hasAttribute(',
    type: 'function'
  },
  append: {
    args: 'node | text',
    info: 'Put nodes or text at the end of this element.',
    sample: 'list.append(item)',
    apply: 'append(',
    type: 'function'
  },
  prepend: {
    args: 'node | text',
    info: 'Put nodes or text at the start of this element.',
    sample: 'list.prepend(item)',
    apply: 'prepend(',
    type: 'function'
  },
  appendChild: {
    args: 'node',
    info: 'Put one node at the end. Prefer append when you can.',
    sample: 'list.appendChild(item)',
    apply: 'appendChild(',
    type: 'function'
  },
  remove: {
    args: '',
    info: 'Take this node off the page.',
    sample: 'el.remove()',
    apply: 'remove()',
    type: 'function'
  },
  replaceChildren: {
    args: 'nodes',
    info: 'Replace every child with the arguments (or empty the node).',
    sample: 'list.replaceChildren()',
    apply: 'replaceChildren(',
    type: 'function'
  },
  querySelector: {
    args: 'selector',
    info: 'Find the first matching descendant, or null.',
    sample: 'el.querySelector("span")',
    apply: 'querySelector(',
    type: 'function'
  },
  querySelectorAll: {
    args: 'selector',
    info: 'Find every matching descendant.',
    sample: 'el.querySelectorAll("li")',
    apply: 'querySelectorAll(',
    type: 'function'
  },
  closest: {
    args: 'selector',
    info: 'Walk up to the nearest ancestor that matches, or null.',
    sample: 'el.closest("form")',
    apply: 'closest(',
    type: 'function'
  },
  matches: {
    args: 'selector',
    info: 'True if this node itself matches the selector.',
    sample: 'el.matches("button")',
    apply: 'matches(',
    type: 'function'
  },
  addEventListener: {
    args: 'type, handler',
    info: 'Listen for a click, submit, input, and so on.',
    sample: 'el.addEventListener("click", handler)',
    apply: 'addEventListener(',
    type: 'function'
  },
  removeEventListener: {
    args: 'type, handler',
    info: 'Stop listening. Same function reference you added.',
    sample: 'el.removeEventListener("click", handler)',
    apply: 'removeEventListener(',
    type: 'function'
  },
  children: {
    info: 'Live list of child elements (not text nodes).',
    sample: 'el.children',
    type: 'property'
  },
  firstElementChild: {
    info: 'The first child that is an element, or null.',
    sample: 'el.firstElementChild',
    type: 'property'
  },
  parentElement: {
    info: 'The parent element, or null at the root.',
    sample: 'el.parentElement',
    type: 'property'
  },
  nextElementSibling: {
    info: 'The next element at the same level, or null.',
    sample: 'el.nextElementSibling',
    type: 'property'
  },
  focus: {
    args: '',
    info: 'Move keyboard focus to this control.',
    sample: 'input.focus()',
    apply: 'focus()',
    type: 'function'
  },
  click: {
    args: '',
    info: 'Fire a click as if the user pressed it.',
    sample: 'button.click()',
    apply: 'click()',
    type: 'function'
  }
}

export const DOM_CLASSLIST: Record<string, DomMember> = {
  add: { args: 'name', info: 'Add a class. Safe if it is already there.', sample: 'el.classList.add("on")', apply: 'add(', type: 'function' },
  remove: { args: 'name', info: 'Remove a class. Safe if it is missing.', sample: 'el.classList.remove("on")', apply: 'remove(', type: 'function' },
  toggle: { args: 'name', info: 'Add the class if it is off, remove it if it is on.', sample: 'el.classList.toggle("on")', apply: 'toggle(', type: 'function' },
  contains: { args: 'name', info: 'True if that class is present.', sample: 'el.classList.contains("on")', apply: 'contains(', type: 'function' }
}

export const DOM_STYLE: Record<string, DomMember> = {
  display: { info: 'Layout mode. "none" hides the node.', sample: 'el.style.display = "none"', type: 'property' },
  color: { info: 'Text color.', sample: 'el.style.color = "#1a3d38"', type: 'property' },
  background: { info: 'Background color or image.', sample: 'el.style.background = "#f3efe6"', type: 'property' },
  visibility: { info: '"hidden" hides the node but keeps its space.', sample: 'el.style.visibility = "hidden"', type: 'property' },
  fontSize: { info: 'Text size. Use a string with units.', sample: 'el.style.fontSize = "18px"', type: 'property' }
}

export const DOM_EVENT: Record<string, DomMember> = {
  preventDefault: {
    args: '',
    info: 'Stop the browser’s default action (form submit, link navigation).',
    sample: 'event.preventDefault()',
    apply: 'preventDefault()',
    type: 'function'
  },
  stopPropagation: {
    args: '',
    info: 'Stop the event from bubbling to parents.',
    sample: 'event.stopPropagation()',
    apply: 'stopPropagation()',
    type: 'function'
  },
  target: { info: 'The node that was actually clicked or changed.', sample: 'event.target', type: 'property' },
  currentTarget: { info: 'The node whose listener is running (the one you attached to).', sample: 'event.currentTarget', type: 'property' },
  type: { info: 'The event name: click, submit, input.', sample: 'event.type', type: 'property' }
}

export const DOM_NODELIST: Record<string, DomMember> = {
  forEach: {
    args: 'fn',
    info: 'Call a function for each node. Not a real array — no map/filter.',
    sample: 'nodes.forEach((el) => el.remove())',
    apply: 'forEach(',
    type: 'function'
  },
  length: { info: 'How many nodes matched.', sample: 'nodes.length', type: 'property' },
  item: { args: 'index', info: 'The node at that index, or null.', sample: 'nodes.item(0)', apply: 'item(', type: 'function' }
}

export const DOM_EVENT_TYPES = [
  'click',
  'submit',
  'input',
  'change',
  'keydown',
  'keyup',
  'focus',
  'blur',
  'pointerdown'
] as const

export const DOM_TAGS = ['div', 'span', 'p', 'h1', 'h2', 'button', 'input', 'ul', 'li', 'form', 'label', 'a', 'option'] as const

export const DOM_ROOT: DomMember = {
  info: 'The page document. After the dot: querySelector, body, createElement.',
  sample: 'document.querySelector("h1")',
  type: 'class'
}
