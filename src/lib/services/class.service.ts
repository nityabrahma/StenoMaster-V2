
import { classes as initialClasses } from '@/lib/data';
import type { Class } from '@/lib/types';

const classes: Class[] = [...initialClasses];

export async function getAllClasses(): Promise<Class[]> {
    return new Promise(resolve => resolve(classes));
}

export async function createClass(data: Omit<Class, 'id'>): Promise<Class> {
    const newClass: Class = {
        ...data,
        id: `class-${Date.now()}`,
    };
    classes.push(newClass);
    return new Promise(resolve => resolve(newClass));
}

export async function updateClass(id: string, data: Partial<Omit<Class, 'id'>>): Promise<Class> {
    const classIndex = classes.findIndex(c => c.id === id);

    if (classIndex === -1) {
        throw new Error('Class not found');
    }

    const updatedClass = { ...classes[classIndex], ...data } as Class;
    classes[classIndex] = updatedClass;

    return new Promise(resolve => resolve(updatedClass));
}
