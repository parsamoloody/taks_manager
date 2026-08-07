import { buildTaskOrderPlan } from './task-ordering';

describe('buildTaskOrderPlan', () => {
  it('reorders tasks within the same list and keeps the moved task in the chosen slot', () => {
    const sourceTasks = [
      { id: 'task-1', listId: 'list-a', order: 1 },
      { id: 'task-2', listId: 'list-a', order: 2 },
      { id: 'task-3', listId: 'list-a', order: 3 },
    ];

    const plan = buildTaskOrderPlan({
      sourceListId: 'list-a',
      sourceTasks,
      targetListId: 'list-a',
      targetTasks: [],
      movedTaskId: 'task-2',
      targetOrder: 0,
    });

    expect(plan).toEqual([
      { id: 'task-2', listId: 'list-a', order: 1 },
      { id: 'task-1', listId: 'list-a', order: 2 },
      { id: 'task-3', listId: 'list-a', order: 3 },
    ]);
  });

  it('moves a task to a different list and reindexes both lists', () => {
    const sourceTasks = [
      { id: 'task-1', listId: 'list-a', order: 1 },
      { id: 'task-2', listId: 'list-a', order: 2 },
    ];
    const targetTasks = [
      { id: 'task-3', listId: 'list-b', order: 1 },
      { id: 'task-4', listId: 'list-b', order: 2 },
    ];

    const plan = buildTaskOrderPlan({
      sourceListId: 'list-a',
      sourceTasks,
      targetListId: 'list-b',
      targetTasks,
      movedTaskId: 'task-2',
      targetOrder: 1,
    });

    expect(plan).toEqual([
      { id: 'task-1', listId: 'list-a', order: 1 },
      { id: 'task-3', listId: 'list-b', order: 1 },
      { id: 'task-2', listId: 'list-b', order: 2 },
      { id: 'task-4', listId: 'list-b', order: 3 },
    ]);
  });
});
