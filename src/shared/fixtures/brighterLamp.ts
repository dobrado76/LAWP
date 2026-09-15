import type { WorldV1 } from '../schemas/world'

export const brighterLampWorld: WorldV1 = {
  parts: [
    { id: 'battery', type: 'battery', props: { cells: 1 } },
    { id: 'resistor', type: 'resistor', props: { ohms: 2 } },
    { id: 'lamp', type: 'lamp', props: { brightness: 1, label: 'Lamp' } },
    { id: 'meter', type: 'meter', props: { current: 0.5 } }
  ],
  connections: [
    { from: 'battery', to: 'resistor' },
    { from: 'resistor', to: 'lamp' },
    { from: 'lamp', to: 'battery' }
  ],
  actions: [
    {
      id: 'set-ohms',
      label: 'Set resistance',
      target: 'resistor',
      op: 'set',
      key: 'ohms',
      values: [0, 0.25, 1, 2, 4]
    }
  ],
  rules: [
    {
      id: 'i-from-lookup',
      when: [],
      set: [{ target: 'meter', key: 'current', value: { op: 'div', a: 'battery.cells', b: 'resistor.ohms' } }]
    },
    {
      id: 'bright-from-i',
      when: [{ path: 'meter.current', op: 'gte', value: 1 }],
      set: [{ target: 'lamp', key: 'brightness', value: 2 }]
    },
    {
      id: 'dim-from-i',
      when: [{ path: 'meter.current', op: 'lt', value: 1 }],
      set: [{ target: 'lamp', key: 'brightness', value: 1 }]
    }
  ],
  view: {
    kind: 'graph',
    assetMap: {
      'lamp@brightness=1': 'assets/lamp-dim.svg',
      'lamp@brightness=2': 'assets/lamp-bright.svg',
      battery: 'assets/battery.svg',
      resistor: 'assets/resistor.svg',
      meter: 'assets/meter.svg'
    }
  }
}

export const brighterLampGoal = { all: [{ path: 'lamp.brightness', op: 'eq' as const, value: 2 }] }
export const brighterLampConstraints = [{ path: 'meter.current', op: 'lte' as const, value: 2 }]
