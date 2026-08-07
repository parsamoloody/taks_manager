export interface TaskOrderItem {
  id: string;
  listId: string;
  order: number;
}

export interface BuildTaskOrderPlanInput {
  sourceListId: string;
  sourceTasks: TaskOrderItem[];
  targetListId: string;
  targetTasks: TaskOrderItem[];
  movedTaskId: string;
  targetOrder: number;
}

export function buildTaskOrderPlan(input: BuildTaskOrderPlanInput) {
  const sourceItems = input.sourceTasks.slice().sort((a, b) => a.order - b.order);
  const targetItems = input.targetTasks.slice().sort((a, b) => a.order - b.order);
  const moved = sourceItems.find((item) => item.id === input.movedTaskId);

  if (!moved) {
    return [...sourceItems, ...targetItems];
  }

  if (input.sourceListId === input.targetListId) {
    const withoutMoved = sourceItems.filter((item) => item.id !== input.movedTaskId);
    const reordered = [
      ...withoutMoved.slice(0, input.targetOrder),
      moved,
      ...withoutMoved.slice(input.targetOrder),
    ];

    return reordered.map((item, index) => ({ ...item, order: index + 1 }));
  }

  const sourceWithoutMoved = sourceItems.filter((item) => item.id !== input.movedTaskId);
  const targetWithoutMoved = targetItems.filter((item) => item.id !== input.movedTaskId);
  const nextItems = [
    ...targetWithoutMoved.slice(0, input.targetOrder),
    { ...moved, listId: input.targetListId },
    ...targetWithoutMoved.slice(input.targetOrder),
  ];

  const sourceReindexed = sourceWithoutMoved.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
  const targetReindexed = nextItems.map((item, index) => ({
    ...item,
    order: index + 1,
  }));

  return [...sourceReindexed, ...targetReindexed];
}
