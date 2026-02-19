import React, { useState } from 'react';
import { TodoItem } from '../types';
import { extractTime } from '../utils/todoUtils';

interface TodoWidgetProps {
    tasks: TodoItem[];
    setTasks: (tasks: TodoItem[]) => void;
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({ tasks, setTasks }) => {
    const [newTaskText, setNewTaskText] = useState('');

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const removeTask = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setTasks(tasks.filter(t => t.id !== id));
    }

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;

        const { text, due } = extractTime(newTaskText);

        const newTask: TodoItem = {
            id: Date.now(),
            text: text,
            done: false,
            due: due
        };

        setTasks([...tasks, newTask]);
        setNewTaskText('');
    };

    const doneCount = tasks.filter(t => t.done).length;

    return (
        <div className="h-full flex flex-col">
            <div className="text-[var(--color-muted)] mb-2 text-xs flex justify-between">
                <span>{tasks.length - doneCount} remaining</span>
                <span>{doneCount} done</span>
            </div>
            
            <ul className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {tasks.length === 0 && (
                    <li className="text-[var(--color-muted)] italic text-sm py-2 text-center opacity-50">
                        empty list...
                    </li>
                )}
                {tasks.map(task => (
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