import React, { useState } from 'react';
import { TodoItem, TodoistConfig } from '@/types';
import { extractTime, extractDueForTodoist } from '@/utils/todoUtils';
import { useTodoistSync, requestTodoistPermission } from '@/hooks/useTodoistSync';

interface TodoWidgetProps {
    tasks: TodoItem[];
    setTasks: (tasks: TodoItem[]) => void;
    todoistConfig: TodoistConfig;
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({ tasks, setTasks, todoistConfig }) => {
    const [newTaskText, setNewTaskText] = useState('');

    const todoist = useTodoistSync(todoistConfig);
    const isTodoistMode = todoistConfig.enabled && !!todoistConfig.apiKey;

    const effectiveTasks = isTodoistMode ? todoist.tasks : tasks;

    const toggleTask = (id: number | string) => {
        if (isTodoistMode) {
            const task = todoist.tasks.find(t => t.id === id);
            if (task) todoist.toggleTask(String(id), task.done);
        } else {
            setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
        }
    };

    const removeTask = (e: React.MouseEvent, id: number | string) => {
        e.stopPropagation();
        if (isTodoistMode) {
            todoist.removeTask(String(id));
        } else {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;

        const { text, due } = isTodoistMode
            ? extractDueForTodoist(newTaskText)
            : extractTime(newTaskText);

        if (isTodoistMode) {
            todoist.addTask(text, due);
        } else {
            const newTask: TodoItem = {
                id: Date.now(),
                text: text,
                done: false,
                due: due
            };
            setTasks([...tasks, newTask]);
        }
        setNewTaskText('');
    };

    const doneCount = effectiveTasks.filter(t => t.done).length;

    return (
        <div className="h-full flex flex-col">
            <div className="text-[var(--color-muted)] mb-2 text-xs flex justify-between">
                <span>{effectiveTasks.length - doneCount} remaining</span>
                <span>
                    {isTodoistMode && todoist.loading && <span className="opacity-60">syncing... </span>}
                    {doneCount} done
                </span>
            </div>

            {isTodoistMode && todoist.error && (
                <div className="text-red-500 text-[10px] mb-1 opacity-80">
                    todoist: {todoist.error}
                </div>
            )}

            {isTodoistMode && todoist.needsPermission && (
                <div className="flex-1 flex items-center justify-center">
                    <button
                        onClick={async () => {
                            const granted = await requestTodoistPermission();
                            if (granted) todoist.refetch();
                        }}
                        className="border border-[var(--color-border)] text-[var(--color-accent)] px-3 py-1 text-xs hover:bg-[var(--color-hover)]"
                    >
                        [ GRANT TODOIST ACCESS ]
                    </button>
                </div>
            )}

            <ul className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {effectiveTasks.length === 0 && !todoist.loading && (
                    <li className="text-[var(--color-muted)] italic text-sm py-2 text-center opacity-50">
                        {isTodoistMode ? 'no tasks in todoist' : 'empty list...'}
                    </li>
                )}
                {effectiveTasks.length === 0 && isTodoistMode && todoist.loading && (
                    <li className="text-[var(--color-muted)] italic text-sm py-2 text-center opacity-50">
                        syncing...
                    </li>
                )}
                {effectiveTasks.map(task => (
                    <li
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`
                            group mb-1 flex items-center justify-between cursor-pointer transition-colors duration-200 py-1
                            ${task.done ? 'text-[var(--color-muted)]' : 'text-[var(--color-fg)] hover:text-[var(--color-accent)]'}
                        `}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                             <span className="font-mono shrink-0 select-none">
                                {task.done ? '[x]' : '[ ]'}
                            </span>
                            <span className={`truncate ${task.done ? 'line-through' : ''}`}>{task.text}</span>
                            {task.due && !task.done && (
                                <span className="ml-auto text-[10px] border border-[var(--color-muted)] px-1.5 py-0.5 rounded text-[var(--color-accent)] opacity-80 whitespace-nowrap">
                                    due {task.due}
                                </span>
                            )}
                            {task.due && task.done && (
                                 <span className="ml-auto text-[10px] opacity-50 whitespace-nowrap">
                                    {task.due}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={(e) => removeTask(e, task.id)}
                            className="opacity-0 group-hover:opacity-100 text-[var(--color-muted)] hover:text-red-500 px-2 shrink-0"
                        >
                            x
                        </button>
                    </li>
                ))}
            </ul>

            <form onSubmit={addTask} className="mt-2 pt-2 border-t border-[var(--color-border)] flex gap-2">
                <span className="text-[var(--color-accent)] font-bold">{'>'}</span>
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="add task (e.g. 'meet john 2pm')"
                    className="w-full bg-transparent border-none outline-none text-[var(--color-fg)] placeholder-[var(--color-muted)] text-sm select-text"
                />
            </form>
        </div>
    );
};
