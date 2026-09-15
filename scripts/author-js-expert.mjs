import { lessonsC0C3 } from './js-curriculum/c0-c3.mjs'
import { lessonsC4C6 } from './js-curriculum/c4-c6.mjs'
import { lessonsC7C9 } from './js-curriculum/c7-c9.mjs'
import { lessonsC10C11 } from './js-curriculum/c10-c11.mjs'
import { writeLesson } from './js-curriculum/lib.mjs'

const all = [...lessonsC0C3(), ...lessonsC4C6(), ...lessonsC7C9(), ...lessonsC10C11()]
for (const { doc, files } of all) writeLesson(doc, files)
console.log(`Wrote ${all.length} lessons`)
