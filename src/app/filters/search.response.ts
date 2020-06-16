export const SERVER_SIDE_FILTERS = [
  {
    value: 'Parent1',
    active: false,
    lookupValue: 'parent1',
    children: [
      {
        value: 'Parent1Child1',
        active: true,
        lookupValue: 'parent1child1',
        children: [],
      },
      {
        value: 'Fails to activate',
        active: false,
        lookupValue: 'fail-to-activate',
        children: [],
      },
    ],
  },
  {
    value: 'Parent2',
    active: false,
    lookupValue: 'parent2',
    children: [
      {
        value: 'Parent2Child1',
        active: false,
        lookupValue: 'parent2child1',
        children: [],
      },
      {
        value: 'Fails to deactivate',
        active: true,
        lookupValue: 'fail-to-deactivate',
        children: [],
      },
    ],
  },
];
